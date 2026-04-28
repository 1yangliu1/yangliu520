/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { loadState, saveState, loadAssets, saveAssets } from './lib/storage';
import { Conversation, FuncType, Message, Asset } from './types';
import { callGeminiStreamAPI, callGeminiAPI } from './lib/api';
import { cn } from './lib/utils';
import { MODELS, IMAGE_MODELS } from './constants';

import { CanvasDramaArea } from './components/CanvasDramaArea';
import { AssetsArea } from './components/AssetsArea';

export default function App() {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentFunc, setCurrentFunc] = useState<FuncType>('chat');
  const [currentDramaSubFunc, setCurrentDramaSubFunc] = useState<string>('1.优化剧本');
  const [currentSeedanceSubFunc, setCurrentSeedanceSubFunc] = useState<string>('互动剧提示词');
  const [currentImageRatio, setCurrentImageRatio] = useState<string>('16:9');
  const [currentImageResolution, setCurrentImageResolution] = useState<string>('1080p');
  const [currentImageQuality, setCurrentImageQuality] = useState<string>('standard');
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [currentModelId, setCurrentModelId] = useState('gemini-3.1-pro');
  const [currentModelName, setCurrentModelName] = useState('Gemini 3.1 Pro');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      const dbAssets = await loadAssets();
      setAssets(dbAssets);
      
      const state = await loadState();
      setConversations(state.conversations);
      setCurrentFunc(state.currentFunc);
      
      // We will validate later dynamically based on func
      if (state.currentFunc === 'yellowImage') {
        const validImageModels = IMAGE_MODELS.map(m => m.id);
        if (validImageModels.includes(state.currentModelId)) {
          setCurrentModelId(state.currentModelId);
          setCurrentModelName(state.currentModelName);
        } else {
          setCurrentModelId('gemini-3-pro-image-preview');
          setCurrentModelName('nanobananapro');
        }
      } else {
        const validModels = MODELS.map(m => m.id);
        if (validModels.includes(state.currentModelId)) {
          setCurrentModelId(state.currentModelId);
          setCurrentModelName(state.currentModelName);
        } else {
          setCurrentModelId('gemini-3.1-pro');
          setCurrentModelName('Gemini 3.1 Pro');
        }
      }
      
      setCurrentConvId(state.currentConvId);
      setApiKey(state.apiKey || '');
      setIsInitialized(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveAssets(assets);
    }
  }, [assets, isInitialized]);

  // Debounced save state to avoid performance issues during rapid canvas changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitialized) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveState(conversations, currentFunc, currentConvId, currentModelId, currentModelName, apiKey);
      }, 500); // 500ms delay for debouncing
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [conversations, currentFunc, currentConvId, currentModelId, currentModelName, apiKey, isInitialized]);

  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2500);
  };

  const generateId = () => 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

  const ensureConversation = (firstMsg: string) => {
    if (!currentConvId) {
      const id = generateId();
      let title = firstMsg.slice(0, 30).replace(/\\n/g, ' ');
      if (firstMsg.length > 30) title += '...';
      
      setConversations((prev) => ({
        ...prev,
        [id]: {
          id,
          func: currentFunc,
          dramaSubFunc: currentFunc === 'drama' ? currentDramaSubFunc : undefined,
          seedanceSubFunc: currentFunc === 'seedance' ? currentSeedanceSubFunc : undefined,
          title,
          messages: [],
          created: Date.now(),
        },
      }));
      setCurrentConvId(id);
      return id;
    }
    return currentConvId;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text && attachedImages.length === 0 || isGenerating) return;

    const convId = ensureConversation(text || '图片消息');
    setInput('');
    const currentAttachedImages = [...attachedImages];
    setAttachedImages([]);
    
    setConversations((prev) => {
      const conv = prev[convId];
      return {
        ...prev,
        [convId]: {
          ...conv,
          messages: [...conv.messages, { role: 'user', content: text, images: currentAttachedImages }],
        },
      };
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      let currentMessages = [...(conversations[convId]?.messages || []), { role: 'user', content: text, images: currentAttachedImages } as Message];
      
      // Pass proportion info for image generation
      if (currentFunc === 'yellowImage') {
        const lastMsg = currentMessages[currentMessages.length - 1];
        lastMsg.content = `【要求：比例 ${currentImageRatio}，分辨率 ${currentImageResolution}，质量 ${currentImageQuality}，数量 1】 ${lastMsg.content}`;
      }

      let responseText = '';
      let thinkingText = '';

      try {
        const cConv = conversations[convId];
        const subFunc = cConv?.dramaSubFunc || cConv?.seedanceSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : currentFunc === 'seedance' ? currentSeedanceSubFunc : undefined);
        
        if (currentFunc === 'yellowImage') {
          // YellowImage models typically return a single image response and do NOT support streaming properly
          const lastMsg = currentMessages[currentMessages.length - 1];
          const singleMessagePayload = [{ role: 'user' as const, content: lastMsg.content, images: lastMsg.images }];
          const result = await callGeminiAPI(
            singleMessagePayload,
            currentFunc,
            currentModelId,
            apiKey,
            subFunc,
            abortControllerRef.current.signal
          );
          let resultText = result.text;
          const regex = /!\[.*?\]\((.*?)\)/;
          if (!regex.test(resultText) && resultText) {
            const urlMatch = resultText.match(/https?:\/\/[^\s)]+/);
            if (urlMatch) {
              resultText = `![Generated Image](${urlMatch[0]})`;
            }
          }
          
          setConversations((prev) => {
            const conv = prev[convId];
            const msgs = [...conv.messages];
            if (msgs[msgs.length - 1].role === 'assistant') {
              msgs[msgs.length - 1] = { role: 'assistant', content: resultText, thinking: result.thinking };
            } else {
              msgs.push({ role: 'assistant', content: resultText, thinking: result.thinking });
            }
            return { ...prev, [convId]: { ...conv, messages: msgs } };
          });
        } else {
          await callGeminiStreamAPI(
            currentMessages,
            currentFunc,
            currentModelId,
            apiKey,
            subFunc,
            (chunk) => {
              responseText = chunk;
              setConversations((prev) => {
                const conv = prev[convId];
                const msgs = [...conv.messages];
                if (msgs[msgs.length - 1].role === 'assistant') {
                  msgs[msgs.length - 1].content = chunk;
                } else {
                  msgs.push({ role: 'assistant', content: chunk, thinking: thinkingText });
                }
                return { ...prev, [convId]: { ...conv, messages: msgs } };
              });
            },
            (thinking) => {
              thinkingText = thinking;
              setConversations((prev) => {
                const conv = prev[convId];
                const msgs = [...conv.messages];
                if (msgs[msgs.length - 1].role === 'assistant') {
                  msgs[msgs.length - 1].thinking = thinking;
                } else {
                  msgs.push({ role: 'assistant', content: '', thinking });
                }
                return { ...prev, [convId]: { ...conv, messages: msgs } };
              });
            },
            abortControllerRef.current.signal
          );
        }
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') throw streamErr;
        console.warn('Stream failed, trying non-stream fallback:', streamErr.message);
        
        const cConv = conversations[convId];
        const subFunc = cConv?.dramaSubFunc || cConv?.seedanceSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : currentFunc === 'seedance' ? currentSeedanceSubFunc : undefined);
        const result = await callGeminiAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          abortControllerRef.current.signal
        );
        
        setConversations((prev) => {
          const conv = prev[convId];
          const msgs = [...conv.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1] = { role: 'assistant', content: result.text, thinking: result.thinking };
          } else {
            msgs.push({ role: 'assistant', content: result.text, thinking: result.thinking });
          }
          return { ...prev, [convId]: { ...conv, messages: msgs } };
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('已停止生成');
      } else {
        const errMsg = `⚠️ 生成失败：${err.message}\n\n请检查网络连接或稍后重试。`;
        setConversations((prev) => {
          const conv = prev[convId];
          const msgs = [...conv.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1].content = errMsg;
          } else {
            msgs.push({ role: 'assistant', content: errMsg });
          }
          return { ...prev, [convId]: { ...conv, messages: msgs } };
        });
        showToast('生成失败，请重试', true);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRegenerate = async () => {
    if (!currentConvId || isGenerating) return;
    
    const conv = conversations[currentConvId];
    if (conv.messages.length < 2) return;

    // Remove last assistant message if not yellowImage
    if (currentFunc !== 'yellowImage') {
      setConversations((prev) => {
        const c = prev[currentConvId];
        return {
          ...prev,
          [currentConvId]: {
            ...c,
            messages: c.messages.slice(0, -1),
          },
        };
      });
    }

    // We need to wait for state update before sending, or just pass the sliced messages
    const currentMessages = conv.messages.slice(0, -1);
    
    // Process image ratio if needed on regenerate
    if (currentFunc === 'yellowImage' && currentMessages.length > 0) {
      const lastMsg = currentMessages[currentMessages.length - 1];
      if (!lastMsg.content.includes('【要求：比例')) {
        lastMsg.content = `【要求：比例 ${currentImageRatio}，分辨率 ${currentImageResolution}，质量 ${currentImageQuality}，数量 1】 ${lastMsg.content}`;
      } else {
        // Update ratio if it already has one
        lastMsg.content = lastMsg.content.replace(/【要求：比例 .*?】/, `【要求：比例 ${currentImageRatio}，分辨率 ${currentImageResolution}，质量 ${currentImageQuality}，数量 1】`);
      }
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      let responseText = '';
      let thinkingText = '';

      try {
        const subFunc = conv.dramaSubFunc || conv.seedanceSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : currentFunc === 'seedance' ? currentSeedanceSubFunc : undefined);
        
        if (currentFunc === 'yellowImage') {
          const lastMsg = currentMessages[currentMessages.length - 1];
          const singleMessagePayload = [{ role: 'user' as const, content: lastMsg.content, images: lastMsg.images }];
          const result = await callGeminiAPI(
            singleMessagePayload,
            currentFunc,
            currentModelId,
            apiKey,
            subFunc,
            abortControllerRef.current.signal
          );
          let resultText = result.text;
          const regex = /!\[.*?\]\((.*?)\)/;
          if (!regex.test(resultText) && resultText) {
            const urlMatch = resultText.match(/https?:\/\/[^\s)]+/);
            if (urlMatch) {
              resultText = `![Generated Image](${urlMatch[0]})`;
            }
          }

          setConversations((prev) => {
            const c = prev[currentConvId];
            const msgs = [...c.messages];
            if (msgs[msgs.length - 1].role === 'assistant') {
              msgs[msgs.length - 1] = { role: 'assistant', content: msgs[msgs.length - 1].content + '\n' + resultText, thinking: result.thinking };
            } else {
              msgs.push({ role: 'assistant', content: resultText, thinking: result.thinking });
            }
            return { ...prev, [currentConvId]: { ...c, messages: msgs } };
          });
        } else {
          await callGeminiStreamAPI(
            currentMessages,
            currentFunc,
            currentModelId,
            apiKey,
            subFunc,
            (chunk) => {
              responseText = chunk;
              setConversations((prev) => {
                const c = prev[currentConvId];
                const msgs = [...c.messages];
                if (msgs[msgs.length - 1].role === 'assistant') {
                  msgs[msgs.length - 1].content = chunk;
                } else {
                  msgs.push({ role: 'assistant', content: chunk, thinking: thinkingText });
                }
                return { ...prev, [currentConvId]: { ...c, messages: msgs } };
              });
            },
            (thinking) => {
              thinkingText = thinking;
              setConversations((prev) => {
                const c = prev[currentConvId];
                const msgs = [...c.messages];
                if (msgs[msgs.length - 1].role === 'assistant') {
                  msgs[msgs.length - 1].thinking = thinking;
                } else {
                  msgs.push({ role: 'assistant', content: '', thinking });
                }
                return { ...prev, [currentConvId]: { ...c, messages: msgs } };
              });
            },
            abortControllerRef.current.signal
          );
        }
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') throw streamErr;
        
        const subFunc = conv.dramaSubFunc || conv.seedanceSubFunc || (currentFunc === 'drama' ? currentDramaSubFunc : currentFunc === 'seedance' ? currentSeedanceSubFunc : undefined);
        const result = await callGeminiAPI(
          currentMessages,
          currentFunc,
          currentModelId,
          apiKey,
          subFunc,
          abortControllerRef.current.signal
        );
        
        setConversations((prev) => {
          const c = prev[currentConvId];
          const msgs = [...c.messages];
          if (msgs[msgs.length - 1].role === 'assistant') {
            msgs[msgs.length - 1] = { role: 'assistant', content: result.text, thinking: result.thinking };
          } else {
            msgs.push({ role: 'assistant', content: result.text, thinking: result.thinking });
          }
          return { ...prev, [currentConvId]: { ...c, messages: msgs } };
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showToast('重新生成失败', true);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => {
      const newConvs = { ...prev };
      delete newConvs[id];
      return newConvs;
    });
    if (currentConvId === id) {
      setCurrentConvId(null);
    }
  };

  const createNewChat = () => {
    setCurrentConvId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const createNewProject = (title: string, description: string) => {
    const id = generateId();
    setConversations((prev) => ({
      ...prev,
      [id]: {
        id,
        func: 'canvasDrama',
        title,
        description,
        messages: [],
        created: Date.now(),
        nodes: [{
          id: `mainScript-${generateId()}`,
          type: 'mainScript',
          position: { x: 50, y: 50 },
          data: {
             variant: 'mainScript',
             content: '',
             title: '待生成'
          }
        }],
        edges: []
      },
    }));
    setCurrentConvId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleFuncChange = (func: FuncType) => {
    if (func === currentFunc && !currentConvId) return;
    setCurrentFunc(func);
    setCurrentConvId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
    
    // Switch to appropriate model list based on function
    if (func === 'yellowImage') {
      setCurrentModelId('gemini-3-pro-image-preview');
      setCurrentModelName('nanobananapro');
    } else {
      const isImageModel = currentModelId === 'gemini-3-pro-image-preview' || currentModelId === 'gemini-3.1-flash-image-preview';
      if (isImageModel) {
        setCurrentModelId('gemini-3.1-pro');
        setCurrentModelName('Gemini 3.1 Pro');
      }
    }
  };

  const handleUpdateProjectInfo = useCallback((title: string, description: string) => {
    if (currentConvId) {
      setConversations(prev => {
        const conv = prev[currentConvId];
        if (!conv) return prev;
        return {
          ...prev,
          [currentConvId]: { ...conv, title, description }
        };
      });
    }
  }, [currentConvId]);

  const handleUpdateHistory = useCallback((historyItem: { id: string; type: 'image' | 'audio' | 'video'; url: string; timestamp: number }) => {
    if (currentConvId) {
      setConversations(prev => {
        const conv = prev[currentConvId];
        if (!conv) return prev;
        return {
          ...prev,
          [currentConvId]: { 
            ...conv, 
            history: [historyItem, ...(conv.history || [])]
          }
        };
      });
    }
  }, [currentConvId]);

  const handleUpdateCanvas = useCallback((nodes: any[], edges: any[], title: string) => {
    if (!currentConvId) {
      const id = generateId();
      setConversations((prev) => ({
        ...prev,
        [id]: {
          id,
          func: 'canvasDrama',
          title: '新的星幕',
          messages: [],
          created: Date.now(),
          nodes,
          edges,
        },
      }));
      setCurrentConvId(id);
    } else {
      setConversations((prev) => {
        const conv = prev[currentConvId];
        if (!conv) return prev;
        return { ...prev, [currentConvId]: { ...conv, nodes, edges } };
      });
    }
  }, [currentConvId]);

  const handleSaveAsset = useCallback((url: string, type: 'image' | 'audio' | 'video') => {
    const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setAssets(prev => [{
      id: assetId,
      type,
      url,
      name: `${type}-${new Date().toLocaleTimeString()}.png`, // simplify name
      createdAt: Date.now()
    }, ...prev]);
    showToast('已存入资产');
  }, []);

  if (!isInitialized) return null;

  const currentMessages = currentConvId ? conversations[currentConvId]?.messages || [] : [];

  return (
    <div className="flex h-[100dvh] w-full bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      <Sidebar
        currentFunc={currentFunc}
        setCurrentFunc={handleFuncChange}
        conversations={conversations}
        currentConvId={currentConvId}
        setCurrentConvId={setCurrentConvId}
        deleteConversation={deleteConversation}
        createNewChat={createNewChat}
        createNewProject={createNewProject}
        currentModelId={currentModelId}
        setCurrentModelId={setCurrentModelId}
        currentModelName={currentModelName}
        setCurrentModelName={setCurrentModelName}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      {currentFunc === 'assets' ? (
        <AssetsArea 
          assets={assets} 
          setAssets={setAssets} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      ) : currentFunc === 'canvasDrama' ? (
        <CanvasDramaArea 
           apiKey={apiKey} 
           conversations={conversations}
           conversation={currentConvId ? conversations[currentConvId] : undefined}
           setCurrentConvId={setCurrentConvId}
           createNewProject={createNewProject}
           onUpdateCanvas={handleUpdateCanvas}
           onUpdateProjectInfo={handleUpdateProjectInfo}
           onUpdateHistory={handleUpdateHistory}
           onSaveAsset={handleSaveAsset}
           assets={assets}
           sidebarOpen={sidebarOpen}
           setSidebarOpen={setSidebarOpen}
        />
      ) : (
        <ChatArea
          currentFunc={currentFunc}
          currentDramaSubFunc={currentDramaSubFunc}
          setCurrentDramaSubFunc={setCurrentDramaSubFunc}
          currentSeedanceSubFunc={currentSeedanceSubFunc}
          setCurrentSeedanceSubFunc={setCurrentSeedanceSubFunc}
          currentImageRatio={currentImageRatio}
          setCurrentImageRatio={setCurrentImageRatio}
          currentImageResolution={currentImageResolution}
          setCurrentImageResolution={setCurrentImageResolution}
          currentImageQuality={currentImageQuality}
          setCurrentImageQuality={setCurrentImageQuality}
          messages={currentMessages}
          input={input}
          setInput={setInput}
          attachedImages={attachedImages}
          setAttachedImages={setAttachedImages}
          onSend={() => handleSend()}
          onStop={handleStop}
          isGenerating={isGenerating}
          onRegenerate={handleRegenerate}
          quickSend={(text) => handleSend(text)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onSaveAsset={handleSaveAsset}
          assets={assets}
          currentModelId={currentModelId}
        />
      )}

      {/* Toast */}
      <div
        className={cn(
          "fixed top-5 right-5 px-4 py-2.5 rounded-md text-[13px] text-white shadow-lg transition-all duration-300 z-[1000] max-w-[300px] pointer-events-none",
          toast ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0",
          toast?.isError ? "bg-red-500" : "bg-neutral-900"
        )}
      >
        {toast?.msg}
      </div>
    </div>
  );
}
