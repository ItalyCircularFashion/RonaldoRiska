import { execFileSync } from 'node:child_process';
import { cpSync, copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(app, '../..');
const dist = join(app, 'dist');
const stage = join(app, '.pages-out');
const rootExt = new Set(['.html','.css','.js','.json','.txt','.xml','.avif','.webp','.jpg','.png','.svg']);
const nestedExt = new Set(['.html','.css','.js','.avif','.webp','.jpg','.png','.svg','.woff2','.mp4']);
const builtExt = new Set(['.html','.css','.js','.glb','.png','.svg','.webp','.woff2']);

// Only these currently public subtrees are published; no arbitrary recursive repo upload.
function approvedTracked(p) {
  if (!p.includes('/')) return p === '.nojekyll' || p === 'Ronaldo-Riska-CV-2026.pdf' || rootExt.has(extname(p));
  const parent = p.split('/')[0];
  return ['assets','cyberdeck-os','tessile-dashboard'].includes(parent) && nestedExt.has(extname(p));
}
function safeCopy(from,to) {
  if (lstatSync(from).isSymbolicLink()) throw new Error(`Symbolic link non pubblicabile: ${from}`);
  mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);
}
function copyBuild(dir) {
  for (const entry of readdirSync(dir,{withFileTypes:true})) {
    const from=join(dir,entry.name),suffix=relative(dist,from);
    if (entry.isSymbolicLink()) throw new Error(`Symlink nella build: ${suffix}`);
    if (entry.isDirectory()) {copyBuild(from);continue;}
    if (!entry.isFile() || !builtExt.has(extname(entry.name))) throw new Error(`File non approvato nella build: ${suffix}`);
    safeCopy(from,join(stage,'prato-textile-world',suffix));
  }
}
if (!existsSync(join(dist,'index.html')) || !existsSync(join(dist,'models','loom.glb'))) throw new Error('La build deve includere index.html e il telaio GLB');
if (resolve(stage) !== resolve(app,'.pages-out') || !stage.startsWith(app+sep)) throw new Error('Destinazione inattesa');
rmSync(stage,{recursive:true,force:true});mkdirSync(stage,{recursive:true});
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root}).toString('utf8').split('\0').filter(Boolean);
let count=0;
for (const p of tracked) {
  if (!approvedTracked(p)) continue;
  if (p.includes('..') || p.startsWith('/')) throw new Error('Percorso non valido in Git');
  safeCopy(join(root,p),join(stage,p));count++;
}
copyBuild(dist);
const forbidden=['lca_data.db','lca_api.py','docs/TEXTILE_PROCESS_KNOWLEDGE_BASE.md','index.html.bak.20260918-174244'];
for (const p of forbidden) if (existsSync(join(stage,p))) throw new Error(`Pubblicazione vietata: ${p}`);
for (const p of ['index.html','404.html','prato-textile-world/index.html','prato-textile-world/models/loom.glb']) if(!existsSync(join(stage,p))) throw new Error(`Risorsa essenziale mancante: ${p}`);
console.log(`Artifact allowlist pronto: ${stage} · file tracciati pubblici=${count} · nessun DB, sorgente privato, backup o documentazione.`);
