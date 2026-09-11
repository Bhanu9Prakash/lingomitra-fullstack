import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activities, activity, publicStep } from '../worker/learning-content';
import { grade } from '../worker/learning-validator';
import worker from '../worker/index';
import { database, request } from './helpers';

const codes=['de','es','fr','hi','zh','ja','kn'];
test('each offered target has three original authored openings and a return path',()=>{
  for(const code of codes){
    const pathway=activities.filter(a=>(a as any).languageCode===code);
    assert.equal(pathway.length,3,code);
    for(const a of pathway){
      assert.ok(a.linkedLessonId.startsWith(code+'-lesson'));
      assert.ok(a.steps.some(s=>s.kind==='construct'));
      assert.equal(a.steps.at(-1)?.kind,'finish');
      assert.ok(a.review.some(s=>s.kind==='construct'));
      assert.equal(a.reviewStatus,'awaiting-human-review');
    }
  }
  assert.equal(activity('de-starter-01','1.0.0')?.version,'1.0.0','historical German remains readable');
});

test('authored variants work, keys stay on the server, and assessments hide all aids',()=>{
  for(const a of activities)for(const step of [...a.steps,...a.review]){
    const safe=publicStep(step);
    for(const key of ['validation','answer','hints','target','correctOption','exposures','independentEligible'])assert.equal(key in safe,false,`${a.id}/${step.id}: ${key}`);
    if(step.kind==='construct'){
      assert.equal(safe.words,undefined,`${a.id}/${step.id}: visible word cue`);
      assert.equal(safe.examples,undefined,`${a.id}/${step.id}: visible answer`);
      for(const variant of (step as any).validation?.accepted||[])assert.equal(grade(step,variant.text).correct,true,`${a.id}/${step.id}: ${variant.text}`);
    }
  }
});

test('every target completes teaching, attempt, feedback, saved progress and return practice',async()=>{
  const env:any={DB:database()};
  for(const a of activities){
    const code=a.languageCode!;
    assert.ok(a,`missing ${code}`);
    const response=await worker.fetch(request('/api/learning/start','multilingual',{activityId:a.id}),env);
    assert.equal(response.status,200);let s:any=await response.json();
    assert.equal(s.languageCode,code);let independent=0;
    for(const authored of a.steps){
      assert.equal(s.step.id,authored.id);
      if(['construct','understand','context'].includes(s.step.kind)){
        const r=await worker.fetch(request(`/api/learning/sessions/${s.id}/event`,'multilingual',{eventId:crypto.randomUUID(),version:s.version,kind:'attempt',answer:authored.answer}),env);
        assert.equal(r.status,200);s=await r.json();assert.equal(s.feedback.correct,true,`${a.id}/${authored.id}`);if(s.feedback.independent)independent++;
      }
      const r=await worker.fetch(request(`/api/learning/sessions/${s.id}/event`,'multilingual',{eventId:crypto.randomUUID(),version:s.version,kind:'advance'}),env);
      assert.equal(r.status,200);s=await r.json();
    }
    assert.equal(s.completed,true);
    assert.ok(independent>=1,`${a.id}: no unseen eligible combination remains after the authored teaching and earlier lessons`);
    const r=await worker.fetch(request('/api/learning/start','multilingual',{activityId:a.id,mode:'review'}),env);
    assert.equal(r.status,200);const review:any=await r.json();assert.equal(review.mode,'review');
    assert.equal(review.step.examples,undefined);assert.equal(review.step.words,undefined);
  }
});
