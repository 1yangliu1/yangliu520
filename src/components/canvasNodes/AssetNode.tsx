import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus, X, Image as ImageIcon, Music, BookmarkPlus } from 'lucide-react';
import { Asset } from '../../types';
import { cn } from '../../lib/utils';
import { NodeGrabber } from './NodeGrabber';
import { motion, AnimatePresence } from 'motion/react';

export function AssetNode({ data, id, selected }: NodeProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const allAssets = (data.allAssets || []) as Asset[];
  const selectedAssetIds = (data.selectedAssetIds || []) as string[];
  
  const selectedAssets = selectedAssetIds
    .map(assetId => allAssets.find(a => a.id === assetId))
    .filter(Boolean) as Asset[];

  const handleAddAsset = (assetId: string) => {
    const newSelected = [...selectedAssetIds, assetId];
    if (data.onChange) {
      (data.onChange as any)(id, { selectedAssetIds: newSelected });
    }
    setIsDropdownOpen(false);
  };

  const handleRemoveAsset = (assetId: string) => {
    const newSelected = selectedAssetIds.filter(id => id !== assetId);
    if (data.onChange) {
      (data.onChange as any)(id, { selectedAssetIds: newSelected });
    }
  };
  
  const handleSaveToLibrary = (e: React.MouseEvent, url: string, type: 'image' | 'audio') => {
    e.stopPropagation();
    if (data.onSaveAsset) {
      (data.onSaveAsset as any)(url, type);
    }
  };

  const handleImageDoubleClick = (url: string) => {
    setFullscreenImage(url);
    setIsFullscreen(true);
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
      "bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl flex flex-col font-sans relative group transition-all duration-300 w-[320px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
      selected ? "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "hover:border-white/20"
    )}>
      <NodeGrabber nodeId={id} onSelectConnected={data.onSelectConnected as any} selected={selected} />
      
      <div className="p-3 border-b border-white/5 bg-white/5 text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] text-center drag-handle cursor-move rounded-t-2xl">
        {(data.title as string) || '资产集合'}
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {selectedAssets.map((asset, idx) => (
              <motion.div 
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group/asset rounded-xl overflow-hidden bg-white/5 aspect-video border border-white/10 flex items-center justify-center transition-all hover:border-white/30"
              >
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" onDoubleClick={() => handleImageDoubleClick(asset.url)} />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Music className="w-6 h-6 text-blue-400" />
                    <span className="text-[10px] text-neutral-400 px-2 truncate w-full text-center">{asset.name}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {asset.id.startsWith('temp-') && (
                    <button
                      onClick={(e) => handleSaveToLibrary(e, asset.url, asset.type as any)}
                      className="w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center border-none cursor-pointer shadow-lg transition-transform hover:scale-110"
                      title="存入资产"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="w-8 h-8 bg-white/10 hover:bg-red-500 text-white rounded-lg flex items-center justify-center border-none cursor-pointer shadow-lg transition-transform hover:scale-110"
                    title="移除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedAssets.length === 0 && (
            <div className="col-span-2 py-8 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/5 rounded-2xl text-neutral-500">
               <ImageIcon className="w-8 h-8 opacity-20" />
               <span className="text-xs">暂无资产内容</span>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[12px] font-bold text-neutral-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner"
          >
            <Plus className="w-4 h-4" /> 选择资产
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[250px] overflow-y-auto p-1 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
              <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 mb-1">可用资产</div>
              {allAssets.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-neutral-500 italic">
                  资产库为空...
                </div>
              ) : (
                allAssets.map(asset => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  if (isSelected) return null;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAddAsset(asset.id)}
                      className="p-2 mx-1 rounded-xl hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border border-transparent hover:border-white/5"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-neutral-200 truncate">{asset.name}</span>
                        <span className="text-[10px] text-neutral-500 uppercase">{asset.type === 'image' ? '图片' : '音频'}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        className="w-4 h-4 bg-blue-500 border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-125 transition-transform"
        style={{ right: -6 }}
      />
      
      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </motion.div>

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
