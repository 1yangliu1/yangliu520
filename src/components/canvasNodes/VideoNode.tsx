import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { Video, Monitor, BoxSelect, Loader2, BookmarkPlus, Library, X, Maximize2, SlidersHorizontal, ArrowUp, Film, Play, Pause } from 'lucide-react';
import { VIDEO_MODELS } from '../../constants';
import { cn } from '../../lib/utils';
import { Asset } from '../../types';
import { NodeGrabber } from './NodeGrabber';

export function VideoNode({ data, id, selected }: NodeProps) {
  const zoom = useStore((s: any) => s.transform[2]);
  const isExtracted = data.variant === 'extracted';
  const [modelOpen, setModelOpen] = useState(false);
  const [ratioOpen, setRatioOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.error("Play failed", err));
      }
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setModelOpen(false);
      setRatioOpen(false);
      setAssetOpen(false);
      setResOpen(false);
      setDurationOpen(false);
    };
    
    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, []);

  const currentModel = VIDEO_MODELS.find(m => m.id === data.modelId) || VIDEO_MODELS[0];
  const allAssets = (data.allAssets || []) as Asset[];
  const inputImages = (data.attachedImages as string[]) || [];

  const handleClearVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onChange) {
      (data.onChange as any)(id, { videoSrc: null, videoSrcs: null });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.videoSrc) {
      const a = document.createElement('a');
      a.href = data.videoSrc as string;
      a.download = `video-${id}.mp4`;
      a.click();
    }
  };

  const onGenerate = () => {
    if (data.onGenerate) {
      (data.onGenerate as any)(id);
    }
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
                  <span className="text-[13px] font-black text-white uppercase tracking-widest leading-none">{(data.title as string) || "视频提示词"}</span>
                </div>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative flex-1 flex flex-col gap-2">
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
                  placeholder="形容视频内容..."
                  onDoubleClick={(e) => e.stopPropagation()}
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
                        {VIDEO_MODELS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { (data.onChange as any)(id, { modelId: m.id }); setModelOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] transition-colors border-none bg-transparent cursor-pointer",
                              (data.modelId === m.id || (!data.modelId && m.id === 'veo3.1-components')) ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
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
                      <span>{data.ratio as string || '16:9'}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {ratioOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { ratio: r }); setRatioOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              (data.ratio === r || (!data.ratio && r === '16:9')) ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
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
                      onClick={() => setDurationOpen(!durationOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{(data.duration as string) || '5s'}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {durationOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s', '12s', '13s', '14s', '15s'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { duration: r }); setDurationOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              ((data.duration as string) || '5s') === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  disabled={data.isGenerating as boolean}
                  onClick={onGenerate}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-90 border-none cursor-pointer disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>
            </div>
          )}

          {/* Top: Video Output Area */}
          <div 
            className={cn(
              "bg-black/50 backdrop-blur-md flex flex-none items-center justify-center overflow-hidden relative group/vid cursor-pointer transition-all duration-300 shadow-sm",
              isExtracted ? "w-[360px] min-h-[250px] rounded-r-xl" : "h-[450px] rounded-xl",
              selected && "ring-2 ring-white ring-offset-1 ring-offset-transparent"
            )}
            style={{
              aspectRatio: isExtracted ? undefined : ((data.ratio as string)?.replace(':', '/') || '16/9')
            }}
          >
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-neutral-900/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 text-[10px] z-10 font-medium border border-white/10">
              <Video className="w-3 h-3" />
              <span>视频节点 {id.split('-').pop()}</span>
            </div>

            {data.videoSrc ? (
              <>
                <video 
                  ref={videoRef}
                  src={data.videoSrc as string} 
                  className="w-full h-full object-contain relative z-20" 
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                
                {/* Play/Pause Center Overlay Button */}
                <div 
                  className={cn(
                    "absolute inset-0 flex items-center justify-center z-30 transition-all duration-300 pointer-events-none group-hover/vid:bg-black/20",
                    !isPlaying ? "bg-black/40" : ""
                  )}
                >
                  <button
                    onClick={togglePlay}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border-none shadow-xl backdrop-blur-md cursor-pointer pointer-events-auto transition-all",
                      isPlaying 
                        ? "bg-white/10 text-white/50 opacity-0 group-hover/vid:opacity-100 hover:bg-white/20 hover:text-white" 
                        : "bg-white/20 text-white hover:bg-white/30 hover:scale-110"
                    )}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                </div>
                
                <button 
                  onClick={handleClearVideo}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity z-50 border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

          <div className="absolute bottom-2 right-2 flex items-center gap-2 z-50 nodrag">
            {isExtracted && (
                <div className="relative">
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setAssetOpen(assetOpen ? false : true); }}
                    className="bg-black/60 hover:bg-black/80 text-white text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border-none cursor-pointer h-8 shadow-lg backdrop-blur-sm"
                  >
                    <Library className="w-3.5 h-3.5" /> 替换视频
                  </button>
                  
                  {assetOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-[240px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto p-1 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">选择替换视频</span>
                          <X className="w-3 h-3 text-neutral-500 cursor-pointer hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setAssetOpen(false); }} />
                        </div>
                        {allAssets.filter(a => a.type === 'video').length === 0 ? (
                          <div className="p-6 text-center text-[10px] text-neutral-500 italic">资产库暂无视频...</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 p-2">
                            {allAssets.filter(a => a.type === 'video').map(asset => (
                              <button
                                key={asset.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (data.onChange) {
                                      (data.onChange as any)(id, { videoSrc: asset.url });
                                    }
                                    setAssetOpen(false);
                                }}
                                className="relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-blue-500 group/asset p-0 cursor-pointer transition-all"
                              >
                                <video src={asset.url} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                  )}
                </div>
            )}

            {data.videoSrc ? (
              <div className="flex items-center gap-2 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                {data.onSaveAsset && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      (data.onSaveAsset as any)(data.videoSrc as string, 'video');
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
            ) : null}
          </div>
              </>
            ) : (
              <div className="text-blue-400/60 text-xs flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                  <Film className="w-6 h-6 text-blue-400" />
                </div>
                <span className="font-semibold tracking-tight">待生成视频</span>
              </div>
            )}
            
            {data.isGenerating && (
              <div className="absolute inset-0 bg-[#0a0a0a]/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-40">
                <div className="p-3 bg-[#1a1a1a] rounded-2xl shadow-xl border border-white/5">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
                <span className="text-xs font-bold text-neutral-300 tracking-wider uppercase">视频生成中...</span>
                {data.genStatus && <span className="text-[10px] text-neutral-400 max-w-[80%] text-center px-4">{(data.genStatus as string)}</span>}
              </div>
            )}

            {data.error && !data.isGenerating && (
              <div className="absolute inset-0 bg-red-950/40 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-red-400 tracking-wider uppercase">生成失败</span>
                  <span className="text-[10px] text-red-300/80 line-clamp-3">{data.error as string}</span>
                </div>
                <button 
                  onClick={onGenerate}
                  className="mt-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-full font-bold transition-colors border-none cursor-pointer"
                >
                  重试
                </button>
              </div>
            )}
          </div>

          {/* Bottom Control Area - Inspired by ImageNode */}
          {selected && !isExtracted && (
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
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">首帧/参考图</span>
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
                    <div className="absolute top-0 right-full mr-3 w-[240px] bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[300px] overflow-y-auto p-1 py-2 animate-in fade-in slide-in-from-right-2 duration-200">
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
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Input Row */}
              <div className="relative text-left">
                <textarea
                  className="w-full h-[100px] bg-transparent border-none p-0 text-[15px] text-neutral-200 placeholder:text-neutral-500 resize-none outline-none leading-relaxed nodrag"
                  value={data.content as string}
                  onChange={(e) => data.onChange && (data.onChange as any)(id, { content: e.target.value })}
                  placeholder="描述视频的动效、运镜或场景变化..."
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
                        {VIDEO_MODELS.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { (data.onChange as any)(id, { modelId: m.id }); setModelOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] transition-colors border-none bg-transparent cursor-pointer",
                              (data.modelId === m.id || (!data.modelId && m.id === 'veo3.1-components')) ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
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
                      <span>{data.ratio as string || '16:9'}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {ratioOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { ratio: r }); setRatioOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              (data.ratio === r || (!data.ratio && r === '16:9')) ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
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
                      onClick={() => setDurationOpen(!durationOpen)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors border-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer font-medium tracking-wide"
                    >
                      <span>{(data.duration as string) || '5s'}</span>
                      <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {durationOpen && (
                      <div className="absolute bottom-full left-0 w-[100px] mb-3 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar py-1" onPointerDown={(e) => e.stopPropagation()}>
                        {['4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s', '12s', '13s', '14s', '15s'].map(r => (
                          <button
                            key={r}
                            onClick={() => { (data.onChange as any)(id, { duration: r }); setDurationOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-[11px] border-none bg-transparent cursor-pointer transition-colors",
                              ((data.duration as string) || '5s') === r ? "text-purple-400 bg-purple-400/10 font-bold" : "text-neutral-400 hover:bg-white/5"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={data.isGenerating as boolean}
                    onClick={onGenerate}
                    className="w-10 h-10 ml-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-90 border-none cursor-pointer disabled:opacity-50"
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
        
        {(modelOpen || ratioOpen || assetOpen || resOpen || durationOpen) && (
          <div className="fixed inset-0 z-40" onPointerDown={(e) => { e.stopPropagation(); setModelOpen(false); setRatioOpen(false); setAssetOpen(false); setResOpen(false); setDurationOpen(false); }} onClick={() => { setModelOpen(false); setRatioOpen(false); setAssetOpen(false); setResOpen(false); setDurationOpen(false); }} />
        )}
      </div>

      {isFullscreen && fullscreenVideo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md"
          style={{ position: 'fixed', top: 0, left: 0 }}
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video 
              src={fullscreenVideo} 
              className="w-full h-full object-contain" 
              controls
              autoPlay
            />
            <button 
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all border-none cursor-pointer z-50 text-xl"
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
