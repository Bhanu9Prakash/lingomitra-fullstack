import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index';
import { activity } from '../worker/learning-content';
import { grade } from '../worker/learning-validator';
import { database, request } from './helpers';

async function api(env:any, path:string, data?:unknown, user='words-owner', method?:string) {
  const response = await worker.fetch(request(path,user,data,method),env);
  const body:any = await response.json();
  return { status:response.status, body };
}
async function send(env:any,s:any,kind:string,answer?:string) {
  const response = await api(env,`/api/learning/sessions/${s.id}/event`,{eventId:crypto.randomUUID(),version:s.version,kind,answer});
  assert.equal(response.status,200,JSON.stringify(response.body)); return response.body;
}
const cases = [
  ['de','de.sense.004.01','Kaffee'], ['es','es.sense.003.01','un taxi'],
  ['fr','fr.sense.002.01','le café'], ['hi','hi.sense.012.01','पानी'],
  ['zh','zh.sense.005.01','咖啡'], ['ja','ja.sense.001.01','水'],
  ['kn','kn.sense.004.01','ನೀರು'],
];

test('word collection never converts browsing or another account’s study into mastery',async()=>{
  const env:any={DB:database()};
  let response=await api(env,'/api/words?language=de');
  assert.equal(response.status,200);
  const word=response.body.words.find((w:any)=>w.senseId==='de.sense.004.01');
  assert.equal(word.native,'Kaffee');assert.equal(word.encountered,false);assert.equal(word.recalled,false);
  await api(env,'/api/words/exposure',{senseIds:['de.sense.004.01'],includeExample:false});
  response=await api(env,'/api/words?language=de');
  const seen=response.body.words.find((w:any)=>w.senseId===word.senseId);
  assert.equal(seen.encountered,true);assert.equal(seen.recalled,false);assert.equal(seen.retrievedLater,false);
  const other=await api(env,'/api/words?language=de',undefined,'other-owner');
  assert.equal(other.body.words.find((w:any)=>w.senseId===word.senseId).encountered,false);
  assert.equal((await api(env,'/api/words?language=es')).body.words.some((w:any)=>w.language==='de'),false);
  assert.equal((await worker.fetch(request('/api/words?language=de'),env)).status,401);
});

test('bookmarks persist atomically without replacing unrelated preferences or another owner',async()=>{
  const env:any={DB:database()};
  await api(env,'/api/user/preferences',{minimizeCompanion:true},'words-owner','PATCH');
  for(const senseId of ['de.sense.004.01','es.sense.003.01'])assert.equal((await api(env,`/api/words/${senseId}/bookmark`,{saved:true})).status,200);
  await api(env,'/api/words/de.sense.004.01/bookmark',{saved:true});
  const user=await api(env,'/api/user');
  assert.equal(user.body.preferences.minimizeCompanion,true);
  assert.deepEqual(user.body.preferences.savedWordIds,['de.sense.004.01','es.sense.003.01']);
  await api(env,'/api/words/de.sense.004.01/bookmark',{saved:false});
  assert.deepEqual((await api(env,'/api/user')).body.preferences.savedWordIds,['es.sense.003.01']);
  assert.equal((await api(env,'/api/words?language=es',undefined,'other-owner')).body.words.some((w:any)=>w.saved),false);
});

test('all seven word pathways use saved lesson sessions and distinguish word recall from sentence evidence',async()=>{
  const env:any={DB:database()};
  for(const [code,senseId,native] of cases){
    const r=await api(env,'/api/learning/start',{activityId:`word-${senseId}`});
    assert.equal(r.status,200,code);let s=r.body;
    assert.equal(s.languageCode,code);assert.ok(s.linkedLessonId.startsWith(code+'-lesson'));
    let lexical=false,context=false;
    for(let limit=0;!s.completed&&limit<12;limit++){
      const authored=activity(s.activityId,s.contentVersion)!.steps[s.stepIndex];
      for(const key of ['answer','validation','hints','correctOption','targetSenseId'])assert.equal(key in s.step,false);
      if(['construct','context','understand'].includes(s.step.kind)){
        assert.equal(s.step.examples,undefined);assert.equal(s.step.words,undefined);
        s=await send(env,s,'attempt',s.step.responseMode==='word'?native:authored.answer);
        assert.equal(s.feedback.correct,true,code+'/'+s.step.id);
        if(s.step.responseMode==='word'){lexical=true;assert.equal(s.feedback.independent,false);assert.equal(s.feedback.evidence,'word-recalled');}
        if(s.step.kind==='context'){context=true;assert.equal(s.feedback.independent,false);}
      }
      s=await send(env,s,'advance');
    }
    assert.equal(s.completed,true);assert.ok(lexical&&context);assert.ok(s.dueAt);
    const row=(await api(env,`/api/words?language=${code}`)).body.words.find((w:any)=>w.senseId===senseId);
    assert.equal(row.recalled,true);assert.equal(row.retrievedLater,false);assert.equal(row.usedInContext,true);
    assert.equal((await api(env,`/api/learning/sessions/${s.id}`,undefined,'other-owner')).status,404);
    const review=(await api(env,'/api/learning/start',{activityId:s.activityId,mode:'review'})).body;
    assert.equal(review.step.responseMode,'word');assert.equal(review.step.words,undefined);
    const immediate=await send(env,review,'attempt',native);
    assert.equal(immediate.feedback.evidence,'word-recalled');
    assert.equal((await api(env,`/api/learning/summary?language=${code}`)).body.activities.length,3,'word practice must not replace or inflate the curriculum');
  }
});

test('German language names do not acquire a spurious indefinite article',()=>{
  const step=activity('de-starter-02')!.steps.find(s=>s.id==='english-action')!;
  assert.equal(grade(step,'Ich möchte ein Englisch lernen.').correct,false);
  assert.equal(grade(step,'Ich möchte Englisch lernen.').correct,true);
});

test('a later word review advances its reminder only after both word and sentence retrieval',async()=>{
  const env:any={DB:database()};
  let s=(await api(env,'/api/learning/start',{activityId:'word-de.sense.004.01'})).body;
  async function finishCurrent(){
    while(!s.completed){
      const a=activity(s.activityId,s.contentVersion)!;
      const step=(s.mode==='review'?a.review:a.steps)[s.stepIndex];
      if(['construct','context','understand'].includes(step.kind))s=await send(env,s,'attempt',step.answer);
      s=await send(env,s,'advance');
    }
  }
  await finishCurrent();
  const past=new Date(Date.now()-2*86400000).toISOString();
  await env.DB.prepare("UPDATE learning_sessions SET state=json_set(state,'$.lastPracticeAt',?,'$.lastCompletedAt',?),due_at=?").bind(past,past,past).run();
  await env.DB.prepare('UPDATE learning_exposures SET seen_at=?').bind(past).run();
  s=(await api(env,'/api/learning/start',{activityId:s.activityId,mode:'review'})).body;
  s=await send(env,s,'attempt','Kaffee');assert.equal(s.feedback.evidence,'word-retrieved');
  s=await send(env,s,'advance');
  await finishCurrent();
  assert.ok(Date.parse(s.dueAt)-Date.now()>2.9*86400000);
  assert.equal((await api(env,'/api/words?language=de')).body.words.find((w:any)=>w.senseId==='de.sense.004.01').retrievedLater,true);
  // Opening an answer-bearing collection must prevent a fresh delayed-retrieval claim.
  await api(env,'/api/words/exposure',{senseIds:['de.sense.004.01'],includeExample:true});
  s=(await api(env,'/api/learning/start',{activityId:s.activityId,mode:'review'})).body;
  s=await send(env,s,'attempt','Kaffee');assert.equal(s.feedback.evidence,'word-recalled');
  s=await send(env,s,'advance');await finishCurrent();
  assert.ok(Date.parse(s.dueAt)-Date.now()<1.1*86400000);
});

test('unrecognized word answers and revealed words never earn lexical retrieval credit',async()=>{
  const env:any={DB:database()};
  let s=(await api(env,'/api/learning/start',{activityId:'word-de.sense.004.01'})).body;
  s=await send(env,s,'advance');s=await send(env,s,'attempt','coffee');s=await send(env,s,'advance');
  s=await send(env,s,'attempt','an alternative the checker does not know');
  assert.equal(s.feedback.correct,false);assert.equal(s.feedback.category,'unrecognized');
  s=await send(env,s,'reveal');s=await send(env,s,'attempt','Kaffee');
  assert.equal(s.feedback.evidence,'supported');assert.equal(s.feedback.independent,false);
  const w=(await api(env,'/api/words?language=de')).body.words.find((w:any)=>w.senseId==='de.sense.004.01');
  assert.equal(w.recalled,false);assert.equal(w.retrievedLater,false);assert.equal(w.supported,true);
});

test('checking an already saved sentence records its word use even when the request omits the answer',async()=>{
  const env:any={DB:database()};
  let s=(await api(env,'/api/learning/start',{activityId:'de-starter-01'})).body;
  while(s.step.id!=='coffee'){
    if(s.step.kind==='understand')s=await send(env,s,'attempt','The speaker would like tea');
    s=await send(env,s,'advance');
  }
  s=await send(env,s,'draft','Ich möchte Kaffee.');
  s=await send(env,s,'attempt');
  assert.equal(s.feedback.correct,true);
  const w=(await api(env,'/api/words?language=de')).body.words.find((w:any)=>w.senseId==='de.sense.004.01');
  assert.equal(w.usedInContext,true);assert.equal(w.recalled,false,'sentence evidence is not a separate lexical test');
});
