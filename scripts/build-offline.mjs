import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sealPack, makeSlip } from '../src/lib/core.js';
import { starterPacks } from '../src/lib/content.js';
import { exportLessonHTML } from '../src/lib/export.js';

const out=new URL('../dist/client/',import.meta.url),pub=new URL('../public/',import.meta.url);
await mkdir(out,{recursive:true});
// The local viewport fixture is QA tooling, never a deployed application route.
await rm(new URL('__qa__.html',out),{force:true});
const p=await sealPack(starterPacks[0]),html=await exportLessonHTML(p);
const s=makeSlip(p,'EXAMPLE01',p.questions.map(q=>({questionId:q.id,optionId:q.options.find(o=>o.id!==q.correctId).id,confidence:'sure'})),true);
for(const dir of [out,pub]){
  await writeFile(new URL('offline-example.html',dir),html);
  await writeFile(new URL('example-lesson.json',dir),JSON.stringify(p,null,2));
  await writeFile(new URL('example-return.json',dir),JSON.stringify(s,null,2));
}
async function files(dir,prefix=''){
  const list=[];
  for(const e of await readdir(dir,{withFileTypes:true})){
    const path=prefix+e.name;
    if(e.isDirectory())list.push(...await files(new URL(e.name+'/',dir),path+'/'));
    else if(!path.startsWith('.')&&e.name!=='sw.js')list.push(path);
  }
  return list;
}
const all=await files(out),precache=all.filter(p=>!p.endsWith('.woff')&&(!p.endsWith('.woff2')||/-(latin|arabic)-/.test(p)));
const revision=createHash('sha256').update((await Promise.all(precache.map(p=>readFile(new URL(p,out))))).map(b=>createHash('sha256').update(b).digest('hex')).join()).digest('hex').slice(0,16);
const sw=`const CACHE='sabaqslip-${revision}';const FILES=${JSON.stringify(['/',...precache.map(p=>'/'+p)])};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sabaqslip-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('/index.html'))));return;}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});`;
await writeFile(new URL('sw.js',out),sw);
const bytes=(await Promise.all(precache.map(p=>readFile(new URL(p,out))))).reduce((n,b)=>n+b.length,0);
console.log(JSON.stringify({standaloneHTMLBytes:Buffer.byteLength(html),returnSlipBytes:Buffer.byteLength(JSON.stringify(s)),precacheFiles:precache.length,precacheBytes:bytes,revision}));
