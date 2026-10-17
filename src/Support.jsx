import { useEffect, useRef } from 'react';
import { XIcon, ArrowLeftIcon, ArrowRightIcon, DownloadSimpleIcon, UploadSimpleIcon } from '@phosphor-icons/react';
export function Modal({title,onClose,children,wide=false}) {
  const ref=useRef(null);
  useEffect(()=>{const d=ref.current;d.showModal();return()=>d.close();},[]);
  return <dialog ref={ref} className={wide?'wide-dialog':''} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="dialog-inner"><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><XIcon/></button></div>{children}</div></dialog>;
}
export function Evidence({language,c,onBack,backup,onImport,onClear}) {
  const sources=[
    ['UNICEF Pakistan · Education','https://www.unicef.org/pakistan/education','National context for education access. This is not a study of one neighborhood.','پاکستان میں تعلیم تک رسائی کی قومی صورتِ حال۔ یہ کسی ایک محلے کی تحقیق نہیں۔'],
    ['UNICEF Innocenti · Digital learning','https://www.unicef.org/innocenti/top-10-reasons-digital-learning-succeeds-or-fails','Design for a clear learning need, teacher involvement and offline access.','واضح مقصد، استاد کی شمولیت اور آف لائن سہولت کو اہمیت دیں۔'],
    ['Education Endowment Foundation · Feedback','https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback','Give actionable next steps. Feedback research is not a measured outcome of this app.','قابلِ عمل اگلا قدم دیں۔ تحقیق کا اوسط اس ایپ کا نتیجہ نہیں۔'],
    ['Kolibri · Learning Equality','https://learningequality.org/kolibri/','An established offline learning platform with educator and learner progress tools.','موجودہ آف لائن تعلیمی پلیٹ فارم، جس میں سرگرمی اور پیش رفت دیکھی جا سکتی ہے۔'],
    ['Lumi · H5P tools','https://lumi.education/en/','Existing authoring tools include HTML export. Offline export alone is not our novelty claim.','موجودہ آلات میں HTML ایکسپورٹ شامل ہے۔ صرف آف لائن فائل نیا تصور نہیں۔']
  ];
  return <main className="evidence-page" id="main-content"><button className="text-button" onClick={onBack}><ArrowLeftIcon/>{c.back}</button><h1>{c.researchTitle}</h1><p className="lead">{c.researchIntro}</p><section><h2>{c.sources}</h2><div className="source-list">{sources.map(([name,url,en,ur])=><article key={url}><a href={url} target="_blank" rel="noreferrer">{name}<ArrowRightIcon/></a><p>{language==='ur'?ur:en}</p></article>)}</div></section><section><h2>{c.limits}</h2><ul className="plain-list">{['limit1','limit2','limit3','limit4'].map(k=><li key={k}>{c[k]}</li>)}</ul></section><section><h2>{c.privacyTitle}</h2><p>{c.dataPrivacy}</p><p>{c.privacyHosting}</p><div className="action-row"><button className="secondary" onClick={backup}><DownloadSimpleIcon/>{c.backup}</button><button className="secondary" onClick={onImport}><UploadSimpleIcon/>{c.restore}</button><button className="text-button danger-text" onClick={onClear}>{c.clear}</button></div></section></main>;
}
