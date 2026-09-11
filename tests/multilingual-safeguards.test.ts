import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index';
import { database,request } from './helpers';
import { activities,activity } from '../worker/learning-content';
import { grade } from '../worker/learning-validator';
const fixtures=[
 ['de-starter-01','exit-pair-please','Ich moechte Saft und Kaffee, bitte.'],
 ['es-starter-01','transfer-a','Yo necesito un mapa.'],
 ['fr-starter-01','transfer-chocolate',"Je n'aime pas le chocolat."],
 ['hi-checkin-001','transfer-ready','हम तैयार हैं।'],
 ['hi-checkin-001','transfer-question','kya aap theek hain'],
 ['kn-drink-choice-001','transfer-decline','ಕಾಫಿ ಬೇಡ.'],
 ['zh.drink-choice','transfer','ni bu he shui'],
 ['ja.table-identification','transfer','パンです。'],
 ['ja.order-at-table','transfer','お茶とコーヒーをください。'],
] as const;
test('natural variants, native scripts and meaningful short sentences satisfy their tasks',()=>{
 for(const [id,stepId,response] of fixtures){const step=activity(id)!.steps.find(s=>s.id===stepId)!;assert.equal(grade(step,response).correct,true,`${id}: ${response}`);}
 const step=activity('ja.table-identification')!.steps.find(s=>s.id==='transfer')!;
 assert.equal(grade(step,'パン').correct,false,'a recalled word alone is not relabelled as a sentence');
 assert.match(grade(step,'something else').message,/cannot reliably assess/i);
});
async function api(env:any,path:string,body?:unknown,user='a',method?:string){const r=await worker.fetch(request(path,user,body,method),env);return {status:r.status,data:await r.json() as any};}
async function toStep(env:any,id:string,stepId:string){let s=(await api(env,'/api/learning/start',{activityId:id})).data;for(let i=0;i<60&&s.step.id!==stepId;i++){if(['construct','context','understand'].includes(s.step.kind))s=(await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'reveal'})).data;s=(await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'advance'})).data;}assert.equal(s.step.id,stepId);return s;}
test('public checks need no account, database or AI and do not disclose future keys',async()=>{
 for(const a of activities){
  let r=await api({},'/api/public/learning',{activityId:a.id,stepIndex:0,kind:'step'},'');assert.equal(r.status,200);
  assert.equal('answer' in r.data.step,false);assert.equal('validation' in r.data.step,false);
  const i=a.steps.findIndex(s=>s.kind==='construct');
  r=await api({},'/api/public/learning',{activityId:a.id,stepIndex:i,kind:'attempt',answer:a.steps[i].answer},'');
  assert.equal(r.data.feedback.correct,true);assert.equal(r.data.feedback.independent,false);assert.equal(r.data.feedback.semanticKey,undefined);
 }
});
test('selected-language summaries do not pull another language’s saved draft or reviews',async()=>{
 const env:any={DB:database()};await api(env,'/api/learning/start',{activityId:'hi-checkin-001'});await api(env,'/api/learning/start',{activityId:'ja.table-identification'});
 const r=await api(env,'/api/learning/summary?language=hi');assert.equal(r.data.activities.length,3);assert.equal(r.data.resume.id,'hi-checkin-001');assert.ok(r.data.skills.every((s:any)=>s.languageCode==='hi'));
});
test('a spontaneous off-task message consumes that later combination',async()=>{
 const env:any={DB:database()};let s=await toStep(env,'es-starter-01','guided-map');
 s=(await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:'Necesito un mapa.'})).data;
 assert.equal(s.feedback.category,'meaning');
 s=await toStep(env,'es-starter-01','transfer-a');
 s=(await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:'Necesito un mapa.'})).data;
 assert.equal(s.feedback.independent,false);
});
test('opening a review retains completed prerequisites and an unavailable old version cannot break Today',async()=>{
 const env:any={DB:database()};let s=(await api(env,'/api/learning/start',{activityId:'es-starter-01'})).data;
 const row=await env.DB.prepare('SELECT state FROM learning_sessions WHERE id=?').bind(s.id).first();
 const state={...JSON.parse(row.state),completed:true,lastCompletedAt:new Date().toISOString(),stepIndex:activity('es-starter-01')!.steps.length-1};
 await env.DB.prepare('UPDATE learning_sessions SET state=? WHERE id=?').bind(JSON.stringify(state),s.id).run();
 await api(env,'/api/learning/start',{activityId:'es-starter-01',mode:'review'});
 const next=(await api(env,'/api/learning/start',{activityId:'es-starter-02'})).data;assert.equal(next.prerequisiteWarnings.length,0);
 await env.DB.prepare('UPDATE learning_sessions SET content_version=? WHERE id=?').bind('missing-archived-version',s.id).run();
 assert.equal((await api(env,'/api/learning/summary?language=es')).status,200);
 assert.equal((await api(env,`/api/learning/sessions/${s.id}`)).status,409);
});
test('support before a starter exists is recorded and cannot become an independent claim',async()=>{
 const env:any={DB:database()};await api(env,'/api/learning/support',{languageCode:'es',source:'tutor'});
 let s=await toStep(env,'es-starter-01','transfer-a');s=(await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:'Necesito un mapa.'})).data;assert.equal(s.feedback.independent,false);
});
test('atomic self-practice finish retries once and moves the owned draft with legacy completion',async()=>{
 const env:any={DB:database()},requestId=crypto.randomUUID(),data={requestId,version:-1,data:{step:3,answer:'J’aime le thé.',confidence:'soon'},timeSpent:80};
 let r=await api(env,'/api/learning/finish/fr-lesson02',data);assert.equal(r.status,200);
 r=await api(env,'/api/learning/finish/fr-lesson02',data);assert.equal(r.status,200);
 const draft=await api(env,'/api/learning/drafts/fr-lesson02');assert.equal(draft.data.data.step,3);
 const progress=await api(env,'/api/progress/lesson/fr-lesson02');assert.equal(progress.data.completed,true);assert.equal(progress.data.score,null);
 assert.equal((await api(env,'/api/progress/lesson/fr-lesson02',undefined,'b')).status,404);
});
test('retrying a tutor request does not call or bill the provider twice',async()=>{
 const env:any={DB:database(),OPENAI_API_KEY:'test-only'},original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({choices:[{message:{content:'Try the next taught message.'}}],usage:{prompt_tokens:10,completion_tokens:10}}),{headers:{'content-type':'application/json'}});};
 try{const d={requestId:crypto.randomUUID(),lessonId:'es-lesson01',conversation:[{role:'user',content:'Help with this lesson.'}]};assert.equal((await api(env,'/api/chat',d)).status,200);assert.equal((await api(env,'/api/chat',d)).status,200);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
test('a retried draft save returns the current draft instead of a stale conflict',async()=>{
 const env:any={DB:database()},d={requestId:crypto.randomUUID(),version:-1,data:{step:1,answer:'ನನಗೆ ನೀರು ಬೇಕು.'}};
 const first=await api(env,'/api/learning/drafts/kn-lesson02',d,'a','PUT');assert.equal(first.status,200);
 const second=await api(env,'/api/learning/drafts/kn-lesson02',d,'a','PUT');assert.equal(second.status,200);assert.equal(second.data.version,first.data.version);
});
test('the global optional-service limit stops provider calls without closing lessons',async()=>{
 const env:any={DB:database(),OPENAI_API_KEY:'test-only',OPTIONAL_AI_DAILY_GLOBAL_LIMIT:'1'},original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({choices:[{message:{content:'Try a taught example.'}}]}),{headers:{'content-type':'application/json'}});};
 try{const d={lessonId:'fr-lesson01',conversation:[{role:'user',content:'Help'}]};assert.equal((await api(env,'/api/chat',d,'a')).status,200);assert.equal((await api(env,'/api/chat',d,'b')).status,429);assert.equal(calls,1);assert.equal((await api(env,'/api/learning/start',{activityId:'kn-drink-choice-001'},'b')).status,200);}finally{globalThis.fetch=original;}
});
