import fs from 'fs';
import path from 'path';

function replaceInDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content
        .replace(/text-white/g, 'text-slate-800')
        .replace(/text-\[#00e5ff\]/g, 'text-indigo-700')
        .replace(/text-\[#b300ff\]/g, 'text-emerald-700')
        .replace(/bg-\[#0b0f19\]\/[0-9]+/g, 'bg-white/60')
        .replace(/bg-\[#0b0f19\]/g, 'bg-white/60')
        .replace(/border-\[#00e5ff\]\/[0-9]+/g, 'border-white/50')
        .replace(/border-\[#b300ff\]\/[0-9]+/g, 'border-white/50')
        .replace(/bg-\[#00e5ff\]\/5/g, 'bg-white/40')
        .replace(/bg-\[#00e5ff\]\/10/g, 'bg-indigo-100/50')
        .replace(/bg-\[#00e5ff\]\/20/g, 'bg-indigo-100/80')
        .replace(/bg-\[#b300ff\]\/10/g, 'bg-emerald-100/50')
        .replace(/bg-\[#b300ff\]\/20/g, 'bg-emerald-100/80')
        .replace(/divide-\[#00e5ff\]\/[0-9]+/g, 'divide-white/40')
        .replace(/text-slate-300/g, 'text-slate-600')
        .replace(/text-[#1a607a]/g, 'text-slate-700')
        .replace(/bg-[#1a607a]/g, 'bg-indigo-600')
        .replace(/bg-[#2596be]/g, 'bg-indigo-500');
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Done replacing colors.');
