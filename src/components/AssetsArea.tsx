import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Music, Upload, Trash2, Plus, Download, Menu, PanelLeftOpen } from 'lucide-react';
import { Asset } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AssetsAreaProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AssetsArea({ assets, setAssets, sidebarOpen, setSidebarOpen }: AssetsAreaProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'audio'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAssets: Asset[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newAssets.push({
              id: `asset-${uuidv4()}`,
              type: file.type.startsWith('image/') ? 'image' : 'audio',
              url: ev.target.result as string,
              name: file.name,
              createdAt: Date.now()
            });
            
            if (newAssets.length === Array.from(files).filter(f => f.type.startsWith('image/') || f.type.startsWith('audio/')).length) {
                setAssets(prev => [...newAssets, ...prev]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssets(prev => prev.filter(a => a.id !== id));
  };
  
  const handleDownload = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = asset.name;
    a.click();
  };

  const filteredAssets = assets.filter(a => filter === 'all' || a.type === filter);

  return (
    <div className="flex-1 w-full h-full bg-white flex flex-col font-sans">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1 -ml-1 border-none bg-transparent text-neutral-900 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden md:block p-1.5 -ml-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
              title="展开边栏"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">资产</h2>
            <p className="text-xs text-neutral-500 mt-1">管理您上传的图片、音频或系统生成的资源</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 p-1 rounded-md">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors border-none cursor-pointer ${filter === 'all' ? 'bg-white shadow-sm text-neutral-900' : 'bg-transparent text-neutral-500 hover:text-neutral-700'}`}
            >
              全部
            </button>
            <button 
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors border-none cursor-pointer ${filter === 'image' ? 'bg-white shadow-sm text-neutral-900' : 'bg-transparent text-neutral-500 hover:text-neutral-700'}`}
            >
              图片
            </button>
            <button 
              onClick={() => setFilter('audio')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors border-none cursor-pointer ${filter === 'audio' ? 'bg-white shadow-sm text-neutral-900' : 'bg-transparent text-neutral-500 hover:text-neutral-700'}`}
            >
              音频
            </button>
          </div>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors border-none cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            上传资产
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,audio/*" 
            multiple 
            onChange={handleFileChange} 
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
               <Plus className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm">资产目前是空的</p>
            <p className="text-xs mt-1 opacity-70">点击右上角上传本地文件，或在其他功能中保存到资产</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="group relative bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col aspect-square">
                {asset.type === 'image' ? (
                  <div className="flex-1 w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-1 w-full bg-neutral-100 flex items-center justify-center flex-col gap-2">
                    <Music className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
                
                <div className="p-2.5 bg-white border-t border-neutral-100 flex items-center gap-2">
                  {asset.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" /> : <Music className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                  <span className="text-xs text-neutral-700 truncate flex-1">{asset.name}</span>
                </div>
                
                {/* Overlay actions */}
                <div className="absolute inset-x-0 top-0 p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/50 to-transparent">
                  <button 
                    onClick={(e) => handleDownload(asset, e)}
                    className="w-6 h-6 bg-white/20 hover:bg-white/40 text-white rounded flex items-center justify-center border-none cursor-pointer backdrop-blur-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(asset.id, e)}
                    className="w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded flex items-center justify-center border-none cursor-pointer backdrop-blur-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {asset.type === 'audio' && (
                  <audio controls src={asset.url} className="absolute bottom-10 left-0 right-0 w-full h-8 px-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
