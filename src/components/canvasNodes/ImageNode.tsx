import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { ImageIcon, Monitor, BoxSelect, Loader2, BookmarkPlus, Library, X, Maximize2, SlidersHorizontal, ArrowUp, Edit } from 'lucide-react';
import { IMAGE_MODELS } from '../../constants';
import { cn } from '../../lib/utils';
import { Asset } from '../../types';
import { NodeGrabber } from './NodeGrabber';

export function ImageNode({ data, id, selected }: NodeProps) {
  const zoom = useStore((s: any) => s.transform[2]);
  const isExtracted = data.variant === 'extracted';
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [replaceImageOpen, setReplaceImageOpen] = useState<false | 'menu' | 'assets'>(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [funcOpen, setFuncOpen] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleContent, setNewStyleContent] = useState('');
  const [newFuncName, setNewFuncName] = useState('');
  const [newFuncContent, setNewFuncContent] = useState('');
  
  const [editingStyleIdx, setEditingStyleIdx] = useState<number | null>(null);
  const [editingStyleName, setEditingStyleName] = useState('');
  const [editingStyleContent, setEditingStyleContent] = useState('');

  const [editingFuncIdx, setEditingFuncIdx] = useState<number | null>(null);
  const [editingFuncName, setEditingFuncName] = useState('');
  const [editingFuncContent, setEditingFuncContent] = useState('');

  const [customStyles, setCustomStyles] = useState<{name: string, content: string}[]>(() => {
    const saved = localStorage.getItem('image-node-styles');
    return saved ? JSON.parse(saved) : [];
  });
  const [customFuncs, setCustomFuncs] = useState<{name: string, content: string}[]>(() => {
    const saved = localStorage.getItem('image-node-functions');
    return saved ? JSON.parse(saved) : [];
  });
  const [countOpen, setCountOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      setModelOpen(false);
      setRatioOpen(false);
      setResOpen(false);
      setQualityOpen(false);
      setAssetOpen(false);
      setReplaceImageOpen(false);
      setStyleOpen(false);
      setFuncOpen(false);
      setCountOpen(false);
    };
    
    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, []);

  const currentModel = IMAGE_MODELS.find(m => m.id === data.modelId) || IMAGE_MODELS[0];
  const allAssets = (data.allAssets || []) as Asset[];
  const inputImages = (data.attachedImages as string[]) || [];

  const builtInStyles = [
    { name: '真人提示词', content: '100%写实风格，真人电影，自然光线，4K超高清。' }
  ];

  const builtInFuncs = [
    { name: '角色三视图', content: '纯白色背景，图左三分之一为角色上半身正面全景，图右为角色全身三视图（正面、背面、侧面），图像正上方写着角色名字，禁止输出多余的文字。' }
  ];

  const allStyles = [...builtInStyles, ...customStyles];
  const allFuncs = [...builtInFuncs, ...customFuncs];

  const handleAddStyle = () => {
    if (newStyleName.trim() && newStyleContent.trim()) {
      const updated = [...customStyles, { name: newStyleName.trim(), content: newStyleContent.trim() }];
      setCustomStyles(updated);
      localStorage.setItem('image-node-styles', JSON.stringify(updated));
      setNewStyleName('');
      setNewStyleContent('');
    }
  };

  const handleRemoveStyle = (index: number) => {
    const updated = customStyles.filter((_, i) => i !== index);
    setCustomStyles(updated);
    localStorage.setItem('image-node-styles', JSON.stringify(updated));
  };

  const handleAddFunc = () => {
    if (newFuncName.trim() && newFuncContent.trim()) {
      const updated = [...customFuncs, { name: newFuncName.trim(), content: newFuncContent.trim() }];
      setCustomFuncs(updated);
      localStorage.setItem('image-node-functions', JSON.stringify(updated));
      setNewFuncName('');
      setNewFuncContent('');
    }
  };

  const handleRemoveFunc = (index: number) => {
    const updated = customFuncs.filter((_, i) => i !== index);
    setCustomFuncs(updated);
    localStorage.setItem('image-node-functions', JSON.stringify(updated));
  };

  const startEditStyle = (index: number, s: any) => {
    setEditingStyleIdx(index);
    setEditingStyleName(s.name);
    setEditingStyleContent(s.content);
  };

  const saveEditStyle = () => {
    if (editingStyleIdx !== null && editingStyleName.trim() && editingStyleContent.trim()) {
      const customIdx = editingStyleIdx - builtInStyles.length;
      const updated = [...customStyles];
      updated[customIdx] = { name: editingStyleName.trim(), content: editingStyleContent.trim() };
      setCustomStyles(updated);
      localStorage.setItem('image-node-styles', JSON.stringify(updated));
      setEditingStyleIdx(null);
    }
  };

  const startEditFunc = (index: number, f: any) => {
    setEditingFuncIdx(index);
    setEditingFuncName(f.name);
    setEditingFuncContent(f.content);
  };

  const saveEditFunc = () => {
    if (editingFuncIdx !== null && editingFuncName.trim() && editingFuncContent.trim()) {
      const customIdx = editingFuncIdx - builtInFuncs.length;
      const updated = [...customFuncs];
      updated[customIdx] = { name: editingFuncName.trim(), content: editingFuncContent.trim() };
      setCustomFuncs(updated);
      localStorage.setItem('image-node-functions', JSON.stringify(updated));
      setEditingFuncIdx(null);
    }
  };

  const applyStyle = (style: {name: string, content: string}) => {
    if (data.onChange) {
      (data.onChange as any)(id, { selectedStyle: style });
    }
    setStyleOpen(false);
  };

  const applyFunc = (func: {name: string, content: string}) => {
    if (data.onChange) {
      (data.onChange as any)(id, { selectedFunction: func });
    }
    setFuncOpen(false);
  };

  const selectedStyle = data.selectedStyle as {name: string, content: string} | undefined;
  const selectedFunction = data.selectedFunction as {name: string, content: string} | undefined;

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onChange) {
      (data.onChange as any)(id, { imageSrc: null, imageSrcs: null });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.imageSrc) {
      const a = document.createElement('a');
      a.href = data.imageSrc as string;
      a.download = `image-${id}.png`;
      a.click();
    }
  };

  const handleImageDoubleClick = (url: string) => {
    setFullscreenImage(url);
    setIsFullscreen(true);
  };

  const onGenerate = () => {
    if (data.onGenerate) {
      (data.onGenerate as any)(id);
    }
  };

  const handleAddAsset = (asset: Asset) => {
    if (asset.type === 'image') {
      const newAttached = [...inputImages, asset.url];
      (data.onChange as any)(id, { attachedImages: newAttached });
    }
    setAssetOpen(false);
  };

  return (
    <>
      <div 
        className={cn(
          "bg-transparent rounded-xl flex flex-col font-sans relative transition-all duration-300 overflow-visible drag-handle border border-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] group",
          isExtracted ? "w-[660px]" : "w-max",
          selected ? "ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "hover:border-white/70"
        )}
      >
        <NodeGrabber nodeId={id} onSelectConnected={data.onSelectConnected as any} selected={selected} />
        <Handle 
          type="target" 
          position={Position.Left} 
          id="left" 
          style={{ top: '150px' }}
        />
        
        {/* Content Wrapper */}
        <div className={cn("flex w-full", isExtracted ? "flex-row" : "flex-col items-center")}>
          {isExtracted && (
            <div className="flex-1 p-4 bg-[#1a1a1a] rounded-l-xl flex flex-col gap-4 border-r border-white/5 nodrag cursor-text" onDoubleClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-2 px-3 bg-white/5 rounded-2xl">
                  <span className="text-[13px] font-black text-white uppercase tracking-widest leading-none">{(data.title as string) || "提示词 (提取) / 参考图"}</span>
                </div>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative">
                    <button 
                      onClick={() => setStyleOpen(!styleOpen)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors border cursor-pointer",
                        selectedStyle 
                          ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20" 
                          : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20"
                      )}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {selectedStyle ? selectedStyle.name : "风格库"}
                    </button>
                    {styleOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#1e1f24] border border-white/10 rounded-2xl shadow-2xl z-[70] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">预设风格</div>
                          {selectedStyle && (
                            <button 
                              onClick={() => { (data.onChange as any)(id, { selectedStyle: null }); setStyleOpen(false); }}
                              className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
                            >
                              清除选择
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                          {allStyles.map((s, idx) => (
                            <div key={idx} className="group relative">
                              {editingStyleIdx === idx ? (
                                <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 mb-1 z-10 relative">
                                  <input 
                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-purple-500/50"
                                    value={editingStyleName}
                                    onChange={(e) => setEditingStyleName(e.target.value)}
                                    placeholder="风格名称..."
                                  />
                                  <textarea
                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-neutral-500 outline-none focus:border-purple-500/50 resize-none h-16"
                                    value={editingStyleContent}
                                    onChange={(e) => setEditingStyleContent(e.target.value)}
                                    placeholder="风格描述内容..."
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingStyleIdx(null)} className="text-[10px] px-2 py-1 text-neutral-400 hover:text-white bg-white/5 rounded-md border-none cursor-pointer">取消</button>
                                    <button onClick={saveEditStyle} className="text-[10px] px-2 py-1 text-white bg-purple-600 hover:bg-purple-500 rounded-md border-none cursor-pointer">保存</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => applyStyle(s)}
                                    className={cn(
                                      "w-full text-left p-2.5 rounded-xl transition-all border flex flex-col gap-0.5 bg-transparent cursor-pointer",
                                      selectedStyle?.name === s.name 
                                        ? "bg-purple-500/10 border-purple-500/30" 
                                        : "hover:bg-white/5 border-transparent hover:border-white/10"
                                    )}
                                  >
                                    <span className={cn("text-xs font-bold", selectedStyle?.name === s.name ? "text-purple-400" : "text-neutral-200")}>{s.name}</span>
                                    <span className="text-[10px] text-neutral-500 line-clamp-1">{s.content}</span>
                                  </button>
                                  {idx >= builtInStyles.length && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); startEditStyle(idx, s); }}
                                        className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveStyle(idx - builtInStyles.length); }}
                                        className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                          <input 
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-purple-500/50 transition-colors"
                            placeholder="风格名称..."
                            value={newStyleName}
                            onChange={(e) => setNewStyleName(e.target.value)}
                          />
                          <textarea 
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-purple-500/50 transition-colors resize-none h-[60px]"
                            placeholder="风格描述内容..."
                            value={newStyleContent}
                            onChange={(e) => setNewStyleContent(e.target.value)}
                          />
                          <button 
                            onClick={handleAddStyle}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors border-none cursor-pointer shadow-lg shadow-purple-900/20"
                          >
                            保存到风格库
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setFuncOpen(!funcOpen)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors border cursor-pointer",
                        selectedFunction 
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20" 
                          : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                      )}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {selectedFunction ? selectedFunction.name : "功能库"}
                    </button>
                    {funcOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#1e1f24] border border-white/10 rounded-2xl shadow-2xl z-[70] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">功能预设</div>
                          {selectedFunction && (
                            <button 
                              onClick={() => { (data.onChange as any)(id, { selectedFunction: null }); setFuncOpen(false); }}
                              className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
                            >
                              清除选择
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                          {allFuncs.map((f, idx) => (
                            <div key={idx} className="group relative">
                              {editingFuncIdx === idx ? (
                                <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 mb-1 z-10 relative">
                                  <input 
                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-blue-500/50"
                                    value={editingFuncName}
                                    onChange={(e) => setEditingFuncName(e.target.value)}
                                    placeholder="功能名称..."
                                  />
                                  <textarea
                                    className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-neutral-500 outline-none focus:border-blue-500/50 resize-none h-16"
                                    value={editingFuncContent}
                                    onChange={(e) => setEditingFuncContent(e.target.value)}
                                    placeholder="功能描述内容..."
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingFuncIdx(null)} className="text-[10px] px-2 py-1 text-neutral-400 hover:text-white bg-white/5 rounded-md border-none cursor-pointer">取消</button>
                                    <button onClick={saveEditFunc} className="text-[10px] px-2 py-1 text-white bg-blue-600 hover:bg-blue-500 rounded-md border-none cursor-pointer">保存</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => applyFunc(f)}
                                    className={cn(
                                      "w-full text-left p-2.5 rounded-xl transition-all border flex flex-col gap-0.5 bg-transparent cursor-pointer",
                                      selectedFunction?.name === f.name 
                                        ? "bg-blue-500/10 border-blue-500/30" 
                                        : "hover:bg-white/5 border-transparent hover:border-white/10"
                                    )}
                                  >
                                    <span className={cn("text-xs font-bold", selectedFunction?.name === f.name ? "text-blue-400" : "text-neutral-200")}>{f.name}</span>
                                    <span className="text-[10px] text-neutral-500 line-clamp-1">{f.content}</span>
                                  </button>
                                  {idx >= builtInFuncs.length && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); startEditFunc(idx, f); }}
                                        className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFunc(idx - builtInFuncs.length); }}
                                        className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                          <input 
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 transition-colors"
                            placeholder="功能名称..."
                            value={newFuncName}
                            onChange={(e) => setNewFuncName(e.target.value)}
                          />
                          <textarea 
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 transition-colors resize-none h-[60px]"
                            placeholder="功能描述内容..."
                            value={newFuncContent}
                            onChange={(e) => setNewFuncContent(e.target.value)}
                          />
                          <button 
                            onClick={handleAddFunc}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors border-none cursor-pointer shadow-lg shadow-blue-900/20"
                          >
                            保存到功能库
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {inputImages.length > 0 && (
                  <div className="w-full flex gap-2 overflow-x-auto custom-scrollbar py-1">
                    {inputImages.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 group/thumb shrink-0">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-0 right-0 bg-black/60 px-1 text-[8px] text-white rounded-bl-lg">{idx + 1}</div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newAttached = [...inputImages];
                            newAttached.splice(idx, 1);
                            (data.onChange as any)(id, { attachedImages: newAttached });
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity border-none cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <textarea
                  className="w-full flex-1 min-h-[150px] bg-transparent border-none p-0 text-sm text-neutral-200 placeholder:text-neutral-500 resize-none outline-none leading-relaxed custom-scrollbar"
                  value={data.content as string}
                  onChange={(e) => data.onChange && (data.onChange as any)(id, { content: e.target.value })}
                  placeholder="分段描述内容..."
                />
              </div>

              <div className="flex items-center justify-between pt-3 nodrag">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="relative">
                    <button 
                      onClick={() => setModelOpen(!modelOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{currentModel.name}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {modelOpen && (
                      <div className="absolute bottom-full left-0 mb-3 w-[180px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {IMAGE_MODELS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { (data.onChange as any)(id, { modelId: m.id }); setModelOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] transition-colors border-none bg-transparent cursor-pointer",
                              data.modelId === m.id ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setRatioOpen(!ratioOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{data.ratio as string}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {ratioOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { ratio: r }); setRatioOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              data.ratio === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setResOpen(!resOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{(data.resolution as string) || '1080p'}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {resOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['720p', '1080p', '2k', '4k'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { resolution: r }); setResOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              ((data.resolution as string) || '1080p') === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setCountOpen(!countOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{(data.imageCount as number) || 1} 张</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {countOpen && (
                      <div className="absolute bottom-full right-0 w-[80px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {[1, 2, 4].map(c => (
                          <button
                            key={c}
                            onClick={() => { (data.onChange as any)(id, { imageCount: c }); setCountOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              ((data.imageCount as number) || 1) === c ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {c} 张
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  disabled={data.isGenerating as boolean}
                  onClick={onGenerate}
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-90 border-none cursor-pointer disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            </div>
          )}

          {/* Top: Image Output Area */}
          <div 
            className={cn(
              "bg-black/50 backdrop-blur-md flex flex-none items-center justify-center overflow-hidden relative group/img cursor-pointer transition-all duration-300 shadow-sm",
              isExtracted ? "w-[360px] min-h-[250px] rounded-r-xl" : "h-[450px] rounded-xl",
              selected && "ring-2 ring-white ring-offset-1 ring-offset-transparent",
              replaceImageOpen && "z-50"
            )}
            style={{
              aspectRatio: isExtracted ? undefined : ((data.ratio as string)?.replace(':', '/') || '1/1')
            }}
            onDoubleClick={() => data.imageSrc && handleImageDoubleClick(data.imageSrc as string)}
          >
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-neutral-900/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 text-[10px] z-10 font-medium border border-white/10">
            <ImageIcon className="w-3 h-3" />
            <span>图片节点 {id.split('-').pop()}</span>
          </div>

          {data.imageSrc ? (
            <>
              {data.imageSrcs && (data.imageSrcs as string[]).length > 1 && (
                <div className="absolute top-2 right-12 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] z-30 font-medium">
                  共 {(data.imageSrcs as string[]).length} 张 (双击全屏查看)
                </div>
              )}
              
              {data.imageSrcs && (data.imageSrcs as string[]).length > 1 ? (
                (() => {
                  const allSrcs = data.imageSrcs as string[];
                  const mainSrc = data.imageSrc as string || allSrcs[0];
                  const bgSrcs = allSrcs.filter(src => src !== mainSrc).slice(0, 2);
                  
                  return (
                    <>
                      <div className={cn("w-full h-full relative", isExtracted && "absolute inset-0 p-2 z-20")}>
                        {bgSrcs[1] && (
                          <img 
                            src={bgSrcs[1]} 
                            className="absolute w-full h-full object-contain transition-all rounded-xl shadow-2xl scale-[0.92] -translate-y-4 translate-x-4 z-[18] opacity-60 cursor-pointer"
                            referrerPolicy="no-referrer"
                            onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
                          />
                        )}
                        
                        {bgSrcs[0] && (
                          <img 
                            src={bgSrcs[0]} 
                            className="absolute w-full h-full object-contain transition-all rounded-xl shadow-2xl scale-[0.96] -translate-y-2 translate-x-2 z-[19] opacity-80 cursor-pointer"
                            referrerPolicy="no-referrer"
                            onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
                          />
                        )}
                        
                        <img 
                          src={mainSrc}
                          className="relative w-full h-full object-contain transition-all rounded-xl shadow-2xl z-20 cursor-pointer"
                          referrerPolicy="no-referrer"
                          onDoubleClick={(e) => { e.stopPropagation(); setIsFullscreen(true); setFullscreenImage(mainSrc); }}
                          onClick={(e) => { e.stopPropagation(); setGalleryOpen(true); }}
                        />
                      </div>
                    </>
                  );
                })()
              ) : isExtracted ? (
                <div className="absolute inset-0 flex items-center justify-center p-2 z-20">
                  <img 
                    src={data.imageSrc as string} 
                    alt="generated" 
                    className="w-full h-full object-contain transition-all"
                    referrerPolicy="no-referrer" 
                    onDoubleClick={(e) => { e.stopPropagation(); setIsFullscreen(true); setFullscreenImage(data.imageSrc as string); }}
                  />
                </div>
              ) : (
                <img 
                  src={data.imageSrc as string} 
                  alt="generated" 
                  className="w-full h-full object-contain transition-all relative z-20"
                  referrerPolicy="no-referrer" 
                  onDoubleClick={(e) => { e.stopPropagation(); setIsFullscreen(true); setFullscreenImage(data.imageSrc as string); }}
                />
              )}

              <button 
                onClick={handleClearImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-50 border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-purple-400/60 text-xs flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="font-semibold tracking-tight">待绘图</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex items-center gap-2 z-50 nodrag">
            {isExtracted && (
                <div className="relative">
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setReplaceImageOpen(replaceImageOpen ? false : 'menu'); }}
                    className="bg-black/60 hover:bg-black/80 text-white text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border-none cursor-pointer h-8 shadow-lg backdrop-blur-sm"
                  >
                    <Library className="w-3.5 h-3.5" /> 替换图片
                  </button>
                  
                  {replaceImageOpen === 'menu' && (
                      <div className="absolute bottom-full right-0 mb-2 w-[160px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
                        <button 
                          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setReplaceImageOpen('assets'); }} 
                          className="w-full text-left px-3 py-2.5 text-[11px] text-neutral-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border-none bg-transparent cursor-pointer font-medium mb-1"
                        >
                          从资产库选择
                        </button>
                        <label className="block w-full cursor-pointer hover:bg-white/10 text-left px-3 py-2.5 rounded-xl text-[11px] text-neutral-300 hover:text-white transition-colors font-medium">
                          从本地上传
                          <input 
                             type="file" 
                             className="hidden" 
                             accept="image/*" 
                             onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const url = event.target?.result as string;
                                        if (data.onChange) {
                                            (data.onChange as any)(id, { imageSrc: url });
                                        }
                                        setReplaceImageOpen(false);
                                    };
                                    reader.readAsDataURL(file);
                                 }
                             }} 
                          />
                        </label>
                      </div>
                  )}

                  {replaceImageOpen === 'assets' && (
                      <div className="absolute bottom-full right-0 mb-2 w-[240px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto p-1 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">选择替换图片</span>
                          <X className="w-3 h-3 text-neutral-500 cursor-pointer hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setReplaceImageOpen('menu'); }} />
                        </div>
                        {allAssets.filter(a => a.type === 'image').length === 0 ? (
                          <div className="p-6 text-center text-[10px] text-neutral-500 italic">资产库暂无图片...</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 p-2">
                            {allAssets.filter(a => a.type === 'image').map(asset => (
                              <button
                                key={asset.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    (data.onChange as any)(id, { imageSrc: asset.url });
                                    setReplaceImageOpen(false);
                                }}
                                className="relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-purple-500 group/asset p-0 cursor-pointer transition-all"
                              >
                                <img src={asset.url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                  )}
                </div>
            )}

            {data.imageSrc && (
              <div className="flex items-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                {data.onSaveAsset && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      (data.onSaveAsset as any)(data.imageSrc as string, 'image');
                    }}
                    className="bg-black/60 hover:bg-black/80 text-white text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border-none cursor-pointer h-8 shadow-lg backdrop-blur-sm"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" /> 存入
                  </button>
                )}

                <button 
                  onClick={handleDownload}
                  className="w-8 h-8 bg-black/60 hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center border-none cursor-pointer shadow-lg backdrop-blur-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
              </div>
            )}
          </div>

          {data.isGenerating && (
            <div className="absolute inset-0 bg-[#0a0a0a]/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-20">
              <div className="p-3 bg-[#1a1a1a] rounded-2xl shadow-xl border border-white/5">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
              <span className="text-xs font-bold text-neutral-300 tracking-wider uppercase">绘图中...</span>
            </div>
          )}
        </div>

        {/* Bottom: Controls & Input Area - Shown ONLY when selected AND not extracted */}
        {(selected && !isExtracted) && (
          <div 
            className="absolute top-full left-1/2 mt-4 p-4 bg-[#1a1a1a] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300 border border-white/5 ring-4 ring-black/5 nodrag"
            style={{
              width: "600px",
              transform: `translate(-50%, 0) scale(${1 / zoom})`,
              transformOrigin: "top center",
              zIndex: 50
            }}
          >
            
            {/* Top Row: Info & Images */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-2 px-3 bg-white/5 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">输入素材</span>
              </div>

              {/* Thumbnails */}
              <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
                {inputImages.map((img, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 group/thumb shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-0 right-0 bg-black/60 px-1 text-[8px] text-white rounded-bl-lg">{idx + 1}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newAttached = [...inputImages];
                        newAttached.splice(idx, 1);
                        (data.onChange as any)(id, { attachedImages: newAttached });
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity border-none cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setAssetOpen(true)}
                  className="w-12 h-12 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-white/40 hover:border-white/20 transition-all shrink-0 bg-transparent cursor-pointer"
                >
                  <BookmarkPlus className="w-5 h-5" />
                </button>
                {assetOpen && (
                  <div className="absolute top-0 right-full mr-3 w-[240px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto p-1 py-2 animate-in fade-in slide-in-from-right-2 duration-200" onPointerDown={(e) => e.stopPropagation()}>
                    <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">我的资产</span>
                      <X className="w-3 h-3 text-neutral-500 cursor-pointer hover:text-white transition-colors" onClick={() => setAssetOpen(false)} />
                    </div>
                    {allAssets.filter(a => a.type === 'image').length === 0 ? (
                      <div className="p-8 text-center text-[11px] text-neutral-500 italic">资产中没有图片素材...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {allAssets.filter(a => a.type === 'image').map(asset => (
                          <button
                            key={asset.id}
                            onClick={() => {
                                const newAttached = [...inputImages, asset.url];
                                (data.onChange as any)(id, { attachedImages: newAttached });
                                setAssetOpen(false);
                            }}
                            className="relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-purple-500 group/asset p-0 cursor-pointer transition-all"
                          >
                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/asset:opacity-100 flex items-center justify-center transition-all">
                              <span className="text-[9px] text-white bg-purple-600 px-2 py-0.5 rounded-full font-bold shadow-lg">选用</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Input Row */}
            <div className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setStyleOpen(!styleOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors border cursor-pointer",
                      selectedStyle 
                        ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20" 
                        : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20"
                    )}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {selectedStyle ? selectedStyle.name : "风格库"}
                  </button>
                  {styleOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-[280px] bg-[#1e1f24] border border-white/10 rounded-2xl shadow-2xl z-[70] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200" onPointerDown={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">预设风格</div>
                        {selectedStyle && (
                          <button 
                            onClick={() => { (data.onChange as any)(id, { selectedStyle: null }); setStyleOpen(false); }}
                            className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            清除选择
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {allStyles.map((s, idx) => (
                          <div key={idx} className="group relative">
                            {editingStyleIdx === idx ? (
                              <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 mb-1 z-10 relative">
                                <input 
                                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-purple-500/50"
                                  value={editingStyleName}
                                  onChange={(e) => setEditingStyleName(e.target.value)}
                                  placeholder="风格名称..."
                                />
                                <textarea
                                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-neutral-500 outline-none focus:border-purple-500/50 resize-none h-16"
                                  value={editingStyleContent}
                                  onChange={(e) => setEditingStyleContent(e.target.value)}
                                  placeholder="风格描述内容..."
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingStyleIdx(null)} className="text-[10px] px-2 py-1 text-neutral-400 hover:text-white bg-white/5 rounded-md border-none cursor-pointer">取消</button>
                                  <button onClick={saveEditStyle} className="text-[10px] px-2 py-1 text-white bg-purple-600 hover:bg-purple-500 rounded-md border-none cursor-pointer">保存</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => applyStyle(s)}
                                  className={cn(
                                    "w-full text-left p-2.5 rounded-xl transition-all border flex flex-col gap-0.5 bg-transparent cursor-pointer",
                                    selectedStyle?.name === s.name 
                                      ? "bg-purple-500/10 border-purple-500/30" 
                                      : "hover:bg-white/5 border-transparent hover:border-white/10"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", selectedStyle?.name === s.name ? "text-purple-400" : "text-neutral-200")}>{s.name}</span>
                                  <span className="text-[10px] text-neutral-500 line-clamp-1">{s.content}</span>
                                </button>
                                {idx >= builtInStyles.length && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); startEditStyle(idx, s); }}
                                      className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleRemoveStyle(idx - builtInStyles.length); }}
                                      className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                        <input 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-purple-500/50 transition-colors"
                          placeholder="风格名称..."
                          value={newStyleName}
                          onChange={(e) => setNewStyleName(e.target.value)}
                        />
                        <textarea 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-purple-500/50 transition-colors resize-none h-[60px]"
                          placeholder="风格描述内容..."
                          value={newStyleContent}
                          onChange={(e) => setNewStyleContent(e.target.value)}
                        />
                        <button 
                          onClick={handleAddStyle}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors border-none cursor-pointer shadow-lg shadow-purple-900/20"
                        >
                          保存到风格库
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setFuncOpen(!funcOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg transition-colors border cursor-pointer",
                      selectedFunction 
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20" 
                        : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                    )}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {selectedFunction ? selectedFunction.name : "功能库"}
                  </button>
                  {funcOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-[280px] bg-[#1e1f24] border border-white/10 rounded-2xl shadow-2xl z-[70] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200" onPointerDown={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">功能预设</div>
                        {selectedFunction && (
                          <button 
                            onClick={() => { (data.onChange as any)(id, { selectedFunction: null }); setFuncOpen(false); }}
                            className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            清除选择
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        {allFuncs.map((f, idx) => (
                          <div key={idx} className="group relative">
                            {editingFuncIdx === idx ? (
                              <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 mb-1 z-10 relative">
                                <input 
                                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-blue-500/50"
                                  value={editingFuncName}
                                  onChange={(e) => setEditingFuncName(e.target.value)}
                                  placeholder="功能名称..."
                                />
                                <textarea
                                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-neutral-500 outline-none focus:border-blue-500/50 resize-none h-16"
                                  value={editingFuncContent}
                                  onChange={(e) => setEditingFuncContent(e.target.value)}
                                  placeholder="功能描述内容..."
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingFuncIdx(null)} className="text-[10px] px-2 py-1 text-neutral-400 hover:text-white bg-white/5 rounded-md border-none cursor-pointer">取消</button>
                                  <button onClick={saveEditFunc} className="text-[10px] px-2 py-1 text-white bg-blue-600 hover:bg-blue-500 rounded-md border-none cursor-pointer">保存</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => applyFunc(f)}
                                  className={cn(
                                    "w-full text-left p-2.5 rounded-xl transition-all border flex flex-col gap-0.5 bg-transparent cursor-pointer",
                                    selectedFunction?.name === f.name 
                                      ? "bg-blue-500/10 border-blue-500/30" 
                                      : "hover:bg-white/5 border-transparent hover:border-white/10"
                                  )}
                                >
                                  <span className={cn("text-xs font-bold", selectedFunction?.name === f.name ? "text-blue-400" : "text-neutral-200")}>{f.name}</span>
                                  <span className="text-[10px] text-neutral-500 line-clamp-1">{f.content}</span>
                                </button>
                                {idx >= builtInFuncs.length && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); startEditFunc(idx, f); }}
                                      className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleRemoveFunc(idx - builtInFuncs.length); }}
                                      className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border-none cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                        <input 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="功能名称..."
                          value={newFuncName}
                          onChange={(e) => setNewFuncName(e.target.value)}
                        />
                        <textarea 
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 transition-colors resize-none h-[60px]"
                          placeholder="功能描述内容..."
                          value={newFuncContent}
                          onChange={(e) => setNewFuncContent(e.target.value)}
                        />
                        <button 
                          onClick={handleAddFunc}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors border-none cursor-pointer shadow-lg shadow-blue-900/20"
                        >
                          保存到功能库
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <textarea
                className="w-full h-[100px] bg-transparent border-none p-0 text-[15px] text-neutral-200 placeholder:text-neutral-500 resize-none outline-none leading-relaxed nodrag"
                value={data.content as string}
                onChange={(e) => data.onChange && (data.onChange as any)(id, { content: e.target.value })}
                placeholder="描述你想要生成的画面内容，或引用素材..."
                onDoubleClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between pt-3 nodrag">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="relative">
                  <button 
                    onClick={() => setModelOpen(!modelOpen)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                  >
                    <span>{currentModel.name}</span>
                    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {modelOpen && (
                    <div className="absolute bottom-full left-0 mb-3 w-[180px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                      {IMAGE_MODELS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { (data.onChange as any)(id, { modelId: m.id }); setModelOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[11px] transition-colors border-none bg-transparent cursor-pointer",
                            data.modelId === m.id ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                          )}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setRatioOpen(!ratioOpen)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                  >
                    <span>{data.ratio as string}</span>
                    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {ratioOpen && (
                    <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                      {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(r => (
                        <button
                          key={r}
                          onClick={() => { (data.onChange as any)(id, { ratio: r }); setRatioOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                            data.ratio === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setResOpen(!resOpen)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                  >
                    <span>{data.resolution as string}</span>
                    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {resOpen && (
                    <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                      {['720p', '1080p', '2k', '4k'].map(r => (
                        <button
                          key={r}
                          onClick={() => { (data.onChange as any)(id, { resolution: r }); setResOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                            data.resolution === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setQualityOpen(!qualityOpen)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                  >
                    <span>{data.quality === 'hd' ? '高清' : '标准'}</span>
                    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {qualityOpen && (
                    <div className="absolute bottom-full left-0 w-[80px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                      {[{ id: 'standard', name: '标准' }, { id: 'hd', name: '高清' }].map(q => (
                        <button
                          key={q.id}
                          onClick={() => { (data.onChange as any)(id, { quality: q.id }); setQualityOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                            (data.quality === q.id || (!data.quality && q.id === 'standard')) ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                          )}
                        >
                          {q.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setCountOpen(!countOpen)}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                  >
                    <span>{(data.imageCount as number) || 1} 张</span>
                    <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {countOpen && (
                    <div className="absolute bottom-full right-0 w-[80px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                      {[1, 2, 4].map(c => (
                        <button
                          key={c}
                          onClick={() => { (data.onChange as any)(id, { imageCount: c }); setCountOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                            ((data.imageCount as number) || 1) === c ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                          )}
                        >
                          {c} 张
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  disabled={data.isGenerating as boolean}
                  onClick={onGenerate}
                  className="w-10 h-10 ml-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-90 border-none cursor-pointer disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        <Handle 
          type="source" 
          position={Position.Right} 
          id="right" 
          style={{ top: '150px' }}
        />
        
        {(modelOpen || ratioOpen || resOpen || qualityOpen || assetOpen || replaceImageOpen || countOpen) && (
          <div className="fixed inset-0 z-40" onPointerDown={(e) => { e.stopPropagation(); setModelOpen(false); setRatioOpen(false); setResOpen(false); setQualityOpen(false); setAssetOpen(false); setReplaceImageOpen(false); setCountOpen(false); }} onClick={() => { setModelOpen(false); setRatioOpen(false); setResOpen(false); setQualityOpen(false); setAssetOpen(false); setReplaceImageOpen(false); setCountOpen(false); }} />
        )}
      </div>

      {galleryOpen && data.imageSrcs && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0 }}
          onClick={() => setGalleryOpen(false)}
        >
          <div 
            className="flex flex-col bg-[#1e1f24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-[840px] max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
              <h2 className="text-white/90 text-sm font-medium tracking-wide flex items-center gap-2">
                图片历史记录 <span className="text-white/40 text-xs px-1.5 py-0.5 rounded-md bg-black/30">共 {(data.imageSrcs as string[]).length} 张</span>
              </h2>
              <button 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                onClick={() => setGalleryOpen(false)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {(data.imageSrcs as string[]).map((src, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-[2px] bg-black/40 shadow-sm",
                      data.imageSrc === src ? "border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]" : "border-white/5 hover:border-white/30 opacity-70 hover:opacity-100"
                    )}
                    style={{
                      aspectRatio: (data.ratio as string)?.replace(':', '/') || '1/1'
                    }}
                    onClick={() => {
                      (data.onChange as any)(id, { imageSrc: src });
                      setGalleryOpen(false);
                    }}
                  >
                    <img 
                      src={src} 
                      className={cn(
                        "w-full h-full transition-transform duration-500 group-hover:scale-105", 
                        isExtracted ? "object-contain" : "object-cover"
                      )} 
                      alt="" 
                      referrerPolicy="no-referrer" 
                    />
                    {data.imageSrc === src && (
                      <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md backdrop-blur-md border border-white/10">
                        当前选用
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isFullscreen && fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          <img 
            src={fullscreenImage} 
            alt="Fullscreen" 
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl" 
            referrerPolicy="no-referrer"
          />
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border-none cursor-pointer hover:scale-110 text-2xl"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
