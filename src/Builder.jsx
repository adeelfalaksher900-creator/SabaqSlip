import { useState } from 'react';
import { PlusIcon, ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react';
import { starterPacks } from './lib/content.js';
import { sealPack, humanError, newId } from './lib/core.js';
const bi=en=>({en,ur:''});
const slug=s=>s.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'review-concept';
function emptyQuestion(){return {id:'q-'+newId().slice(0,8),skill:'new-concept',skillLabel:bi('New concept'),prompt:bi(''),options:['a','b','c'].map(id=>({id,text:bi(''),signal:'review-concept'})),correctId:'a',explanation:bi(''),teach:bi(''),followUp:bi('')};}
export function Builder({initial,c,language,onSave,onBack}) {
  const [draft,setDraft]=useState(()=>({...structuredClone(initial),id:newId(),createdAt:new Date().toISOString()})),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  const set=(key,value)=>setDraft(d=>({...d,[key]:value}));
  function updateQ(index,key,value){setDraft(d=>({...d,questions:d.questions.map((q,i)=>i===index?{...q,[key]:value}:q)}));}
  function bilingual(label,value,onChange,max=5000){return <div className="bilingual-field"><label>{label}<textarea value={value.en} onChange={e=>onChange({...value,en:e.target.value})} maxLength={max} required rows={value.en.length>200?5:2} dir="ltr"/></label><details><summary>{c.translation}</summary><label>{c.urdu}<textarea value={value.ur} onChange={e=>onChange({...value,ur:e.target.value})} maxLength={max} rows={3} dir="rtl" lang="ur"/></label></details></div>;}
  async function save(e){e.preventDefault();setSaving(true);setError('');try{const p=await sealPack({...draft,questions:draft.questions.map(q=>({...q,skill:slug(q.skillLabel.en),options:q.options.map(o=>({...o,signal:slug(o.signal)}))}))});if(onSave(p)!==false)onBack();}catch(e){setError(humanError(e));}finally{setSaving(false);}}
  return <main className="builder-page" id="main-content"><button className="text-button" onClick={onBack}><ArrowLeftIcon/>{c.back}</button><div className="section-heading"><div><h1>{c.builder}</h1><p>{c.reviewTranslation}</p></div></div>
    <form onSubmit={save} onInvalidCapture={e=>{let parent=e.target.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}}}>
      <div className="builder-meta"><label>{c.newTemplate}<select defaultValue="current" onChange={e=>{if(e.target.value==='current')return;const p=e.target.value==='blank'?{...structuredClone(starterPacks[0]),title:bi(''),goal:bi(''),lesson:bi(''),questions:[emptyQuestion()]}:structuredClone(starterPacks[Number(e.target.value)]);setDraft({...p,id:newId(),createdAt:new Date().toISOString()});}}><option value="current">{c.custom}</option><option value="blank">{c.blank}</option>{starterPacks.map((p,i)=><option key={p.id} value={i}>{language==='ur'?p.title.ur:p.title.en}</option>)}</select></label><label>{c.subject}<select value={draft.subject} onChange={e=>set('subject',e.target.value)}><option value="Mathematics">{c.math}</option><option value="English">{c.english}</option><option value="Other">{c.other}</option></select></label><label>{c.duration}<input type="number" min="1" max="60" value={draft.minutes} required onChange={e=>set('minutes',Number(e.target.value))}/></label></div>
      {bilingual(c.title,draft.title,v=>set('title',v),120)}
      {bilingual(c.goal,draft.goal,v=>set('goal',v),300)}
      {bilingual(c.instructions,draft.lesson,v=>set('lesson',v))}
      <div className="section-heading compact-heading"><h2>{c.questions}</h2><span>{draft.questions.length} / 8</span></div>
      {draft.questions.map((q,index)=><details className="question-editor" key={q.id} open={draft.questions.length===1||undefined}><summary><span>{String(index+1).padStart(2,'0')}</span>{q.prompt.en||c.question}</summary><div className="question-editor-body">
        {bilingual(c.question,q.prompt,v=>updateQ(index,'prompt',v),800)}
        {bilingual(c.concept,q.skillLabel,v=>updateQ(index,'skillLabel',v),150)}
        <fieldset className="option-editor"><legend>{c.answer}</legend>{q.options.map((o,oi)=><div className="option-edit-row" key={o.id}><label className="correct-radio"><input type="radio" name={'key-'+q.id} checked={q.correctId===o.id} onChange={()=>updateQ(index,'correctId',o.id)}/>{c.correctAnswer} {String.fromCharCode(65+oi)}</label>{bilingual(c.answer+' '+String.fromCharCode(65+oi),o.text,v=>updateQ(index,'options',q.options.map(a=>a.id===o.id?{...a,text:v}:a)),300)}{q.correctId!==o.id&&<label>{c.optionSignal}<input value={o.signal.replace(/-/g,' ')} maxLength={60} onChange={e=>updateQ(index,'options',q.options.map(a=>a.id===o.id?{...a,signal:e.target.value}:a))}/></label>}</div>)}</fieldset>
        {bilingual(c.explanation,q.explanation,v=>updateQ(index,'explanation',v),1500)}
        {bilingual(c.nextTeaching,q.teach,v=>updateQ(index,'teach',v),1000)}
        {bilingual(c.followUp,q.followUp,v=>updateQ(index,'followUp',v),500)}
        {draft.questions.length>1&&<button type="button" className="text-button danger-text" onClick={()=>set('questions',draft.questions.filter((_,i)=>i!==index))}>{c.remove}</button>}
      </div></details>)}
      {draft.questions.length<8&&<button type="button" className="secondary" onClick={()=>set('questions',[...draft.questions,emptyQuestion()])}><PlusIcon/>{c.addQuestion}</button>}
      {error&&<div className="inline-error" role="alert">{error}</div>}
      <div className="builder-actions"><button type="button" className="secondary" onClick={onBack}>{c.cancel}</button><button className="primary" type="submit" disabled={saving}><CheckIcon/>{saving?c.loading:c.save}</button></div>
    </form>
  </main>;
}
