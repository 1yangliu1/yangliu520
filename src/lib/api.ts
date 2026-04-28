import { SYSTEM_PROMPTS, SAFETY_SETTINGS } from '../constants';
import { FuncType, Message } from '../types';

const GEMINI_API_BASE_URL = 'https://yunwu.ai/v1beta/models';

function buildGeminiRequestBody(messages: Message[], func: FuncType, subFunc?: string, isImageModel?: boolean) {
  const contents = messages.map((m) => {
    const parts: any[] = [{ text: m.content }];
    if (m.images && m.images.length > 0) {
      m.images.forEach(img => {
        const mimeTypeMatch = img.match(/^data:([^;]+);base64,/);
        const base64Data = img.replace(/^data:.*?;base64,/, '');
        if (base64Data && mimeTypeMatch) {
          if (isImageModel || func === 'yellowImage') {
            parts.push({ inline_data: { data: base64Data, mime_type: mimeTypeMatch[1] } });
          } else {
            parts.push({ inlineData: { data: base64Data, mimeType: mimeTypeMatch[1] } });
          }
        }
      });
    }
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts,
    };
  });

  if (func === 'yellowImage' || isImageModel) {
    let extractedRatio = '1:1';
    let extractedResolution = '1K';
    let apiAspectRatio = '1:1';
    
    // Extract ratio and resolution and inject them as explicit English prompt parts if possible
    contents.forEach(content => {
      content.parts.forEach(part => {
        if (part.text) {
          const match = part.text.match(/【要求：比例 ([^，]*)，分辨率 ([^，]*)，质量 ([^，]*)(?:，数量 ([^】]*))?】/);
          if (match) {
            extractedRatio = match[1];
            const resolution = match[2];
            const quality = match[3];
            part.text = part.text.replace(/【要求：.*?】\s*/, '');
            
            // Map resolution to imageSize string for Gemini
            if (resolution === '4k' || resolution === '4K') extractedResolution = '4K';
            else if (resolution === '2k' || resolution === '2K') extractedResolution = '2K';
            else if (resolution === '1080p') extractedResolution = '1K';
            else if (resolution === '720p') extractedResolution = '1K';
            else extractedResolution = '1K'; // Force 1K as it's definitely supported.

            // Only allowed Aspect Ratios for Gemini 2.5 Flash are "1:1", "3:4", "4:3", "9:16", "16:9"
            apiAspectRatio = extractedRatio;
            if (!['1:1', '3:4', '4:3', '9:16', '16:9'].includes(apiAspectRatio)) {
               apiAspectRatio = '16:9'; // Fallback for the API parameter
            }

            let enhancements = "";
            if (extractedRatio) enhancements += `Aspect ratio ${extractedRatio}.`;
            if (resolution) {
              if (resolution === '4k') enhancements += ", 4k extremely high resolution, masterpiece details";
              else if (resolution === '2k') enhancements += ", 2k high resolution, highly detailed";
              else if (resolution === '1080p') enhancements += ", 1080p hd resolution";
              else enhancements += `, ${resolution} resolution`;
            }
            if (quality === 'hd') enhancements += ", ultra high definition, intricate details, best quality";
            if (enhancements) {
               part.text += enhancements;
            }
          }
        }
      });
    });

    return {
      contents,
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: apiAspectRatio,
          imageSize: extractedResolution
        }
      }
    };
  }

  let systemPrompt = SYSTEM_PROMPTS[func] || SYSTEM_PROMPTS.chat;

  if (func === 'drama' && subFunc) {
    systemPrompt += `\n\n【重要指令】用户已选择功能：${subFunc}。请直接跳过步骤1的询问，直接开始执行该功能的步骤2。`;
  }
  
  if (func === 'seedance' && subFunc === '素材提取') {
    systemPrompt = SYSTEM_PROMPTS.material_extraction;
  }

  return {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
      role: 'user',
    },
    safetySettings: SAFETY_SETTINGS,
    tools: [],
    generationConfig: {
      temperature: 1,
      topP: 1,
      thinkingConfig: {
        includeThoughts: true,
        thinkingBudget: 26240,
      },
    },
  };
}

export async function callGeminiStreamAPI(
  messages: Message[],
  func: FuncType,
  modelId: string,
  apiKey: string,
  subFunc: string | undefined,
  onChunk: (text: string) => void,
  onThinking: (text: string) => void,
  signal: AbortSignal
) {
  if (!apiKey) {
    throw new Error('请先在侧边栏输入 API Key');
  }

  const apiUrl = `${GEMINI_API_BASE_URL}/${modelId}:streamGenerateContent?key=${apiKey}&alt=sse`;
  const body = buildGeminiRequestBody(messages, func, subFunc);
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  };

  const response = await fetch(apiUrl, fetchOptions);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errMsg = `API错误: ${response.status}`;
    try {
      const errData = JSON.parse(errText);
      if (errData?.error?.message) {
        errMsg = errData.error.message;
        if (errMsg.includes('NO_IMAGE')) {
          errMsg = '图片生成失败(NO_IMAGE)：可能触发了安全拦截或遇到了内部错误，请修改提示词或稍后再试。';
        }
      }
    } catch (e) {
      if (errText) errMsg += ' - ' + errText.slice(0, 200);
    }
    throw new Error(errMsg);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');
  const decoder = new TextDecoder();
  let fullText = '';
  let thinkingText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data:')) {
          const jsonStr = trimmedLine.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.thought) {
                if (typeof part.thought === 'string') {
                  thinkingText += part.thought;
                  onThinking(thinkingText);
                } else if (part.text && part.text !== 'true') {
                  thinkingText += part.text;
                  onThinking(thinkingText);
                }
              } else if (part.reasoning_content) {
                thinkingText += part.reasoning_content;
                onThinking(thinkingText);
              } else if (part.text && part.text !== 'true') {
                fullText += part.text;
                onChunk(fullText);
              }
            }
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
              console.error('JSON parse error or API error:', e);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return { text: fullText, thinking: thinkingText };
}

async function callYunwuImageAPI(messages: Message[], modelId: string, apiKey: string, signal?: AbortSignal) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) throw new Error('No user message found');
  
  const images: string[] = [];
  messages.forEach(m => {
    if (m.role === 'user' && m.images) {
      images.push(...m.images);
    }
  });

  let prompt = lastUserMsg.content;
  let ratio = '1:1';
  let quality = 'standard';
  let resolution = '1080p';
  let count = 1;
  
  const match = prompt.match(/【要求：比例 ([^，]*)，分辨率 ([^，]*)，质量 ([^，]*)(?:，数量 ([^】]*))?】/);
  if (match) {
    ratio = match[1];
    resolution = match[2];
    quality = match[3];
    count = parseInt(match[4], 10) || 1;
    prompt = prompt.replace(/【要求：.*?】\s*/, '');
    
    if (resolution) {
      if (resolution === '4k') prompt += "，4k极高分辨率，大师级画质，细节极其丰富";
      else if (resolution === '2k') prompt += "，2k高分辨率，优质画面，细节出大";
      else if (resolution === '1080p') prompt += "，1080p高清分辨率，细节清晰";
      else if (resolution === '720p') prompt += "，720p分辨率";
      else prompt += `，${resolution}分辨率`;
    }

    if (quality === 'hd') {
      prompt += "，请生成超高清质量的图片，注重光影和极其丰富的细节。";
    } else if (quality === 'standard') {
      prompt += "，标准质量。";
    }
  }

  let width = 1024;
  let height = 1024;
  let baseH = 1024;
  
  if (resolution === '720p') baseH = 720;
  else if (resolution === '1080p') baseH = 1080;
  else if (resolution === '2k') baseH = 1440;
  else if (resolution === '4k') baseH = 2160;
  
  if (ratio === '16:9') {
     height = baseH;
     width = Math.round(baseH * 16 / 9);
  } else if (ratio === '9:16') {
     width = baseH;
     height = Math.round(baseH * 16 / 9);
  } else if (ratio === '4:3') {
     height = baseH;
     width = Math.round(baseH * 4 / 3);
  } else if (ratio === '3:4') {
     width = baseH;
     height = Math.round(baseH * 4 / 3);
  } else if (ratio === '21:9') {
     height = baseH;
     width = Math.round(baseH * 21 / 9);
  } else {
     width = baseH;
     height = baseH;
  }
  
  // Width and height must be divisible by 16
  width = Math.round(width / 16) * 16;
  height = Math.round(height / 16) * 16;
  
  let sizeStr = `${width}x${height}`;

  const endpoint = images.length > 0 ? 'https://yunwu.ai/v1/images/edits' : 'https://yunwu.ai/v1/images/generations';
  
  let fetchOptions: RequestInit = {};

  if (images.length > 0) {
    const formData = new FormData();
    formData.append('model', 'gpt-image-2');
    formData.append('prompt', prompt);
    formData.append('n', count.toString());
    formData.append('size', sizeStr);

    for (let i = 0; i < images.length; i++) {
       const img = images[i];
       const b64Data = img.split(',')[1];
       const mimeMatch = img.match(/^data:([^;]+);base64,/);
       const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
       try {
         const byteString = atob(b64Data);
         const ab = new ArrayBuffer(byteString.length);
         const ia = new Uint8Array(ab);
         for (let j = 0; j < byteString.length; j++) {
           ia[j] = byteString.charCodeAt(j);
         }
         const blob = new Blob([ab], { type: mimeType });
         formData.append('image', blob, `image${i}.png`);
       } catch (e) {
         console.error('Failed to parse image from base64:', e);
       }
    }

    fetchOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData,
      signal
    };
  } else {
    const body = {
      model: 'gpt-image-2',
      prompt: prompt,
      n: count,
      size: sizeStr
    };
    fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal
    };
  }

  const response = await fetch(endpoint, fetchOptions);

  if (!response.ok) {
     const errText = await response.text().catch(() => '');
     throw new Error(`API错误: ${response.status} ${errText}`);
  }

  const data = await response.json();
  if (data.data && data.data.length > 0) {
     let text = '';
     const items = data.data.slice(0, count);
     items.forEach((imgItem: any) => {
         const url = imgItem.url || imgItem.b64_json;
         if (imgItem.b64_json) {
            text += `\n\n![Generated Image](data:image/png;base64,${imgItem.b64_json})\n\n`;
         } else if (imgItem.url) {
            text += `\n\n![Generated Image](${imgItem.url})\n\n`;
         }
     });
     return { text, thinking: '' };
  } else {
     throw new Error('未返回图片');
  }
}

export async function callYunwuVideoAPI(prompt: string, images: string[], model: string, aspectRatio: string, resolution: string, duration: string, apiKey: string, signal?: AbortSignal) {
  if (!apiKey) {
    throw new Error('请先在侧边栏输入 API Key');
  }

  let body: any;
  if (model === 'grok-video-3') {
    const finalPrompt = prompt.includes('--mode=') ? prompt : `${prompt} --mode=custom`;
    body = {
      model: "grok-video-3",
      prompt: finalPrompt,
      aspect_ratio: aspectRatio || '16:9',
      size: (resolution || '720p').toUpperCase(),
      duration: duration || '5s',
      images: images || []
    };
  } else {
    body = {
      prompt,
      model: model || 'veo3.1-components',
      images: images || [],
      enhance_prompt: true,
      enable_upsample: true,
      aspect_ratio: aspectRatio || '16:9',
      duration: duration || '5s'
    };
  }

  const response = await fetch('https://yunwu.ai/v1/video/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`视频生成API错误: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const taskId = data.id || data.task_id || data.taskId;
  
  if (!taskId && (data.url || data.video_url || (data.data && data.data[0]?.url))) {
    return { videoUrl: data.url || data.video_url || data.data[0].url };
  }

  if (!taskId) {
     throw new Error('未返回任务ID或视频URL: ' + JSON.stringify(data));
  }

  // Polling for completion
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes (with 5s interval)
  
  while (attempts < maxAttempts) {
    if (signal?.aborted) throw new Error('Aborted');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
    
    try {
      const statusResponse = await fetch(`https://yunwu.ai/v1/video/query?id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        signal
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.status || statusData.state;
        
        if (status === 'completed' || status === 'succeeded' || status === 'success') {
          const videoUrl = statusData.url || statusData.video_url || (statusData.data && statusData.data[0]?.url);
          if (videoUrl) return { videoUrl };
        } else if (status === 'failed' || status === 'error') {
          throw new Error('视频生成失败: ' + (statusData.error || '未知错误'));
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw e;
      console.warn('Polling error:', e);
    }
  }

  throw new Error('视频生成超时');
}

export async function parseVideoAndExtractText(url: string, apiKey: string) {
  if (!apiKey) {
    throw new Error('请先在侧边栏输入 API Key');
  }

  // 尝试匹配文本中的链接
  const match = url.match(/(https?:\/\/[^\s]+)/);
  const realUrl = match ? match[1] : url;

  const prompt = `你是一个专业的视听内容转录与文案分析员。用户提供了一个短视频分享文本文档（包含链接，或者是一些标题描述）：\n\n${url}\n\n当前传统的视频解析API受限无法直接下载音频。请你直接运用你的知识，结合联网搜索工具去探查上述提供的链接或文字，尽最大可能还原或推测出该视频对应的详细文字文案、台词或配音内容。你的输出必须只包含干净、连贯的台词文案内容，不要有任何多余的开场白、解释性废话或你的心情说明。格式要清晰排版。`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt }
        ]
      }
    ],
    tools: [
      { googleSearch: {} }
    ],
    generationConfig: {
      temperature: 0.3,
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}/gemini-3.1-pro-preview:generateContent?key=`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`分析接口调用失败: ${response.status} ${errText}`);
    }

    const resultData = await response.json();
    let text = resultData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 如果返回内容为空但可能被搜索工具截断
    if (!text && resultData.candidates?.[0]?.content?.parts?.length) {
       text = resultData.candidates[0].content.parts.map((p: any) => p.text || '').join('');
    }

    if (!text) {
      throw new Error('大模型未能从该链接/文本中提取任何有效内容。');
    }

    return { audioUrl: '因解析接口受限，已自动切换为智能联网摘要提取模式', transcript: text };
  } catch (e: any) {
    throw new Error(`提取失败：${e.message}`);
  }
}

export async function callGeminiAPI(
  messages: Message[],
  func: FuncType,
  modelId: string,
  apiKey: string,
  subFunc?: string,
  signal?: AbortSignal
) {
  if (!apiKey) {
    throw new Error('请先在侧边栏输入 API Key');
  }

  if (modelId === 'gpt-image-2-all') {
    return await callYunwuImageAPI(messages, modelId, apiKey, signal);
  }

  const isImageModel = modelId.includes('image') || modelId.includes('nanobanana');
  const apiUrl = `${GEMINI_API_BASE_URL}/${modelId}:generateContent?key=${apiKey}`;
  const body = buildGeminiRequestBody(messages, func, subFunc, isImageModel);
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  };

  const response = await fetch(apiUrl, fetchOptions);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errMsg = `API错误: ${response.status}`;
    try {
      const errData = JSON.parse(errText);
      if (errData?.error?.message) {
        errMsg = errData.error.message;
        if (errMsg.includes('NO_IMAGE')) {
          errMsg = '图片生成失败(NO_IMAGE)：可能触发了安全拦截或遇到了内部错误，请修改提示词或稍后再试。';
        }
      }
    } catch (e) {
      if (errText) errMsg += ' - ' + errText.slice(0, 200);
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  
  const parts = data.candidates?.[0]?.content?.parts || [];
  let text = '';
  let thinking = '';
  for (const part of parts) {
    if (part.thought) {
      if (typeof part.thought === 'string') {
        thinking += part.thought;
      } else if (part.text && part.text !== 'true') {
        thinking += part.text;
      }
    } else if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || 'image/jpeg';
      text += `\n\n![Generated Image](data:${mimeType};base64,${part.inlineData.data})\n\n`;
    } else if (part.reasoning_content) {
      thinking += part.reasoning_content;
    } else if (part.text && part.text !== 'true') {
      text += part.text;
    }
  }
  return { text, thinking };
}
