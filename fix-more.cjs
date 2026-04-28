const fs = require('fs');
let s = fs.readFileSync('src/components/CanvasDramaArea.tsx', 'utf8');

s = s.replace(/bg-white border-t border-\[\#333\]/g, 'bg-[#161618] border-t border-[#333]');
s = s.replace(/bg-neutral-100 border border-neutral-200/g, 'bg-[#252528] border border-[#444]');
s = s.replace(/bg-neutral-50 border-t border-\[\#333\]/g, 'bg-[#202023] border-t border-[#333]');
s = s.replace(/text-neutral-400 bg-white border border-neutral-200 hover:bg-neutral-50/g, 'text-neutral-300 bg-[#252528] border border-[#444] hover:bg-[#303034]');

fs.writeFileSync('src/components/CanvasDramaArea.tsx', s);
