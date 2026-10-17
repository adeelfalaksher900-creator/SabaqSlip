import { parsePack, importSlip, MAX_FILE_BYTES } from './core.js';
export const STORAGE_KEY='sabaqslip-workspace-v1';
export async function readWorkspace(fallback) {
  const raw=localStorage.getItem(STORAGE_KEY);
  if(!raw)return {packs:fallback,slips:[]};
  const data=JSON.parse(raw);
  if(!data || data.version!==1 || !Array.isArray(data.packs) || !Array.isArray(data.slips) || data.packs.length>100 || data.slips.length>300)throw Error('Saved workspace could not be read. Your existing data has not been overwritten.');
  const packs=await Promise.all(data.packs.map(p=>parsePack(JSON.stringify(p))));
  let slips=[];
  for(const slip of data.slips)slips=importSlip(JSON.stringify(slip),packs,slips).slips;
  return {packs,slips};
}
export function saveWorkspace(packs,slips) {
  const text=JSON.stringify({version:1,packs,slips});
  if(new TextEncoder().encode(text).length>MAX_FILE_BYTES-100)throw Error('This workspace is full. Export a backup, then remove older data before adding more.');
  localStorage.setItem(STORAGE_KEY,text);
}
