import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index';
import { database, request } from './helpers';
import { archivedActivities as activities, activity } from '../worker/learning-content';
import { normalizeGerman } from '../worker/learning-validator';

async function api(env:any, path:string, data?:unknown, user='learner', method?:string) {
  const response=await worker.fetch(request(path,user,data,method),env);
  return {status:response.status,body:await response.json() as any};
}
async function start(env:any, activityId='de-starter-01') {
  const result=await api(env,'/api/learning/start',{activityId,contentVersion:'1.0.0'});
  assert.equal(result.status,200);
  return result.body;
}
async function act(env:any,s:any,kind:string,extra:Record<string,unknown>={}) {
  return api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind,...extra});
}
async function firstTask(env:any) {
  let s=await start(env);
  while(s.step.id!=='water') {
    if(s.step.kind==='understand') s=(await act(env,s,'attempt',{answer:'Requesting tea'})).body;
    const next=await act(env,s,'advance'); assert.equal(next.status,200); s=next.body;
  }
  return s;
}

test('starter exposes only the current teaching step and no assessment answer keys',async()=>{
  const env:any={DB:database()};
  const s=await start(env);
  assert.equal(s.step.id,'prior');
  assert.equal(JSON.stringify(s).includes('Ich möchte Wasser.'),false);
  assert.equal('acceptedAnswers' in s,false);
  assert.equal(s.reviewStatus,'awaiting-human-review');
  assert.equal((await worker.fetch(request('/api/learning/summary'),env)).status,401);
});

test('new taught combination is graded, punctuation and moechte accepted, order errors explained',async()=>{
  const env:any={DB:database()}; let s=await firstTask(env);
  let r=await act(env,s,'attempt',{answer:'Ich Wasser möchte'});
  assert.equal(r.status,200); assert.equal(r.body.feedback.category,'word-order');
  assert.equal(r.body.feedback.independent,false); s=r.body;
  r=await act(env,s,'attempt',{answer:'ich moechte Wasser!'});
  assert.equal(r.body.feedback.correct,true); assert.equal(r.body.feedback.independent,false);
  assert.match(r.body.feedback.message,/help|cue|support/i);
  s=(await act(env,r.body,'advance')).body;
  while(s.step.kind!=='construct') s=(await act(env,s,'advance')).body;
  r=await act(env,s,'attempt',{answer:'Ich möchte Kaffee.'});
  assert.equal(r.body.feedback.correct,true); assert.equal(r.body.feedback.independent,true);
});

test('reveal and copied answer never count as independent and missing prerequisites warn without locking',async()=>{
  const env:any={DB:database()}; const s=await firstTask(env);
  const hint=await act(env,s,'reveal'); assert.equal(hint.body.help.text,'Ich möchte Wasser.');
  const result=await act(env,hint.body,'attempt',{answer:'Ich möchte Wasser.'});
  assert.equal(result.body.feedback.correct,true); assert.equal(result.body.feedback.independent,false);
  const followup=await start(env,'de-starter-03');
  assert.ok(followup.prerequisiteWarnings.length>0);
});

test('meaning, vowel distinctions and valid alternatives do not become invented target success',async()=>{
  for(const [answer,category] of [['Ich möchte Tee.','meaning'],['Ich mochte Wasser.','verb-form'],['Wasser, bitte.','alternative'],['nonsense','unrecognized']]) {
    const env:any={DB:database()}; const s=await firstTask(env);
    const r=await act(env,s,'attempt',{answer});
    assert.equal(r.body.feedback.category,category,answer); assert.equal(r.body.feedback.correct,false);
  }
});

test('saves are idempotent, survive another device and reject stale drafts without erasing attempts',async()=>{
  const env:any={DB:database()}; const s=await firstTask(env);
  const data={eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:'Ich möchte Wasser.'};
  const one=await api(env,`/api/learning/sessions/${s.id}/event`,data);
  const two=await api(env,`/api/learning/sessions/${s.id}/event`,data);
  assert.equal(one.status,200); assert.equal(two.status,200); assert.equal(one.body.version,two.body.version);
  const resumed=await start(env); assert.equal(resumed.feedback.correct,true);
  const stale=await act(env,s,'draft',{answer:'My other draft'}); assert.equal(stale.status,409);
  assert.equal((await api(env,`/api/learning/sessions/${s.id}/event`,{...data,eventId:crypto.randomUUID()},'other')).status,404);
  const attempts=(await env.DB.prepare("SELECT count(*) AS n FROM learning_events WHERE kind='attempt' AND json_extract(data,'$.stepId')='water'").first()).n;
  assert.equal(attempts,1);
});

test('a construction cannot be skipped into a claim of success',async()=>{
  const env:any={DB:database()}; const s=await firstTask(env);
  assert.equal((await act(env,s,'advance')).status,400);
  const revealed=await act(env,s,'reveal');
  const next=await act(env,revealed.body,'advance'); assert.equal(next.status,200);
  const summary=await api(env,'/api/learning/summary');
  assert.equal(summary.body.skills[0]?.independentCombinations??0,0);
});

test('companion and language preferences persist without inventing supported translations',async()=>{
  const env:any={DB:database()};
  const r=await api(env,'/api/user/preferences',{minimizeCompanion:true,explanationLanguage:'en',knownLanguages:['te','hi'],nativeLanguage:'te'},'learner','PATCH');
  assert.equal(r.status,200);
  assert.equal((await api(env,'/api/user')).body.preferences.minimizeCompanion,true);
  assert.equal((await api(env,'/api/user/preferences',{explanationLanguage:'te'},'learner','PATCH')).status,400);
});

test('self-practice completion saves without a correctness score and cannot send a perfect score',async()=>{
  const env:any={DB:database()};
  const notes={version:2,mode:'self-practice',attempts:1,correct:null,confidence:'soon',weakConcepts:[],completedActivities:['practice'],review:{dueAt:'2026-09-10T00:00:00.000Z',concept:'A taught pattern',prompt:'Use the same taught ingredients.',cue:'Consult the original lesson notes.'}};
  const data={completed:true,progress:100,score:null,timeSpent:60,notes:JSON.stringify(notes)};
  const r=await api(env,'/api/progress/lesson/fr-lesson01',data);
  assert.equal(r.status,200);assert.equal(r.body.score,null);
  assert.equal((await api(env,'/api/progress/lesson/fr-lesson01',{...data,score:100})).status,400);
});

test('baseline sentences and assisted recognition are not labelled new independent learning',async()=>{
  const env:any={DB:database()};let s=await start(env);
  s=(await act(env,s,'advance',{answer:'Ich möchte Wasser.'})).body;
  s=(await act(env,s,'advance')).body;
  s=(await act(env,s,'reveal')).body;
  s=(await act(env,s,'attempt',{answer:'Requesting tea'})).body;
  assert.notEqual(s.feedback.evidence,'recognized');
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'advance')).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Wasser.'})).body;
  assert.equal(s.feedback.independent,false);
  assert.equal((await api(env,'/api/learning/summary')).body.skills[0].independentCombinations,0);
});

test('review remains open immediately but does not lengthen the spaced interval or claim delayed retrieval',async()=>{
  const env:any={DB:database()};let s=await firstTask(env);
  // A completed fixture with an old first success and a recent practice isolates the spacing rule.
  const row=await env.DB.prepare('SELECT state FROM learning_sessions WHERE id=?').bind(s.id).first();
  const state=JSON.parse(row.state);Object.assign(state,{completed:true,stepIndex:11,firstSuccessAt:new Date(Date.now()-7*86400000).toISOString(),lastPracticeAt:new Date().toISOString(),lastCompletedAt:new Date().toISOString()});
  await env.DB.prepare('UPDATE learning_sessions SET state=? WHERE id=?').bind(JSON.stringify(state),s.id).run();
  s=(await api(env,'/api/learning/start',{activityId:'de-starter-01',mode:'review'})).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Wasser.'})).body;
  assert.notEqual(s.feedback.evidence,'retrieved');
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'attempt',{answer:'Ich möchte Kaffee, bitte.'})).body;
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'advance')).body;
  assert.ok(Date.parse(s.dueAt)-Date.now()<1.1*86400000);
});

test('natural variants keep the target meaning while wrong articles and verb positions do not pass',async()=>{
  for(const answer of ['Ich möchte gern Wasser.','Ich möchte gerne Wasser.','Ich möchte ein Wasser.','Ich möchte einen Kaffee.']){
    const env:any={DB:database()};let s=await firstTask(env);
    if(answer.includes('Kaffee')){s=(await act(env,s,'reveal')).body;s=(await act(env,s,'advance')).body;s=(await act(env,s,'advance')).body;}
    const r=await act(env,s,'attempt',{answer});assert.equal(r.body.feedback.correct,true,answer);
  }
  const env:any={DB:database()};const s=await firstTask(env);
  assert.equal((await act(env,s,'attempt',{answer:'Ich möchte einen Wasser.'})).body.feedback.correct,false);
});

test('language reset also removes owned starter evidence and drafts',async()=>{
  const env:any={DB:database()};const s=await firstTask(env);
  await act(env,s,'attempt',{answer:'Ich möchte Wasser.'});
  const draft=await api(env,'/api/learning/drafts/de-lesson02',{version:-1,data:{step:1,answer:'Mein Versuch'}},'learner','PUT');assert.equal(draft.status,200);
  const stale=await api(env,'/api/learning/drafts/de-lesson02',{version:-1,data:{step:1,answer:'old'}},'learner','PUT');assert.equal(stale.status,409);
  assert.equal((await api(env,'/api/learning/drafts/de-lesson02',undefined,'other')).body.data,null);
  await api(env,'/api/progress/language/de/reset',undefined,'learner','DELETE');
  assert.equal((await api(env,'/api/learning/summary')).body.skills.length,0);
  assert.equal((await api(env,'/api/learning/drafts/de-lesson02')).body.data,null);
});

test('all three authored starters complete, hide keys and supply every required target word first',async()=>{
  const env:any={DB:database()};
  for(const authored of activities){
    const known=new Set<string>();
    let s=await start(env,authored.id);
    for(const step of authored.steps){
      assert.equal(s.step.id,step.id);
      for(const key of ['answer','target','hints','correctOption','exposures'])assert.equal(key in s.step,false,`${authored.id}/${step.id} leaked ${key}`);
      for(const text of [...(step.words||[]).map(w=>w.word),...(step.examples||[]).map(e=>e.sentence)])for(const token of normalizeGerman(text).split(' '))known.add(token);
      if(step.target){
        const t=step.target;
        for(const token of [t.subject,t.subject==='sie'?'möchten':'möchte',t.drink,t.language,t.action,t.please?'bitte':undefined].filter(Boolean) as string[])assert.ok(known.has(normalizeGerman(token)),`${authored.id}/${step.id} requires untaught ${token}`);
      }
      if(['construct','understand','context'].includes(step.kind)){
        const result=await act(env,s,'attempt',{answer:step.kind==='context'?'Ich möchte Tee.':step.answer});
        assert.equal(result.status,200);assert.equal(result.body.feedback.correct,true,`${authored.id}/${step.id}`);s=result.body;
      }
      const result=await act(env,s,'advance');assert.equal(result.status,200);s=result.body;
    }
    assert.equal(s.completed,true);
  }
  const summary=(await api(env,'/api/learning/summary')).body;
  assert.equal(summary.skills.length,3);
  assert.ok(summary.skills.every((s:any)=>s.independentCombinations>=2));
});

test('a replay delayed before the first commit returns the latest saved state',async()=>{
  let hold=false,release!:()=>void,readStarted!:()=>void;
  const waiting=new Promise<void>(resolve=>release=resolve),started=new Promise<void>(resolve=>readStarted=resolve);
  const env:any={DB:database(async sql=>{if(hold&&sql.startsWith('SELECT * FROM learning_sessions WHERE id=')){hold=false;readStarted();await waiting;}})};
  const s=await firstTask(env),data={eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:'Ich möchte Wasser.'};
  hold=true;const delayed=api(env,`/api/learning/sessions/${s.id}/event`,data);await started;
  try{
    const committed=await api(env,`/api/learning/sessions/${s.id}/event`,data);assert.equal(committed.status,200);
    const advanced=await act(env,committed.body,'advance');assert.equal(advanced.status,200);
    release();const replay=await delayed;assert.equal(replay.status,200);assert.equal(replay.body.version,advanced.body.version);assert.equal(replay.body.step.id,advanced.body.step.id);
    assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM learning_events WHERE event_id=?').bind(data.eventId).first()).n,1);
  }finally{release();}
});

test('new-context application requires no support, and help during a delayed review keeps a short interval',async()=>{
  const env:any={DB:database()};let s=await firstTask(env);
  const row=await env.DB.prepare('SELECT state FROM learning_sessions WHERE id=?').bind(s.id).first(),state=JSON.parse(row.state);
  Object.assign(state,{completed:true,stepIndex:activity('de-starter-01','1.0.0')!.steps.length-1,lastPracticeAt:new Date(Date.now()-2*86400000).toISOString()});
  await env.DB.prepare('UPDATE learning_sessions SET state=? WHERE id=?').bind(JSON.stringify(state),s.id).run();
  s=(await api(env,'/api/learning/start',{activityId:'de-starter-01',mode:'review'})).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Wasser.'})).body;
  assert.equal((await api(env,'/api/learning/summary')).body.skills[0].appliedNewContext,true);
  s=(await act(env,s,'advance')).body;
  assert.equal((await api(env,'/api/learning/support',{languageCode:'de',source:'notes'})).status,200);
  s=(await api(env,`/api/learning/sessions/${s.id}`)).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Kaffee, bitte.'})).body;
  assert.equal(s.feedback.evidence,'supported');
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'advance')).body;
  assert.ok(Date.parse(s.dueAt)-Date.now()<1.1*86400000);
});

test('account deletion cascades new learning data and leaves another account intact',async()=>{
  const env:any={DB:database()};let learnerId=0;
  for(const identity of ['learner','other']){
    const user=(await api(env,'/api/user',undefined,identity)).body;
    if(identity==='learner')learnerId=user.id;
    const s=(await api(env,'/api/learning/start',{activityId:'de-starter-01'},identity)).body;
    await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind:'advance'},identity);
    await api(env,'/api/learning/drafts/fr-lesson01',{version:-1,data:{step:1,answer:'Je parle.'}},identity,'PUT');
    await env.DB.prepare('INSERT INTO ai_usage (user_id,day,kind,used) VALUES (?,?,?,?)').bind(user.id,'2026-09-09','chat',1).run();
  }
  const user=(await api(env,'/api/user')).body;
  assert.equal((await api(env,'/api/user/delete',{confirmation:user.username},'learner','DELETE')).status,200);
  for(const table of ['learning_sessions','learning_events','lesson_drafts','ai_usage'])assert.equal((await env.DB.prepare(`SELECT count(*) AS n FROM ${table} WHERE user_id=?`).bind(learnerId).first()).n,0,table);
  assert.equal((await api(env,'/api/learning/summary',undefined,'other')).body.skills.length,1);
  assert.equal((await api(env,'/api/learning/drafts/fr-lesson01',undefined,'other')).body.data.answer,'Je parle.');
});

test('oversized microphone uploads are bounded even without a content-length header',async()=>{
  const env:any={DB:database(),OPENAI_API_KEY:'test-only'};
  const r=await worker.fetch(new Request('https://lingomitra.test/api/speech/transcribe',{method:'POST',headers:{'oai-authenticated-user-id':'learner','oai-authenticated-user-email':'learner@example.test',origin:'https://lingomitra.test','content-type':'multipart/form-data; boundary=test'},body:new Uint8Array(2.2*1024*1024)}),env);
  assert.equal(r.status,413);
  assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM ai_usage').first()).n,0);
});

test('concurrent settings updates retain unrelated preferences',async()=>{
  let hold=false,release!:()=>void,readStarted!:()=>void;
  const waiting=new Promise<void>(resolve=>release=resolve),started=new Promise<void>(resolve=>readStarted=resolve);
  const env:any={DB:database(async sql=>{if(hold&&sql.startsWith('INSERT INTO users')){hold=false;readStarted();await waiting;}})};
  await api(env,'/api/user');hold=true;
  const delayed=api(env,'/api/user/preferences',{minimizeCompanion:true},'learner','PATCH');await started;
  try{
    assert.equal((await api(env,'/api/user/preferences',{knownLanguages:['te'],ttsEnabled:false},'learner','PATCH')).status,200);
    release();assert.equal((await delayed).status,200);
    const user=(await api(env,'/api/user')).body;
    assert.equal(user.preferences.minimizeCompanion,true);assert.deepEqual(user.preferences.knownLanguages,['te']);assert.equal(user.ttsEnabled,false);
  }finally{release();}
});

test('optional AI limits stop provider calls while authored lessons stay available',async()=>{
  const env:any={DB:database(),OPENAI_API_KEY:'test-only'};const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({choices:[{message:{content:'Try a sentence from your notes.'}}],usage:{prompt_tokens:100,completion_tokens:20}}),{headers:{'content-type':'application/json'}});};
  try{
    for(let i=0;i<20;i++)assert.equal((await api(env,'/api/chat',{lessonId:'de-lesson02',conversation:[{role:'user',content:'Help me with this lesson.'}]})).status,200);
    assert.equal((await api(env,'/api/chat',{lessonId:'de-lesson02',conversation:[{role:'user',content:'Again'}]})).status,429);
    assert.equal(calls,20);assert.equal((await start(env)).step.id,'prior');
  }finally{globalThis.fetch=original;}
});

test('speech transcription returns an editable transcript without sending a tutor message',async()=>{
  const env:any={DB:database(),OPENAI_API_KEY:'test-only'},original=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({text:'Ich möchte Wasser.'}),{headers:{'content-type':'application/json'}});
  try{
    const form=new FormData();form.set('audio',new File(['test-audio'],'recording.webm',{type:'audio/webm'}));
    const r=await worker.fetch(new Request('https://lingomitra.test/api/speech/transcribe',{method:'POST',headers:{'oai-authenticated-user-id':'learner','oai-authenticated-user-email':'learner@example.test',origin:'https://lingomitra.test'},body:form}),env);
    assert.equal(r.status,200);assert.equal(((await r.json()) as any).transcription,'Ich möchte Wasser.');
    assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM chat_history').first()).n,0);
  }finally{globalThis.fetch=original;}
});

test('the full course overview preserves lesson counts and resumes a non-German draft',async()=>{
  const env:any={DB:database()};
  await api(env,'/api/learning/drafts/ja-lesson01',{version:-1,data:{step:1,answer:'私は本を読みます。'}},'learner','PUT');
  const overview=await api(env,'/api/progress/overview');assert.equal(overview.status,200);
  assert.equal(overview.body.courses.reduce((sum:number,c:any)=>sum+c.total,0),209);
  assert.equal((await api(env,'/api/learning/summary')).body.resume.href,'/ja/lesson/1');
});

test('tutor help elsewhere in the German course is recorded before an active starter is assessed',async()=>{
  const env:any={DB:database(),OPENAI_API_KEY:'test-only'},original=globalThis.fetch;let s=await firstTask(env);
  globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'Use the request pattern.'}}]}),{headers:{'content-type':'application/json'}});
  try{assert.equal((await api(env,'/api/chat',{lessonId:'de-lesson02',conversation:[{role:'user',content:'Help with a request.'}]})).status,200);}finally{globalThis.fetch=original;}
  s=(await api(env,`/api/learning/sessions/${s.id}`)).body;
  const result=await act(env,s,'attempt',{answer:'Ich möchte Wasser.'});assert.equal(result.body.feedback.independent,false);
});

test('a genuinely delayed review retrieves a pattern and opens a later reminder',async()=>{
  const env:any={DB:database()};let s=await firstTask(env);
  const row=await env.DB.prepare('SELECT state FROM learning_sessions WHERE id=?').bind(s.id).first();const state=JSON.parse(row.state);
  Object.assign(state,{completed:true,stepIndex:11,lastPracticeAt:new Date(Date.now()-2*86400000).toISOString(),firstSuccessAt:new Date(Date.now()-2*86400000).toISOString(),lastCompletedAt:new Date(Date.now()-2*86400000).toISOString()});
  await env.DB.prepare('UPDATE learning_sessions SET state=? WHERE id=?').bind(JSON.stringify(state),s.id).run();
  s=(await api(env,'/api/learning/start',{activityId:'de-starter-01',mode:'review'})).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Wasser.'})).body;assert.equal(s.feedback.evidence,'retrieved');
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'attempt',{answer:'Ich möchte Kaffee, bitte.'})).body;
  s=(await act(env,s,'advance')).body;s=(await act(env,s,'advance')).body;
  assert.ok(Date.parse(s.dueAt)-Date.now()>2.9*86400000);
  s=(await api(env,'/api/learning/start',{activityId:'de-starter-01',mode:'review'})).body;
  s=(await act(env,s,'attempt',{answer:'Ich möchte Wasser.'})).body;assert.notEqual(s.feedback.evidence,'retrieved');
});
