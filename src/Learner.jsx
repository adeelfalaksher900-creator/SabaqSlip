import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, DownloadSimpleIcon, CheckCircleIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { textAt, makeSlip, scoreSlip, download, filename, humanError } from './lib/core.js';

export function Learner({pack,packs,language,c,onChoose,onBack,onImport,notify}) {
  const [step,setStep]=useState(-1),[code,setCode]=useState(''),[answers,setAnswers]=useState([]),[finished,setFinished]=useState(false),[error,setError]=useState('');
  const heading=useRef(null),first=useRef(true),receipt=useRef(null);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus();},[step,finished]);
  const reset=()=>{setStep(-1);setCode('');setAnswers([]);setFinished(false);setError('');receipt.current=null;};
  useEffect(()=>reset(),[pack.fingerprint]);
  const t=v=>textAt(v,language),q=pack.questions[step],answer=answers[step];
  function choose(key,value){setAnswers(a=>{const next=[...a];next[step]={questionId:q.id,...next[step],[key]:value};return next;});setError('');}
  function next(e){e.preventDefault();if(!answer?.optionId||!answer?.confidence){setError(c.choose);return;}setError('');if(step===pack.questions.length-1)setFinished(true);else setStep(x=>x+1);}
  function saveReturn(){try{if(!receipt.current)receipt.current=makeSlip(pack,code,answers);const slip=receipt.current;download(JSON.stringify(slip,null,2),filename(pack.title.en,'-'+slip.learnerCode+'-return.json'));notify(c.returnSaved);}catch(e){setError(humanError(e));}}
  const score=finished?scoreSlip(pack,{packId:pack.id,packFingerprint:pack.fingerprint,completedAt:new Date().toISOString(),answers}):null;
  return <main className="learner-page" id="main-content">
    <div className="page-toolbar"><button className="text-button" onClick={onBack}><ArrowLeftIcon/>{c.back}</button><span className="subtle">{c.previewNote}</span></div>
    {step===-1&&<div className="lesson-switch"><label htmlFor="choose-lesson">{c.open}</label><select id="choose-lesson" value={pack.fingerprint} onChange={e=>onChoose(e.target.value)}>{packs.map(p=><option key={p.fingerprint} value={p.fingerprint}>{t(p.title)}</option>)}</select><button className="text-button" onClick={onImport}>{c.importPack}</button></div>}
    <article className="learning-surface">
      <div className="lesson-meta">{pack.subject==='Mathematics'?c.math:pack.subject==='Other'?c.other:c.english}<span>·</span>{pack.minutes} {c.minutes}<span>·</span>{pack.questions.length} {c.questions}</div>
      <h1 tabIndex={-1} ref={heading}>{t(pack.title)}</h1><p className="lead">{t(pack.goal)}</p>
      {error&&<div className="inline-error" role="alert">{error}</div>}
      {step===-1?<>
        <section className="lesson-note"><h2>{c.lesson}</h2><p className="pre-line">{t(pack.lesson)}</p></section>
        <form className="start-form" onSubmit={e=>{e.preventDefault();if(!/^[A-Za-z0-9-]{2,16}$/.test(code.trim())){setError(c.codeHint);return;}setError('');setStep(0);}}>
          <label htmlFor="learner-code">{c.code}</label><input id="learner-code" autoComplete="off" value={code} maxLength={16} placeholder="B07" onChange={e=>setCode(e.target.value)} aria-describedby="code-hint" required/><p className="helper" id="code-hint">{c.codeHint}</p><button className="primary" type="submit">{c.start}<ArrowRightIcon/></button>
        </form><p className="helper">{c.noSavedAnswers}</p>
      </>:finished?<>
        <div className="completion"><CheckCircleIcon weight="duotone"/><div><h2>{c.results}</h2><p>{score.correct} / {score.total} {c.score}</p></div></div>
        {score.items.map(item=><section key={item.question.id} className="answer-feedback"><span className={'status-text '+(item.correct?'positive':'warm')}>{item.correct?c.correct:c.review}</span><h3>{t(item.question.prompt)}</h3><p>{t(item.question.explanation)}</p><p className="follow-up">{t(item.question.followUp)}</p></section>)}
        <div className="action-row"><button className="primary" onClick={saveReturn}><DownloadSimpleIcon/>{c.downloadSlip}</button><button className="secondary" onClick={reset}><ArrowCounterClockwiseIcon/>{c.newLearner}</button></div><p className="helper">{c.downloadHint}</p>
      </>:<form onSubmit={next} className="question-form">
        <div className="question-progress"><span>{c.question} {step+1} / {pack.questions.length}</span><progress value={step} max={pack.questions.length} aria-label={c.questions}/></div>
        <fieldset><legend>{t(q.prompt)}</legend><div className="answer-options">{q.options.map(o=><label key={o.id} className={'answer-choice '+(answer?.optionId===o.id?'selected':'')}><input type="radio" name="answer" value={o.id} checked={answer?.optionId===o.id} onChange={()=>choose('optionId',o.id)}/><span>{t(o.text)}</span></label>)}</div></fieldset>
        <fieldset className="confidence"><legend>{c.confidence}</legend>{['sure','unsure'].map(value=><label key={value} className={'confidence-choice '+(answer?.confidence===value?'selected':'')}><input type="radio" name="confidence" value={value} checked={answer?.confidence===value} onChange={()=>choose('confidence',value)}/>{c[value]}</label>)}</fieldset>
        <div className="action-row">{step>0&&<button type="button" className="secondary" onClick={()=>setStep(x=>x-1)}><ArrowLeftIcon/>{language==='ur'?'پچھلا سوال':'Previous question'}</button>}<button className="primary" type="submit">{step===pack.questions.length-1?c.finish:c.next}<ArrowRightIcon/></button></div>
      </form>}
    </article>
  </main>;
}
