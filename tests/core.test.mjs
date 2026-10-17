import test from 'node:test';
import assert from 'node:assert/strict';
import { sealPack, parsePack, makeSlip, importSlip, scoreSlip, reteachPlan, canonical, sha256, MAX_FILE_BYTES } from '../src/lib/core.js';
import { starterPacks } from '../src/lib/content.js';
import { exportLessonHTML } from '../src/lib/export.js';

const pack = () => sealPack(structuredClone(starterPacks[0]));
const answers = (p, correct = false) => p.questions.map(q => ({questionId:q.id, optionId:correct?q.correctId:q.options.find(o=>o.id!==q.correctId).id, confidence:'sure'}));

test('fingerprints and return IDs also work on an HTTP preview without SubtleCrypto', async () => {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto'),real=globalThis.crypto;
  Object.defineProperty(globalThis,'crypto',{value:{getRandomValues:real.getRandomValues.bind(real)},configurable:true});
  try { assert.equal(await sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); const p=await pack();assert.match(makeSlip(p,'B07',answers(p)).id,/^[a-f0-9-]{36}$/); }
  finally { Object.defineProperty(globalThis,'crypto',descriptor); }
});

test('a pack survives a JSON round trip with a stable content fingerprint', async () => {
  const p=await pack();
  assert.equal((await parsePack(JSON.stringify(p))).fingerprint,p.fingerprint);
  assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2}));
});
test('changed lesson content is rejected instead of silently using an old answer key', async () => {
  const p=await pack(); p.questions[0].correctId='d';
  await assert.rejects(()=>parsePack(JSON.stringify(p)),/changed|fingerprint/i);
});
test('duplicate question IDs and missing answer keys are rejected', async () => {
  const p=structuredClone(starterPacks[0]); p.questions[1].id=p.questions[0].id;
  await assert.rejects(()=>sealPack(p),/unique/i);
  p.questions[1].id='q2'; p.questions[0].correctId='unknown';
  await assert.rejects(()=>sealPack(p),/answer|option/i);
});
test('scores and reteaching signals come from the tutor answer key', async () => {
  const p=await pack(), s=makeSlip(p,'B07',answers(p));
  const result=scoreSlip(p,s);
  assert.equal(result.correct,0); assert.equal(result.total,3);
  assert.ok(result.items.every(q=>q.priority==='explain'));
});
test('a return slip cannot supply its own score or unknown answer choices', async () => {
  const p=await pack(), s=makeSlip(p,'B07',answers(p));
  assert.throws(()=>importSlip(JSON.stringify({...s,score:100}),[p],[]),/field|format|score/i);
  s.answers[0].optionId='invented';
  assert.throws(()=>importSlip(JSON.stringify(s),[p],[]),/option|choice/i);
});
test('return import is idempotent and rejects a reused attempt ID with changed answers', async () => {
  const p=await pack(), s=makeSlip(p,'B07',answers(p));
  const first=importSlip(JSON.stringify(s),[p],[]);
  assert.equal(first.slips.length,1);
  assert.equal(importSlip(JSON.stringify(s),[p],first.slips).duplicate,true);
  s.answers[0].confidence='unsure';
  assert.throws(()=>importSlip(JSON.stringify(s),[p],first.slips),/attempt|different/i);
});
test('a foreign pack, future date, incomplete answers and oversized files are rejected', async () => {
  const p=await pack(), s=makeSlip(p,'B07',answers(p));
  assert.throws(()=>importSlip(JSON.stringify(s),[],[]),/lesson|pack/i);
  assert.throws(()=>importSlip(JSON.stringify({...s,completedAt:'2099-01-01T00:00:00.000Z'}),[p],[]),/time|future/i);
  assert.throws(()=>importSlip(JSON.stringify({...s,answers:s.answers.slice(1)}),[p],[]),/answer|complete/i);
  assert.throws(()=>importSlip(' '.repeat(MAX_FILE_BYTES+1),[p],[]),/large|size/i);
});
test('latest attempt per learner is used so retries do not inflate the next-session plan', async () => {
  const p=await pack(), old=makeSlip(p,'B07',answers(p)); old.completedAt='2026-10-16T09:00:00.000Z';
  const recent=makeSlip(p,'B07',answers(p,true));
  const plan=reteachPlan([p],[old,recent]);
  assert.equal(plan.learnerCount,1); assert.equal(plan.groups.filter(g=>g.priority==='explain').length,0);
});
test('low-confidence correct responses produce practice rather than a misconception label', async () => {
  const p=await pack(), a=answers(p,true).map(x=>({...x,confidence:'unsure'})), s=makeSlip(p,'B07',a);
  assert.ok(scoreSlip(p,s).items.every(q=>q.priority==='practice'));
});
test('standalone lesson safely embeds hostile text and blocks external connections', async () => {
  const p=structuredClone(starterPacks[0]); p.title.en='Lesson </script><script>alert(1)</script>';
  const html=await exportLessonHTML(await sealPack(p));
  assert.ok(html.includes("connect-src 'none'"));
  assert.ok(!html.includes('</script><script>alert(1)</script>'));
  assert.ok(!/\ssrc=["']https?:/i.test(html));
  assert.ok(html.includes('application/json'));
});
