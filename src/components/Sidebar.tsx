import { useState } from 'react';
import { MessageSquare, BookOpen, Languages, Plus, ChevronUp, Image as ImageIcon, X, Network, BookmarkPlus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { Conversation, FuncType } from '../types';
import { MODELS, IMAGE_MODELS } from '../constants';

interface SidebarProps {
  currentFunc: FuncType;
  setCurrentFunc: (func: FuncType) => void;
  conversations: Record<string, Conversation>;
  currentConvId: string | null;
  setCurrentConvId: (id: string | null) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  createNewChat: () => void;
  createNewProject?: (title: string, description: string) => void;
  currentModelId: string;
  setCurrentModelId: (id: string) => void;
  currentModelName: string;
  setCurrentModelName: (name: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({
  currentFunc,
  setCurrentFunc,
  conversations,
  currentConvId,
  setCurrentConvId,
  deleteConversation,
  createNewChat,
  createNewProject,
  currentModelId,
  setCurrentModelId,
  currentModelName,
  setCurrentModelName,
  apiKey,
  setApiKey,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProject = () => {
    if (newProjectTitle.trim() && createNewProject) {
      createNewProject(newProjectTitle.trim(), newProjectDesc.trim());
      setProjectModalOpen(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
    }
  };

  const handleCanvasDramaClick = () => {
    setCurrentFunc('canvasDrama');
    const dramaProjects = Object.values(conversations)
      .filter((c) => c.func === 'canvasDrama')
      .sort((a, b) => b.created - a.created);
    
    // If we're already on a canvas drama project and it still exists, don't change
    if (currentFunc === 'canvasDrama' && currentConvId && conversations[currentConvId]?.func === 'canvasDrama') {
      return;
    }

    if (dramaProjects.length > 0) {
      setCurrentConvId(dramaProjects[0].id);
    } else {
      createNewProject('默认星空', '默认的星空画布');
    }
  };

  const funcConvs = Object.entries(conversations)
    .filter(([, c]) => c.func === currentFunc && (c.messages?.length > 0 || c.func === 'canvasDrama'))
    .sort((a, b) => b[1].created - a[1].created);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups = { today: [] as any[], yesterday: [] as any[], week: [] as any[], older: [] as any[] };
  funcConvs.forEach(([id, c]) => {
    if (c.created >= today) groups.today.push([id, c]);
    else if (c.created >= yesterday) groups.yesterday.push([id, c]);
    else if (c.created >= weekAgo) groups.week.push([id, c]);
    else groups.older.push([id, c]);
  });

    const renderGroup = (label: string, items: any[]) => {
      if (items.length === 0) return null;
      return (
        <div key={label}>
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-2 pt-2 pb-1">
            {label}
          </div>
          {items.map(([id, c]) => (
            <div
              key={id}
              onClick={() => {
                setCurrentConvId(id);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={cn(
                "group flex items-center gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all text-[13px] relative",
                currentConvId === id ? "bg-white shadow-sm text-neutral-900 font-medium" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'chat' && <MessageSquare className="w-3 h-3 opacity-50 shrink-0" />}
              {currentFunc === 'drama' && <BookOpen className="w-3 h-3 opacity-50 shrink-0" />}
              {currentFunc === 'seedance' && <Languages className="w-3 h-3 opacity-50 shrink-0" />}
              {currentFunc === 'canvasDrama' && <Network className="w-3 h-3 opacity-50 shrink-0" />}
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.title}</span>
              <span
                onClick={(e) => deleteConversation(id, e)}
                className="opacity-0 group-hover:opacity-100 text-[11px] text-neutral-500 cursor-pointer p-1 rounded transition-all hover:text-red-500 hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      );
    };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-[#FCFCFC] border-r border-neutral-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-xl md:shadow-none",
          isOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:ml-[-280px]"
        )}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white text-xl shadow-inner">
                ✦
              </div>
              <div className="text-xl font-bold text-neutral-900 tracking-wider">
                繁星AI<span className="text-neutral-500 font-normal text-sm ml-1">创作助手</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 transition-colors hidden md:block"
              title="收起边栏"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 transition-colors md:hidden"
              title="收起边栏"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col py-2 gap-3">
            <button
              onClick={() => setCurrentFunc('chat')}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden",
                currentFunc === 'chat' 
                  ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'chat' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-neutral-900 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <MessageSquare className={cn("w-5 h-5", currentFunc === 'chat' ? "text-neutral-900" : "text-blue-500")} />
              </div>
              <span className="font-medium tracking-wide">AI 对话</span>
            </button>
            
            <button
              onClick={() => setCurrentFunc('drama')}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden",
                currentFunc === 'drama' 
                  ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'drama' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-neutral-900 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <BookOpen className={cn("w-5 h-5", currentFunc === 'drama' ? "text-neutral-900" : "text-orange-500")} />
              </div>
              <span className="font-medium tracking-wide">大神剧本</span>
            </button>
            
            <button
              onClick={() => setCurrentFunc('seedance')}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden",
                currentFunc === 'seedance' 
                  ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'seedance' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-neutral-900 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <Languages className={cn("w-5 h-5", currentFunc === 'seedance' ? "text-neutral-900" : "text-emerald-500")} />
              </div>
              <span className="font-medium tracking-wide">Seedance 转换</span>
            </button>
            
            <button
              onClick={() => setCurrentFunc('yellowImage')}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden",
                currentFunc === 'yellowImage' 
                  ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'yellowImage' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-neutral-900 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <ImageIcon className={cn("w-5 h-5", currentFunc === 'yellowImage' ? "text-neutral-900" : "text-yellow-500")} />
              </div>
              <span className="font-medium tracking-wide">黄色图片</span>
            </button>
            
            <button
              onClick={handleCanvasDramaClick}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden animate-border-breathe",
                currentFunc === 'canvasDrama' 
                  ? "bg-white border-yellow-500/50 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'canvasDrama' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-yellow-500 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <Network className={cn("w-5 h-5", currentFunc === 'canvasDrama' ? "text-yellow-500" : "text-neutral-400")} />
              </div>
              <span className="font-medium tracking-wide font-bold text-red-500">星幕</span>
            </button>
            
            <button
              onClick={() => setCurrentFunc('assets')}
              className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all border text-[16px] text-left w-full relative overflow-hidden",
                currentFunc === 'assets' 
                  ? "bg-white border-neutral-200 text-neutral-900 shadow-sm" 
                  : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {currentFunc === 'assets' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-neutral-900 rounded-r-full" />
              )}
              <div className="w-6 flex items-center justify-center shrink-0">
                <BookmarkPlus className={cn("w-5 h-5", currentFunc === 'assets' ? "text-neutral-900" : "text-emerald-500")} />
              </div>
              <span className="font-medium tracking-wide">资产</span>
            </button>
          </div>
        </div>

        {currentFunc === 'canvasDrama' ? (
          <button
            onClick={() => setProjectModalOpen(true)}
            className="mx-5 mt-4 p-2.5 rounded-md border border-dashed border-neutral-200 bg-transparent cursor-pointer text-[13px] text-neutral-500 transition-all flex items-center justify-center gap-1.5 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-50"
          >
            <Plus className="w-3.5 h-3.5" /> 新建项目
          </button>
        ) : (
          <button
            onClick={createNewChat}
            className="mx-5 mt-4 p-2.5 rounded-md border border-dashed border-neutral-200 bg-transparent cursor-pointer text-[13px] text-neutral-500 transition-all flex items-center justify-center gap-1.5 hover:border-neutral-900 hover:text-neutral-900 hover:bg-neutral-50"
          >
            <Plus className="w-3.5 h-3.5" /> 新建对话
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {funcConvs.length === 0 ? (
            <div className="text-center py-10 px-5 text-neutral-500 text-[13px]">
              <MessageSquare className="w-7 h-7 mx-auto mb-2.5 opacity-30" />
              <div>{currentFunc === 'canvasDrama' ? '暂无项目记录' : '暂无对话记录'}</div>
            </div>
          ) : (
            <>
              {renderGroup('今天', groups.today)}
              {renderGroup('昨天', groups.yesterday)}
              {renderGroup('近7天', groups.week)}
              {renderGroup('更早', groups.older)}
            </>
          )}
        </div>

        <div className="p-3 px-4 border-t border-neutral-200 flex flex-col gap-2">
          <div className="relative">
            <div
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2 p-2 px-2.5 rounded-md bg-white border border-neutral-200 cursor-pointer shadow-sm transition-all hover:bg-neutral-50"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
              <div className="text-xs text-neutral-600 flex-1">{currentModelName}</div>
              <ChevronUp className="w-3 h-3 text-neutral-400 shrink-0" />
            </div>
            
            {modelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 bg-white border border-neutral-200 rounded-md shadow-lg mb-1 z-50 overflow-hidden max-h-[320px] overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    模型选择 (Models)
                  </div>
                  {(currentFunc === 'yellowImage' ? IMAGE_MODELS : MODELS).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setCurrentModelId(m.id);
                        setCurrentModelName(m.name);
                        setModelDropdownOpen(false);
                      }}
                      className={cn(
                        "px-3 py-2 text-xs cursor-pointer transition-all flex items-center justify-between",
                        currentModelId === m.id ? "bg-neutral-50 font-semibold text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      <span>{m.name}</span>
                      {m.badge && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-sm font-medium",
                          currentModelId === m.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                        )}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-1">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 px-1">API Key (Gemini)</div>
            <input
              type="password"
              placeholder="输入您的 API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white border border-neutral-200 shadow-sm rounded-md px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>
      </aside>

      {/* New Project Modal */}
      {projectModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">新建星幕项目</h3>
              <button 
                onClick={() => setProjectModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 border-none bg-transparent cursor-pointer p-1 rounded-md hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">项目名称</label>
                <input 
                  type="text" 
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  autoFocus
                  placeholder="如：都市赘婿复仇记"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-inherit transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">项目简介 (可选)</label>
                <textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="简单描述一下你的短剧想法..."
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 border-inherit transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button 
                onClick={() => setProjectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleCreateProject}
                disabled={!newProjectTitle.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
