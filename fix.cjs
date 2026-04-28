const fs = require('fs');
let s = fs.readFileSync('src/components/CanvasDramaArea.tsx', 'utf8');

// Replace new project modal
s = s.replace(/className="bg-white rounded-xl shadow-2xl w-full max-w-sm/g, 'className="bg-[#161618] rounded-xl shadow-2xl shadow-black/50 border border-[#333] w-full max-w-sm');
s = s.replace(/<h2 className="text-lg font-bold text-neutral-900 mb-1">/g, '<h2 className="text-lg font-bold text-neutral-200 mb-1">');
s = s.replace(/<div className="bg-neutral-50 px-5 py-4 border-t border-neutral-100 flex justify-end gap-2">/g, '<div className="bg-[#202023] px-5 py-4 border-t border-[#333] flex justify-end gap-2">');
s = s.replace(/text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50/g, 'text-neutral-300 bg-[#252528] border border-[#444] hover:bg-[#303034]');
s = s.replace(/bg-neutral-900 hover:bg-black/g, 'bg-[#EED3A8] text-black hover:bg-[#d5bc96]');

// Replace context menu
s = s.replace(/className="absolute z-50 bg-white shadow-2xl rounded-xl border border-neutral-200/g, 'className="absolute z-50 bg-[#161618] shadow-2xl rounded-xl border border-[#333]');
s = s.replace(/hover:bg-red-50 text-red-600/g, 'hover:bg-red-900/30 text-red-500');

// Replace history/assets panel
s = s.replace(/bg-white\/95 backdrop-blur-xl rounded-2xl shadow-\[0_20px_50px_rgba\(0,0,0,0.15\)\] border border-neutral-200\/60/g, 'bg-[#161618]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#333]');
s = s.replace(/bg-white border border-neutral-200 rounded-xl/g, 'bg-[#161618] border border-[#333] rounded-xl');
s = s.replace(/bg-white\/50/g, 'bg-[#202023]/50');
s = s.replace(/border-neutral-100/g, 'border-[#333]');
s = s.replace(/bg-neutral-50 hover:bg-white/g, 'bg-[#202023] hover:bg-[#2A2A2E]');
s = s.replace(/bg-white border-t border-neutral-100/g, 'bg-[#161618] border-t border-[#333]');
s = s.replace(/text-neutral-900/g, 'text-neutral-200');

// the add node button
s = s.replace(/className="p-3 bg-white text-black/g, 'className="p-3 bg-[#EED3A8] text-black');
s = s.replace(/border-neutral-200\/50/g, 'border-[#444]/50');
s = s.replace(/text-neutral-800/g, 'text-neutral-200');
s = s.replace(/text-neutral-600/g, 'text-neutral-400');

fs.writeFileSync('src/components/CanvasDramaArea.tsx', s);
