import { MessageSquare, Film, Languages, Wand2, PenTool, Book, Lightbulb, Clapperboard, Layers, Image as ImageIcon, BookOpen } from 'lucide-react';
import { FuncType } from '../types';

interface WelcomeScreenProps {
  currentFunc: FuncType;
  quickSend: (text: string) => void;
  currentDramaSubFunc?: string;
  setCurrentDramaSubFunc?: (val: string) => void;
  currentSeedanceSubFunc?: string;
  setCurrentSeedanceSubFunc?: (val: string) => void;
}

export function WelcomeScreen({ currentFunc, quickSend, currentDramaSubFunc, setCurrentDramaSubFunc, currentSeedanceSubFunc, setCurrentSeedanceSubFunc }: WelcomeScreenProps) {
  if (currentFunc === 'chat') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-900 mb-5">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div className="text-[22px] font-bold text-neutral-900 mb-1.5">有什么可以帮您？</div>
        <div className="text-sm text-neutral-500 mb-8 max-w-[400px] leading-relaxed">
          我是繁星AI助手，可以回答问题、撰写文案、编写代码等
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-[640px]">
          <div onClick={() => quickSend('帮我写一篇短视频脚本')} className="p-4 border border-neutral-200 rounded-xl cursor-pointer transition-all text-left hover:border-neutral-900 hover:shadow-sm">
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">📝 短视频脚本</div>
            <div className="text-xs text-neutral-500 leading-relaxed">帮我写一个吸引人的短视频脚本</div>
          </div>
          <div onClick={() => quickSend('帮我润色一段文案')} className="p-4 border border-neutral-200 rounded-xl cursor-pointer transition-all text-left hover:border-neutral-900 hover:shadow-sm">
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">✨ 文案润色</div>
            <div className="text-xs text-neutral-500 leading-relaxed">优化现有文案，提升表达效果</div>
          </div>
          <div onClick={() => quickSend('给我一些创意灵感')} className="p-4 border border-neutral-200 rounded-xl cursor-pointer transition-all text-left hover:border-neutral-900 hover:shadow-sm">
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">💡 创意灵感</div>
            <div className="text-xs text-neutral-500 leading-relaxed">获取新鲜的内容创作灵感</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFunc === 'drama') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-400 mb-5">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="text-[22px] font-bold text-neutral-900 mb-1.5">大神剧本工作台</div>
        <div className="text-sm text-neutral-500 mb-8 max-w-[400px] leading-relaxed">
          选择一个功能，然后在下方输入框直接输入内容开始创作
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[640px]">
          <div onClick={() => setCurrentDramaSubFunc?.('1.优化剧本')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentDramaSubFunc === '1.优化剧本' ? 'border-orange-400 bg-orange-50/30' : 'border-neutral-200 hover:border-orange-400 hover:bg-orange-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
              <Wand2 className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">优化剧本</div>
            <div className="text-xs text-neutral-500 leading-relaxed">梳理现有剧本，增加镜头描述，优化格式</div>
          </div>
          <div onClick={() => setCurrentDramaSubFunc?.('2.剧本续写')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentDramaSubFunc === '2.剧本续写' ? 'border-orange-400 bg-orange-50/30' : 'border-neutral-200 hover:border-orange-400 hover:bg-orange-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-400 flex items-center justify-center mb-2.5">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">剧本续写</div>
            <div className="text-xs text-neutral-500 leading-relaxed">根据已有章节，续写后续剧情</div>
          </div>
          <div onClick={() => setCurrentDramaSubFunc?.('3.小说改剧本')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentDramaSubFunc === '3.小说改剧本' ? 'border-orange-400 bg-orange-50/30' : 'border-neutral-200 hover:border-orange-400 hover:bg-orange-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2.5">
              <Book className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">小说改剧本</div>
            <div className="text-xs text-neutral-500 leading-relaxed">将小说或文章改编为动态漫剧本</div>
          </div>
          <div onClick={() => setCurrentDramaSubFunc?.('4.原创剧本')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentDramaSubFunc === '4.原创剧本' ? 'border-orange-400 bg-orange-50/30' : 'border-neutral-200 hover:border-orange-400 hover:bg-orange-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-2.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">原创剧本</div>
            <div className="text-xs text-neutral-500 leading-relaxed">根据您的要求，生成全新原创剧本</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFunc === 'seedance') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-5">
          <Languages className="w-6 h-6" />
        </div>
        <div className="text-[22px] font-bold text-neutral-900 mb-1.5">Seedance 提示词转换</div>
        <div className="text-sm text-neutral-500 mb-8 max-w-[400px] leading-relaxed">
          将剧本转换为适配 Seedance 2.0 的视频生成提示词，每段15秒，电影级运镜
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[480px]">
          <div onClick={() => setCurrentSeedanceSubFunc?.('互动剧提示词')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentSeedanceSubFunc === '互动剧提示词' ? 'border-emerald-500 bg-emerald-50/30' : 'border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2.5">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">互动剧提示词</div>
            <div className="text-xs text-neutral-500 leading-relaxed">直接开始，粘贴剧本转换为Seedance 15秒短视频分镜提示词</div>
          </div>
          <div onClick={() => setCurrentSeedanceSubFunc?.('素材提取')} className={`p-4.5 border rounded-xl cursor-pointer transition-all text-left ${currentSeedanceSubFunc === '素材提取' ? 'border-emerald-500 bg-emerald-50/30' : 'border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30'}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">素材提取</div>
            <div className="text-xs text-neutral-500 leading-relaxed">识别剧本素材，提取角色、道具、场景、阵营等设定图提示词</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFunc === 'yellowImage') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500 mb-5 border border-yellow-100">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div className="text-[22px] font-bold text-neutral-900 mb-1.5">图片生成工具</div>
        <div className="text-sm text-neutral-500 mb-8 max-w-[400px] leading-relaxed">
          使用最先进的模型为您生成各种创意图片。
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[500px]">
          <div onClick={() => quickSend('生成一张赛博朋克风格的未来城市风景图，带有霓虹灯和飞行汽车。')} className="p-4 border border-yellow-200 rounded-xl cursor-pointer transition-all text-left hover:border-yellow-500 bg-yellow-50/20">
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">🌆 未来城市</div>
            <div className="text-xs text-neutral-500 leading-relaxed">赛博朋克风格的风景图推荐</div>
          </div>
          <div onClick={() => quickSend('生成一只穿着宇航服的小猫在月球上探索的可爱插画。')} className="p-4 border border-yellow-200 rounded-xl cursor-pointer transition-all text-left hover:border-yellow-500 bg-yellow-50/20">
            <div className="text-[13px] font-semibold text-neutral-900 mb-1">🐱 卡通插画</div>
            <div className="text-xs text-neutral-500 leading-relaxed">可爱有趣的动物或场景插图</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
