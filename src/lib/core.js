import { z } from 'zod';
import { sha256 as digest } from '@noble/hashes/sha2.js';

export const MAX_FILE_BYTES = 256 * 1024;
const id = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
const bilingual = z.object({en:z.string().trim().min(1).max(5000),ur:z.string().max(5000)}).strict();
const option = z.object({id,text:bilingual,signal:id}).strict();
const question = z.object({id,skill:id,skillLabel:bilingual,prompt:bilingual,options:z.array(option).min(2).max(4),correctId:id,explanation:bilingual,teach:bilingual,followUp:bilingual}).strict();
const baseSchema = z.object({kind:z.literal('sabaqslip.lesson'),schemaVersion:z.literal(1),id,title:bilingual,goal:bilingual,lesson:bilingual,subject:z.enum(['Mathematics','English','Other']),minutes:z.number().int().min(1).max(60),createdAt:z.iso.datetime(),questions:z.array(question).min(1).max(8)}).strict();
const packSchema = baseSchema.extend({fingerprint:z.string().regex(/^[a-f0-9]{64}$/)});
const answerSchema = z.object({questionId:id,optionId:id,confidence:z.enum(['sure','unsure'])}).strict();
const codeSchema = z.string().trim().toUpperCase().min(2).max(16).regex(/^[A-Z0-9-]+$/,'Use a short code, such as B07, without a name.');
const slipSchema = z.object({kind:z.literal('sabaqslip.return'),schemaVersion:z.literal(1),id,packId:id,packFingerprint:z.string().regex(/^[a-f0-9]{64}$/),learnerCode:codeSchema,completedAt:z.iso.datetime(),answers:z.array(answerSchema).min(1).max(8),example:z.boolean()}).strict();

export function canonical(value) {
  if(Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if(value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
export async function sha256(text) {
  return [...digest(new TextEncoder().encode(text))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export function newId(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  return [...bytes].map((n,i)=>([4,6,8,10].includes(i)?'-':'')+n.toString(16).padStart(2,'0')).join('');
}
function validateBase(value) {
  const p=baseSchema.parse(value);
  if(new Set(p.questions.map(q=>q.id)).size!==p.questions.length) throw Error('Question IDs must be unique.');
  for(const q of p.questions) {
    if(new Set(q.options.map(o=>o.id)).size!==q.options.length) throw Error('Answer option IDs must be unique.');
    if(!q.options.some(o=>o.id===q.correctId)) throw Error('Every question needs an answer key matching an option.');
  }
  return p;
}
export async function sealPack(value) {
  const {fingerprint,...rest}=value;
  const p=validateBase(rest);
  return {...p,fingerprint:await sha256(canonical(p))};
}
export function parseJSON(text) {
  if(typeof text!=='string' || new TextEncoder().encode(text).byteLength>MAX_FILE_BYTES) throw Error('This file is too large. Use a SabaqSlip file under 256 KB.');
  try { return JSON.parse(text); } catch { throw Error('This is not a valid JSON file. Choose a lesson pack or return slip exported by SabaqSlip.'); }
}
export async function parsePack(text) {
  const p=packSchema.parse(parseJSON(text));
  const sealed=await sealPack(p);
  if(sealed.fingerprint!==p.fingerprint) throw Error('Lesson content changed after export. Its fingerprint does not match.');
  return sealed;
}
function validateAnswers(pack,slip) {
  if(slip.packId!==pack.id || slip.packFingerprint!==pack.fingerprint) throw Error('This slip belongs to a different lesson version. Import the matching lesson pack first.');
  if(slip.answers.length!==pack.questions.length || new Set(slip.answers.map(a=>a.questionId)).size!==pack.questions.length) throw Error('The slip needs one complete answer for every question.');
  for(const q of pack.questions) {
    const a=slip.answers.find(a=>a.questionId===q.id);
    if(!a || !q.options.some(o=>o.id===a.optionId)) throw Error('An answer uses an unknown question or option choice.');
  }
  const time=Date.parse(slip.completedAt);
  if(time>Date.now()+5*60*1000 || time<Date.UTC(2020,0,1)) throw Error('The completion time is invalid or in the future. Check the learner device clock.');
}
export function makeSlip(pack,learnerCode,answers,example=false) {
  const slip=slipSchema.parse({kind:'sabaqslip.return',schemaVersion:1,id:newId(),packId:pack.id,packFingerprint:pack.fingerprint,learnerCode,completedAt:new Date().toISOString(),answers,example});
  validateAnswers(pack,slip);
  return slip;
}
export function importSlip(text,packs,slips) {
  let s;
  try { s=slipSchema.parse(parseJSON(text)); } catch(e) { if(e instanceof z.ZodError) throw Error('The return slip has an unexpected field or format. Import an unedited SabaqSlip return file.'); throw e; }
  const p=packs.find(p=>p.id===s.packId && p.fingerprint===s.packFingerprint);
  if(!p) throw Error('Matching lesson pack not found. Import that exact lesson version before its return slip.');
  validateAnswers(p,s);
  const old=slips.find(x=>x.id===s.id);
  if(old) {
    if(canonical(old)!==canonical(s)) throw Error('This attempt ID already exists with different answers. Nothing was replaced.');
    return {slips,duplicate:true,slip:old};
  }
  if(slips.length>=300) throw Error('This device has 300 return slips. Export a backup before removing older data.');
  return {slips:[...slips,s],duplicate:false,slip:s};
}
export function scoreSlip(pack,slip) {
  validateAnswers(pack,slip);
  const items=pack.questions.map(q=>{
    const a=slip.answers.find(x=>x.questionId===q.id), choice=q.options.find(o=>o.id===a.optionId), correct=a.optionId===q.correctId;
    return {question:q,answer:a,choice,correct,priority:correct?(a.confidence==='sure'?'ready':'practice'):'explain',signal:correct?q.skill:choice.signal};
  });
  return {correct:items.filter(i=>i.correct).length,total:items.length,items};
}
export function latestSlips(slips) {
  const map=new Map();
  for(const s of slips) {
    const key=s.packId+':'+s.packFingerprint+':'+s.learnerCode+':'+s.example;
    const old=map.get(key);
    if(!old || Date.parse(s.completedAt)>=Date.parse(old.completedAt)) map.set(key,s);
  }
  return [...map.values()];
}
export function reteachPlan(packs,slips) {
  const latest=latestSlips(slips), groups=new Map();
  for(const s of latest) {
    const p=packs.find(p=>p.id===s.packId && p.fingerprint===s.packFingerprint);
    if(!p) continue;
    for(const item of scoreSlip(p,s).items) {
      const key=[p.fingerprint,item.priority,item.signal,s.example].join(':');
      const group=groups.get(key)??{key,packId:p.id,packTitle:p.title,priority:item.priority,signal:item.signal,label:item.question.skillLabel,teach:item.question.teach,followUp:item.question.followUp,learners:[],confidentWrong:0,example:s.example};
      if(!group.learners.includes(s.learnerCode)) group.learners.push(s.learnerCode);
      if(!item.correct && item.answer.confidence==='sure') group.confidentWrong++;
      groups.set(key,group);
    }
  }
  return {learnerCount:new Set(latest.map(s=>s.learnerCode+':'+s.example)).size,groups:[...groups.values()].sort((a,b)=>({explain:0,practice:1,ready:2}[a.priority]-{explain:0,practice:1,ready:2}[b.priority])||b.confidentWrong-a.confidentWrong)};
}
export function humanError(error) {
  if(error instanceof z.ZodError) { const e=error.issues[0]; return 'Check '+(e.path.join(' → ')||'the file')+': '+e.message; }
  return error?.message??'Something went wrong. Your existing work has not been replaced.';
}
export function textAt(value,language='en') { return language==='ur' && value?.ur?value.ur:value?.en??''; }
export function filename(title,suffix) { return (title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'sabaqslip')+suffix; }
export function download(text,name,type='application/json') {
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
