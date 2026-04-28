import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Loader2, 
  BoxSelect, 
  Brain, 
  ChevronDown, 
  Target,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NodeGrabber } from './NodeGrabber';
import { motion, AnimatePresence } from 'motion/react';
import { IMAGE_MODELS, VIDEO_MODELS } from '../../constants';

export function MainScriptNode({ data, id, selected }: NodeProps) {
  const [mode, setMode] = useState<'extract' | 'interactiveDrama'>('extract');
  const [imageModelOpen, setImageModelOpen] = useState(false);
  const [imageRatioOpen, setImageRatioOpen] = useState(false);
  const [imageResOpen, setImageResOpen] = useState(false);
  const [videoModelOpen, setVideoModelOpen] = useState(false);
  const [videoRatioOpen, setVideoRatioOpen] = useState(false);
  const [videoResOpen, setVideoResOpen] = useState(false);
  const [videoDurationOpen, setVideoDurationOpen] = useState(false);

  const thinkingRef = React.useRef<HTMLDivElement>(null);
  const hasScript = !!(data.script as string)?.trim();
  const isGenerating = !!data.isExtracting || !!data.isGeneratingPrompt;
  const thinking = data.thinking as string;

  // Initialize data parameters if they don't exist
  const extractParams = (data.extractParams as any) || {
    modelId: IMAGE_MODELS[0].id,
    ratio: '16:9',
    resolution: '1080p'
  };
  const promptParams = (data.promptParams as any) || {
    modelId: VIDEO_MODELS[0].id,
    ratio: '16:9',
    resolution: '1080p',
    videoDurationId: '5s'
  };

  const updateExtractParams = (updates: any) => {
    if (data.onChange) {
      (data.onChange as any)(id, { extractParams: { ...extractParams, ...updates } });
    }
  };

  const updatePromptParams = (updates: any) => {
    if (data.onChange) {
      (data.onChange as any)(id, { promptParams: { ...promptParams, ...updates } });
    }
  };

  // Auto-scroll thinking process to bottom
  React.useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [thinking]);

  const handleGlobalClick = () => {
    setImageModelOpen(false);
    setImageRatioOpen(false);
    setImageResOpen(false);
    setVideoModelOpen(false);
    setVideoRatioOpen(false);
    setVideoResOpen(false);
    setVideoDurationOpen(false);
  };

  React.useEffect(() => {
    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, []);

  const handleGenerate = () => {
    if (mode === 'extract') {
      if (data.onExtract) (data.onExtract as any)(id);
    } else {
      if (data.onGeneratePrompt) (data.onGeneratePrompt as any)(id);
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl shadow-2xl border transition-all duration-300 w-[660px] flex flex-col font-sans relative group overflow-hidden",
      selected ? "border-purple-500 ring-4 ring-purple-500/10" : "border-neutral-200"
    )}>
      <NodeGrabber nodeId={id} onSelectConnected={data.onSelectConnected as any} selected={selected} />
      
      {/* Source Handles */}
      <Handle type="source" position={Position.Bottom} id="extract" style={{ left: '30%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="prompt" style={{ left: '70%', opacity: 0 }} />
      
      {/* Header */}
      <div className="p-5 border-b border-neutral-100 flex items-center justify-center drag-handle bg-gradient-to-r from-neutral-50 to-white rounded-t-3xl cursor-move relative">
        <div className="flex items-center gap-2 bg-neutral-900 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm absolute left-5">
          <Sparkles className="w-3 h-3" />
          超级提示词
        </div>
        <input 
          className="ml-4 font-black text-2xl bg-transparent border-none outline-none text-neutral-900 flex-1 text-center placeholder:text-neutral-300 pointer-events-auto"
          value={data.title as string}
          onChange={(e) => data.onChange && (data.onChange as any)(id, { title: e.target.value })}
          placeholder="给这组提示词起个名字..."
        />
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col gap-5">
        <div className="relative">
          <textarea 
            className="w-full h-[220px] resize-none border-none p-0 text-[15px] focus:ring-0 outline-none text-neutral-800 placeholder:text-neutral-300 leading-relaxed nodrag"
            value={data.script as string}
            onChange={(e) => data.onChange && (data.onChange as any)(id, { script: e.target.value })}
            placeholder="在此输入或粘贴剧本内容，我们将为您提取素材或生成动态提示词..."
          />
          <div className="absolute bottom-0 right-0 p-2 text-[10px] text-neutral-400 font-mono tracking-tighter">
            {(data.script as string || '').length} CHARS
          </div>
        </div>

        {/* Mode Selector & Action */}
        <div className="flex flex-col gap-4 relative z-10 nodrag">
          <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setMode('extract')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-none cursor-pointer",
                mode === 'extract' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
              )}
            >
              <ImageIcon className={cn("w-3.5 h-3.5", mode === 'extract' ? "text-blue-500" : "")} />
              提取素材
            </button>
            <button
              onClick={() => setMode('interactiveDrama')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-none cursor-pointer",
                mode === 'interactiveDrama' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
              )}
            >
              <Video className={cn("w-3.5 h-3.5", mode === 'interactiveDrama' ? "text-purple-500" : "")} />
              互动剧提示词
            </button>
          </div>

          {/* Options depending on mode */}
          {mode === 'extract' && (
            <div className="flex items-center gap-4 bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-100">
              <span className="text-xs font-medium text-neutral-500 mr-2 flex-shrink-0">默认设置:</span>
              
              <div className="relative">
                <button
                  onPointerDown={(e) => { e.stopPropagation(); setImageModelOpen(!imageModelOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span className="truncate max-w-[120px]">{IMAGE_MODELS.find(m => m.id === extractParams.modelId)?.name || '选择模型'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {imageModelOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {IMAGE_MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { updateExtractParams({ modelId: m.id }); setImageModelOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          extractParams.modelId === m.id ? "text-blue-600 bg-blue-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
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
                  onPointerDown={(e) => { e.stopPropagation(); setImageRatioOpen(!imageRatioOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span>{extractParams.ratio}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {imageRatioOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[100px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(r => (
                      <button
                        key={r}
                        onClick={() => { updateExtractParams({ ratio: r }); setImageRatioOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          extractParams.ratio === r ? "text-blue-600 bg-blue-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
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
                  onPointerDown={(e) => { e.stopPropagation(); setImageResOpen(!imageResOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span>{extractParams.resolution}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {imageResOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[100px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {['720p', '1080p', '2k', '4k'].map(r => (
                      <button
                        key={r}
                        onClick={() => { updateExtractParams({ resolution: r }); setImageResOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          extractParams.resolution === r ? "text-blue-600 bg-blue-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'interactiveDrama' && (
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-100 flex-wrap">
              <span className="text-xs font-medium text-neutral-500 flex-shrink-0">默认设置:</span>
              
              <div className="relative">
                <button
                  onPointerDown={(e) => { e.stopPropagation(); setVideoModelOpen(!videoModelOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span className="truncate max-w-[120px]">{VIDEO_MODELS.find(m => m.id === promptParams.modelId)?.name || '选择模型'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {videoModelOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {VIDEO_MODELS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { updatePromptParams({ modelId: m.id }); setVideoModelOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          promptParams.modelId === m.id ? "text-purple-600 bg-purple-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
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
                  onPointerDown={(e) => { e.stopPropagation(); setVideoRatioOpen(!videoRatioOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span>{promptParams.ratio}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {videoRatioOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[100px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(r => (
                      <button
                        key={r}
                        onClick={() => { updatePromptParams({ ratio: r }); setVideoRatioOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          promptParams.ratio === r ? "text-purple-600 bg-purple-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
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
                  onPointerDown={(e) => { e.stopPropagation(); setVideoResOpen(!videoResOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span>{promptParams.resolution}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {videoResOpen && (
                  <div className="absolute top-full left-0 mt-1 w-[100px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {['720p', '1080p', '2k', '4k'].map(r => (
                      <button
                        key={r}
                        onClick={() => { updatePromptParams({ resolution: r }); setVideoResOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          promptParams.resolution === r ? "text-purple-600 bg-purple-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
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
                  onPointerDown={(e) => { e.stopPropagation(); setVideoDurationOpen(!videoDurationOpen); }}
                  className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1.5 rounded-lg cursor-pointer font-medium"
                >
                  <span>{promptParams.videoDurationId}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>
                {videoDurationOpen && (
                  <div className="absolute top-full right-0 mt-1 w-[100px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden py-1" onPointerDown={(e) => e.stopPropagation()}>
                    {['5s', '10s', '15s'].map(r => (
                      <button
                        key={r}
                        onClick={() => { updatePromptParams({ videoDurationId: r }); setVideoDurationOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs border-none bg-transparent cursor-pointer transition-colors",
                          promptParams.videoDurationId === r ? "text-purple-600 bg-purple-50 font-bold" : "text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            disabled={isGenerating || !hasScript}
            onClick={handleGenerate}
            className={cn(
              "w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 border-none cursor-pointer group/btn overflow-hidden relative",
              hasScript && !isGenerating
                ? "bg-neutral-900 text-white hover:bg-black shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98]" 
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            )}
          >
            {isGenerating && (
              <motion.div 
                className="absolute inset-0 bg-neutral-800"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            <div className="relative flex items-center gap-2">
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Target className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
              )}
              <span className="tracking-widest uppercase">
                {isGenerating ? "正在智能处理中..." : (mode === 'extract' ? "开始提取绘图素材" : "生成互动剧提示词")}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Thought Process Section */}
      <AnimatePresence>
        {thinking && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-100 bg-neutral-50/50 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="text-[10px] font-black text-neutral-400 tracking-[3px] uppercase">AI 思考过程</span>
            </div>
            <div 
              ref={thinkingRef}
              className="text-[11px] text-neutral-500 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto max-h-[120px] custom-scrollbar pr-2"
            >
              {thinking}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


