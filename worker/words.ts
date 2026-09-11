import { z } from 'zod';
import { body, HttpError, json, now } from './core';
import { activity, words } from './learning-content';
import { recordLearningSupport } from './learning';
import { wordKey } from './word-content';
import type { Account, Env } from './types';
import type { WordRecord, WordsSummary } from '../shared/words';
const exampleStep=(w:typeof words[number])=>w.practice?.steps.find(s=>s.id==='use-in-sentence')||w.context?.step;

export async function wordsSummary(env:Env, user:Account, code:string):Promise<WordsSummary> {
  const rows=(await env.DB.prepare('SELECT * FROM learning_sessions WHERE user_id=? AND language_code=?').bind(user.id,code).all()).results;
  const events=(await env.DB.prepare("SELECT e.data,e.session_id FROM learning_events e JOIN learning_sessions s ON s.id=e.session_id AND s.user_id=e.user_id WHERE e.user_id=? AND s.language_code=? AND e.kind='attempt'").bind(user.id,code).all()).results.map(e=>({...JSON.parse(e.data),sessionId:e.session_id}));
  const exposures=(await env.DB.prepare('SELECT material_key FROM learning_exposures WHERE user_id=? AND language_code=?').bind(user.id,code).all()).results.map(e=>e.material_key);
  const account=await env.DB.prepare('SELECT preferences FROM users WHERE id=?').bind(user.id).first();
  const bookmarks:string[]=JSON.parse(account!.preferences).savedWordIds||[];
  const delivered=rows.flatMap(row=>{
    const a=activity(row.activity_id,row.content_version);if(!a)return [];
    const s=JSON.parse(row.state);
    return (s.everCompleted||s.completed?a.steps:s.mode==='lesson'?a.steps.slice(0,s.stepIndex+1):[]).flatMap(step=>step.words||[]).map(w=>w.word);
  });
  const collection:WordRecord[]=words.filter(w=>w.language===code).map(w=>{
    const row=rows.find(r=>r.activity_id===w.practice?.id);
    const attempts=events.filter(e=>e.targetSenseId===w.senseId||e.targetSenseIds?.includes(w.senseId));
    const lexical=attempts.filter(e=>e.responseMode==='word');
    return {lexemeId:w.lexemeId,senseId:w.senseId,language:w.language,native:w.native,meaning:w.meaning,reading:w.reading,forms:w.forms,grammar:w.grammar,combinations:w.combinations,lessons:w.lessons,reviewStatus:w.reviewStatus,
      encountered:exposures.includes(wordKey(w.senseId))||w.forms.some(f=>delivered.includes(f.native)),saved:bookmarks.includes(w.senseId),recognized:attempts.some(e=>!e.construction&&e.responseMode!=='word'&&e.feedback?.correct),recalled:lexical.some(e=>e.feedback?.evidence==='word-recalled'||e.feedback?.evidence==='word-retrieved'),retrievedLater:lexical.some(e=>e.feedback?.evidence==='word-retrieved'),usedInContext:attempts.some(e=>e.construction&&e.feedback?.correct),supported:attempts.some(e=>e.feedback?.correct&&e.feedback?.evidence==='supported'),dueAt:row?.due_at||null,practiceHref:w.practice?`/learn/${w.practice.id}${row&&JSON.parse(row.state).completed?'?review=1':''}`:null,practiceStarted:Boolean(row)};
  });
  return {language:code,words:collection};
}

export async function wordsRoute(request:Request,env:Env,user:Account):Promise<Response|null> {
  const url=new URL(request.url),path=url.pathname;
  if(path==='/api/words'&&request.method==='GET'){
    const code=z.enum(['de','es','fr','hi','zh','ja','kn']).parse(url.searchParams.get('language'));
    return json(await wordsSummary(env,user,code));
  }
  if(path==='/api/words/exposure'&&request.method==='POST'){
    const data=z.object({senseIds:z.array(z.string().max(50)).min(1).max(118),includeExample:z.boolean().default(false)}).strict().parse(await body(request));
    const selected=[...new Set(data.senseIds)].map(id=>{const w=words.find(w=>w.senseId===id);if(!w)throw new HttpError(404,'This word is not in the current lesson collection.');return w;});
    // Reading a word collection while an exercise is active is in-app support.
    // Record it before returning the requested example or showing the collection.
    for(const code of new Set(selected.map(w=>w.language)))await recordLearningSupport(env,user.id,code,'notes',selected.filter(w=>w.language===code).map(w=>w.native).join('; '));
    const stamp=now();
    await env.DB.batch(selected.flatMap(w=>[wordKey(w.senseId),...(data.includeExample&&exampleStep(w)?.validation?[exampleStep(w)!.validation!.key]:[])].map(key=>env.DB.prepare('INSERT INTO learning_exposures (user_id,language_code,material_key,source,seen_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id,language_code,material_key) DO UPDATE SET seen_at=excluded.seen_at,source=excluded.source').bind(user.id,w.language,key,'word-collection',stamp))));
    const context=selected.length===1&&data.includeExample?exampleStep(selected[0]):null;
    return json({saved:true,example:context?{sentence:context.answer,situation:context.prompt}:null});
  }
  const match=path.match(/^\/api\/words\/([^/]+)\/bookmark$/);
  if(match&&request.method==='POST'){
    const senseId=match[1];if(!words.some(w=>w.senseId===senseId))throw new HttpError(404,'This word is not in the current lesson collection.');
    const {saved}=z.object({saved:z.boolean()}).strict().parse(await body(request));
    if(saved){
      await env.DB.prepare("UPDATE users SET preferences=json_insert(CASE WHEN json_type(preferences,'$.savedWordIds')='array' THEN preferences ELSE json_set(preferences,'$.savedWordIds',json('[]')) END,'$.savedWordIds[#]',?) WHERE id=? AND NOT EXISTS (SELECT 1 FROM json_each(preferences,'$.savedWordIds') WHERE value=?)").bind(senseId,user.id,senseId).run();
    } else {
      await env.DB.prepare("UPDATE users SET preferences=json_remove(preferences,(SELECT '$.savedWordIds['||key||']' FROM json_each(preferences,'$.savedWordIds') WHERE value=? LIMIT 1)) WHERE id=? AND EXISTS (SELECT 1 FROM json_each(preferences,'$.savedWordIds') WHERE value=?)").bind(senseId,user.id,senseId).run();
    }
    return json({saved,senseId});
  }
  return null;
}
