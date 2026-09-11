import { z } from 'zod';
import { body, HttpError, json, now } from './core';
import { lesson } from './catalog';
import { activities, activity, publicStep, semanticKey, words, type Activity, type AuthoredStep } from './learning-content';
import { wordMatches } from './word-content';
import { grade, recognizedKeys, normalizeAnswer } from './learning-validator';
import type { LearningFeedback, LearningSession, LearningSummary } from '../shared/learning';
import type { Account, Env } from './types';

type State = {
  stepIndex:number; answer:string; mode:'lesson'|'review'; completed:boolean;
  exposures:string[]; assistedSteps:string[]; allAssisted:boolean; activeMs:number;
  feedback?:LearningFeedback; help?:{level:number;text:string}; priorKnowledge:string;
  beganAt:string; arrivalAt:string; firstIndependentAt?:string; firstSuccessAt?:string;
  lastPracticeAt?:string; lastCompletedAt?:string; reviewAnchor?:string; delayedInRound?:boolean; struggledInRound?:boolean; needsSupport?:boolean;
  reviewRound:number; independentInRound:number; runId?:string; runActiveMs?:number; everCompleted?:boolean; reviewSet?:number; lexicalDelayedInRound?:boolean; lexicalSuccessInRound?:boolean;
};
const href=(id:string,review=false)=>`/learn/${id}${review?'?review=1':''}`;
const steps=(a:Activity,s:State)=>s.mode==='review'?(s.reviewSet===7&&a.review7?a.review7:a.review):a.steps;
const schema=z.object({eventId:z.string().uuid(),version:z.number().int().min(0),kind:z.enum(['advance','attempt','hint','reveal','draft','support']),answer:z.string().max(2000).optional(),activeDeltaMs:z.number().int().min(0).max(3600000).optional(),source:z.enum(['notes','tutor','listening','external']).optional()}).strict();

function enter(s:State,step:AuthoredStep) {
  for(const key of step.exposures||[])if(!s.exposures.includes(key))s.exposures.push(key);
}
function canAdvance(step:AuthoredStep,s:State) {
  return !['construct','context','understand'].includes(step.kind)||Boolean(s.feedback)||s.help?.level===99;
}
async function sessionRow(env:Env,uid:number,id:string) {
  const row=await env.DB.prepare('SELECT * FROM learning_sessions WHERE id=? AND user_id=?').bind(id,uid).first();
  if(!row)throw new HttpError(404,'This learning session was not found.');return row;
}
function content(row:any) { const a=activity(row.activity_id,row.content_version);if(!a)throw new HttpError(409,'This saved lesson version needs to be restored. Your draft is still saved; please contact us.');return a; }
async function view(env:Env,uid:number,row:any):Promise<LearningSession> {
  const a=content(row),s:State=JSON.parse(row.state),step=steps(a,s)[s.stepIndex];
  const completed=(await env.DB.prepare('SELECT activity_id,state FROM learning_sessions WHERE user_id=?').bind(uid).all()).results.filter(x=>{const state=JSON.parse(x.state);return state.completed||state.everCompleted||state.lastCompletedAt;}).map(x=>x.activity_id);
  return {languageCode:a.languageCode||row.language_code,audioLocale:a.audioLocale,script:a.script,id:row.id,activityId:a.id,title:a.title,linkedLessonId:a.linkedLessonId,version:row.version,contentVersion:a.version,reviewStatus:a.reviewStatus,mode:s.mode,step:publicStep(step),stepIndex:s.stepIndex,totalSteps:steps(a,s).length,answer:s.answer,feedback:s.feedback,help:s.help,assisted:s.allAssisted||s.assistedSteps.includes(step.id),completed:s.completed,dueAt:row.due_at,activeMs:s.activeMs,prerequisiteWarnings:a.prerequisites.filter(id=>!completed.includes(id)).map(id=>({id,title:activity(id)?.title||id})),priorKnowledge:s.priorKnowledge,nextActivityId:a.nextActivityId,canAdvance:canAdvance(step,s),beganAt:s.beganAt};
}

export async function learningSummary(env:Env,uid:number,languageCode?:string):Promise<LearningSummary> {
  const rows=(await env.DB.prepare('SELECT * FROM learning_sessions WHERE user_id=? ORDER BY updated_at DESC').bind(uid).all()).results.filter(row=>(!languageCode||row.language_code===languageCode)&&activity(row.activity_id,row.content_version));
  const events=(await env.DB.prepare("SELECT session_id,data,created_at FROM learning_events WHERE user_id=? AND kind='attempt' ORDER BY id").bind(uid).all()).results;
  const skills=rows.map(row=>{
    const s:State=JSON.parse(row.state),a=content(row),attempts=events.filter(e=>e.session_id===row.id).map(e=>JSON.parse(e.data));
    const independent=new Set(attempts.filter(e=>e.feedback?.independent).map(e=>e.feedback.semanticKey));
    return {languageCode:a.languageCode,id:a.id,title:a.title,seen:s.stepIndex>0||s.completed,recognized:attempts.some(e=>e.feedback?.evidence==='recognized'),supported:attempts.filter(e=>e.construction&&e.feedback?.correct&&e.feedback?.evidence==='supported').length,independentCombinations:independent.size,retrievedLater:attempts.some(e=>e.feedback?.evidence==='retrieved'),contextualReuse:attempts.some(e=>e.context&&e.feedback?.correct),appliedNewContext:attempts.some(e=>e.newContext&&e.feedback?.correct&&e.feedback?.evidence!=='supported'),completed:Boolean(s.completed||s.everCompleted||s.lastCompletedAt),dueAt:row.due_at};
  });
  const unfinished=rows.find(row=>!JSON.parse(row.state).completed);
  let resume:LearningSummary['resume']=unfinished?{id:unfinished.activity_id,title:content(unfinished).title,href:href(unfinished.activity_id,JSON.parse(unfinished.state).mode==='review'),updatedAt:unfinished.updated_at}:null;
  const draft=(await env.DB.prepare("SELECT lesson_id,updated_at FROM lesson_drafts WHERE user_id=? AND json_extract(data,'$.step')<3 ORDER BY updated_at DESC").bind(uid).all()).results.find(d=>!languageCode||d.lesson_id.startsWith(languageCode+'-'));
  if(draft&&(!resume||draft.updated_at>resume.updatedAt)){const l=lesson(draft.lesson_id);resume={id:l.lessonId,title:l.title,href:`/${l.languageCode}/lesson/${l.orderIndex}${l.lessonId==='de-lesson01'?'?notes=1':''}`,updatedAt:draft.updated_at};}
  return {activities:activities.filter(a=>!languageCode||a.languageCode===languageCode).map(a=>({languageCode:a.languageCode,id:a.id,title:a.title,outcome:a.outcome,linkedLessonId:a.linkedLessonId,prerequisites:a.prerequisites,href:href(a.id)})),resume,reviews:rows.filter(row=>row.due_at&&row.due_at<=now()).sort((a,b)=>Number(Boolean(JSON.parse(b.state).needsSupport))-Number(Boolean(JSON.parse(a.state).needsSupport))||a.due_at.localeCompare(b.due_at)).map(row=>({languageCode:row.language_code,id:row.activity_id,title:content(row).title,href:href(row.activity_id,true),dueAt:row.due_at})),skills};
}

export async function recordLearningSupport(env:Env,uid:number,languageCode:string,source:'notes'|'tutor',material?:string) {
  const keys=material?exposureKeysInText(languageCode,material):['*'];
  // Record delivery uncertainty before session creation as well as during a run.
  for(const key of keys)await saveExposure(env,uid,languageCode,key,source);

  const rows=(await env.DB.prepare('SELECT * FROM learning_sessions WHERE user_id=? AND language_code=?').bind(uid,languageCode).all()).results;
  for(const row of rows){const s:State=JSON.parse(row.state);if(s.completed||s.allAssisted)continue;s.allAssisted=true;s.struggledInRound=true;s.lastPracticeAt=now();const id=crypto.randomUUID();
    const results=await env.DB.batch([
      env.DB.prepare('UPDATE learning_sessions SET state=?,version=version+1,last_event_id=?,updated_at=? WHERE id=? AND user_id=? AND version=?').bind(JSON.stringify(s),id,now(),row.id,uid,row.version),
      env.DB.prepare("INSERT INTO learning_events (event_id,user_id,session_id,kind,data,created_at) SELECT ?,?,?,'support',?,? WHERE EXISTS (SELECT 1 FROM learning_sessions WHERE id=? AND user_id=? AND last_event_id=?)").bind(id,uid,row.id,JSON.stringify({source,stepIndex:s.stepIndex}),now(),row.id,uid,id)
    ]) as {meta:{changes:number}}[];
    if(!results[0].meta.changes)throw new HttpError(409,'Your starter changed in another tab. Please request this help again.');
  }
}

export async function learningRoute(request:Request,env:Env,user:Account):Promise<Response|null> {
  const url=new URL(request.url),path=url.pathname,db=env.DB,uid=user.id;
  if(path==='/api/learning/support'&&request.method==='POST'){const data=z.object({languageCode:z.string().regex(/^[a-z]{2}$/),source:z.enum(['notes','tutor']),lessonId:z.string().optional()}).strict().parse(await body(request));const material=data.lessonId?lesson(data.lessonId):null;if(material&&material.languageCode!==data.languageCode)throw new HttpError(400,'The language does not match these notes.');await recordLearningSupport(env,uid,data.languageCode,data.source,material?.content);return json({saved:true});}
  if(path==='/api/learning/summary'&&request.method==='GET')return json(await learningSummary(env,uid,url.searchParams.get('language')||undefined));
  if(path==='/api/learning/start'&&request.method==='POST') {
    const data=z.object({activityId:z.string(),mode:z.enum(['lesson','review']).default('lesson'),arrivalAt:z.string().datetime().optional(),previewSeen:z.boolean().optional(),contentVersion:z.string().optional(),visitId:z.string().uuid().optional(),previewActivities:z.array(z.string().max(100)).max(21).optional()}).strict().parse(await body(request));
    let a=activity(data.activityId,data.contentVersion);if(!a)throw new HttpError(404,'This starter activity is not available. All course lessons remain open.');
    let row=await db.prepare('SELECT * FROM learning_sessions WHERE user_id=? AND activity_id=?').bind(uid,a.id).first();
    if(row)a=content(row);
    if(row&&data.mode==='review'&&JSON.parse(row.state).completed) {
      const s:State=JSON.parse(row.state);
      const updated:State={...s,everCompleted:true,runId:crypto.randomUUID(),runActiveMs:0,beganAt:now(),firstIndependentAt:undefined,firstSuccessAt:undefined,reviewSet:s.reviewRound>=1?7:1,mode:'review',stepIndex:0,answer:'',completed:false,feedback:undefined,help:undefined,assistedSteps:[],allAssisted:false,independentInRound:0,reviewAnchor:s.lastPracticeAt||s.lastCompletedAt||s.beganAt,delayedInRound:false,struggledInRound:false,lexicalDelayedInRound:false,lexicalSuccessInRound:false};
      enter(updated,steps(a,updated)[0]);
      const replaced=await db.prepare('UPDATE learning_sessions SET state=?,version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=? RETURNING *').bind(JSON.stringify(updated),now(),row.id,uid,row.version).first();
      if(!replaced)throw new HttpError(409,'This session changed in another tab. Reopen it to continue.');row=replaced;
    }
    if(!row) {
      const beganAt=now();
      const arrivalAt=data.arrivalAt&&Date.parse(data.arrivalAt)<=Date.now()&&Date.parse(data.arrivalAt)>Date.now()-30*86400000?data.arrivalAt:beganAt;
      for(const previewId of data.previewActivities||[]){const preview=activity(previewId);if(!preview||preview.languageCode!==a.languageCode)continue;for(const step of preview.steps){for(const key of [...(step.exposures||[]),...(step.validation?[step.validation.key,...step.validation.accepted.map(v=>v.key||step.validation!.key)]:[])])await saveExposure(env,uid,a.languageCode||'de',key,'guest-practice');}}
      const priorExposures=(await db.prepare('SELECT material_key FROM learning_exposures WHERE user_id=? AND language_code=?').bind(uid,a.languageCode||'de').all()).results.map(x=>x.material_key);
      const s:State={runId:crypto.randomUUID(),runActiveMs:0,stepIndex:0,answer:'',mode:'lesson',completed:false,exposures:priorExposures.filter(x=>x!=='*'),assistedSteps:[],allAssisted:priorExposures.includes('*')||(Boolean(data.previewSeen)&&!data.previewActivities?.length),activeMs:0,priorKnowledge:'unknown',beganAt,arrivalAt,reviewRound:0,independentInRound:0};
      enter(s,a.steps[0]);
      if(data.previewSeen&&!data.previewActivities?.length){s.exposures.push('ich:Wasser::statement:plain');await saveExposure(env,uid,a.languageCode||'de','*','guest-practice');}
      row=await db.prepare('INSERT INTO learning_sessions (id,user_id,activity_id,language_code,content_version,state,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(user_id,activity_id) DO NOTHING RETURNING *').bind(crypto.randomUUID(),uid,a.id,a.languageCode||'de',a.version,JSON.stringify(s),beganAt).first();
      if(!row)row=await db.prepare('SELECT * FROM learning_sessions WHERE user_id=? AND activity_id=?').bind(uid,a.id).first();
    }
    return json(await view(env,uid,row));
  }
  let match=path.match(/^\/api\/learning\/sessions\/([^/]+)(\/event)?$/);
  if(match) {
    const row=await sessionRow(env,uid,match[1]);
    if(request.method==='GET'&&!match[2])return json(await view(env,uid,row));
    if(request.method==='POST'&&match[2]) {
      const data=schema.parse(await body(request)),a=content(row),s:State=JSON.parse(row.state),step=steps(a,s)[s.stepIndex];
      const replay=await db.prepare('SELECT session_id FROM learning_events WHERE user_id=? AND event_id=?').bind(uid,data.eventId).first();
      if(replay){if(replay.session_id!==row.id)throw new HttpError(409,'This save identifier belongs to a different activity.');return json(await view(env,uid,await sessionRow(env,uid,row.id)));}
      if(row.version!==data.version)throw new HttpError(409,'A newer draft is saved on another tab or device. Your text remains here. Load the saved version, then choose which text to keep.');
      const eventTime=now();
      const touched=new Set<string>();
      const delta=Math.min(data.activeDeltaMs||0,Math.max(0,Date.now()-Date.parse(row.updated_at)));
      s.activeMs+=delta;s.runActiveMs=(s.runActiveMs||0)+delta;
      if(data.answer!==undefined)s.answer=data.answer;
      const submittedAnswer=s.answer;
      let dueAt=row.due_at;let result:LearningFeedback|undefined;
      const ledger=(await db.prepare('SELECT material_key,seen_at FROM learning_exposures WHERE user_id=? AND language_code=?').bind(uid,a.languageCode||'de').all()).results;
      for(const e of ledger)if(e.material_key!=='*'&&!s.exposures.includes(e.material_key))s.exposures.push(e.material_key);
      const priorKeys=new Set(s.exposures.map(noveltyFamily));
      const assisted=()=>s.allAssisted||s.assistedSteps.includes(step.id)||step.independentEligible===false||ledger.some(e=>e.material_key==='*'&&e.seen_at>=s.beganAt);
      const markHelp=()=>{s.struggledInRound=true;if(!s.assistedSteps.includes(step.id))s.assistedSteps.push(step.id);};
      if(data.kind==='support') {s.allAssisted=true;markHelp();await saveExposure(env,uid,a.languageCode||'de','*',data.source||'external');}
      if(data.kind==='hint'||data.kind==='reveal') {
        if(!['construct','context','understand'].includes(step.kind))throw new HttpError(400,'This step already contains its explanation.');
        markHelp();
        const level=data.kind==='reveal'?99:Math.min((s.help?.level||0)+1,step.hints?.length||1);
        s.help={level,text:level===99?step.answer!:(step.hints?.[level-1]||'You can reveal a complete example whenever you need it.')};
        if(level===99){for(const key of step.validation?[step.validation.key,...recognizedKeys(a.languageCode||'de',step.answer||'')]:step.target?[semanticKey(step.target)]:[]){touched.add(key);if(!s.exposures.includes(key))s.exposures.push(key);}}
      }
      if(data.kind==='attempt') {
        if(!['construct','context','understand'].includes(step.kind)||!s.answer.trim())throw new HttpError(400,'Write an answer or choose a response first.');
        result=grade(step,s.answer);
        if(result.correct&&step.kind==='understand'&&assisted()){result.evidence='supported';result.message='That meaning fits with the help you used.';}
        if(result.correct&&step.kind!=='understand') {
          const key=result.semanticKey!,novel=!priorKeys.has(noveltyFamily(key));
          const seen=ledger.filter(e=>noveltyFamily(e.material_key)===noveltyFamily(key)).map(e=>e.seen_at).sort().at(-1);
          const anchor=[s.reviewAnchor,seen].filter(Boolean).sort().at(-1);
          const later=s.mode==='review'&&Boolean(anchor)&&Date.now()-Date.parse(anchor!)>=86400000;
          result.independent=!assisted()&&novel&&step.kind==='construct'&&step.responseMode!=='word';
          result.evidence=assisted()?'supported':later?'retrieved':result.independent?'independent':'reused';
          result.message=result.evidence==='independent'?'You made a new sentence without a hint.':result.evidence==='retrieved'?'You retrieved this pattern in a later session without help.':result.evidence==='supported'?'That sentence works with support. Try the next combination with the examples put away.':'You brought back a sentence using this pattern.';
          if(step.responseMode==='word'){
            result.independent=false;
            result.evidence=assisted()?'supported':later?'word-retrieved':'word-recalled';
            result.message=assisted()?'You recalled the word with support. Now try it in a sentence.':later?'You recalled this word on a later visit without opening help.':'You brought back the word. Now use it in its lesson pattern.';
            if(!assisted())s.lexicalSuccessInRound=true;
            if(later&&!assisted())s.lexicalDelayedInRound=true;
          }
          if(!s.firstSuccessAt)s.firstSuccessAt=eventTime;
          if(result.independent&&!s.firstIndependentAt)s.firstIndependentAt=eventTime;
          if(!assisted())s.independentInRound++;
          if(later&&!assisted()&&step.responseMode!=='word')s.delayedInRound=true;
          if(!s.exposures.includes(key))s.exposures.push(key);touched.add(key);
        }
        s.feedback=result;
        for(const key of recognizedKeys(a.languageCode||'de',s.answer)){touched.add(key);if(!s.exposures.includes(key))s.exposures.push(key);}
        if(!result.correct&&result.category!=='unrecognized')markHelp(); // A diagnostic correction is assistance, too.
      }
      if(data.kind==='advance') {
        if(!canAdvance(step,s))throw new HttpError(400,'Try this task or reveal an example before continuing.');
        if(step.kind==='prior') {
          const known=recognizedKeys(a.languageCode||'de',s.answer);
          const legacy=a.languageCode==='de'&&a.version==='1.0.0'&&s.answer.trim()&&grade({id:'prior',kind:'construct',title:'',text:'',target:{subject:'ich',drink:'Wasser'}},s.answer).correct;
          s.priorKnowledge=!s.answer.trim()?'beginner':known.length||legacy?'demonstrated-before-teaching':'some-or-uncertain';
          s.exposures.push(...known);known.forEach(key=>touched.add(key));if(legacy)s.exposures.push('ich:Wasser::statement:plain');
        }
        if(step.kind==='finish') {
          if(s.completed)return json(await view(env,uid,row));
          s.completed=true;s.everCompleted=true;
          s.needsSupport=Boolean(s.struggledInRound)||s.independentInRound===0||(a.category==='word-practice'&&!s.lexicalSuccessInRound);
          const retrieved=s.delayedInRound&&(a.category!=='word-practice'||s.lexicalDelayedInRound);
          if(s.mode==='review'&&retrieved&&!s.needsSupport)s.reviewRound++;
          const days=s.mode==='review'&&retrieved&&!s.needsSupport?[3,7,14][Math.min(Math.max(0,s.reviewRound-1),2)]:1;
          dueAt=new Date(Date.now()+days*86400000).toISOString();
          s.lastCompletedAt=eventTime;
        } else {
          s.stepIndex++;s.answer='';s.feedback=undefined;s.help=undefined;enter(s,steps(a,s)[s.stepIndex]);for(const key of steps(a,s)[s.stepIndex].exposures||[])touched.add(key);
        }
      }
      if(['attempt','hint','reveal','support','advance'].includes(data.kind))s.lastPracticeAt=eventTime;
      const event={runId:s.runId,runActiveMs:s.runActiveMs,languageCode:a.languageCode,modality:result?.modality||'typed',stepId:step.id,contentVersion:a.version,checkerVersion:'2026-09-11',responseMode:step.responseMode,targetSenseId:a.targetSenseId,targetSenseIds:result?.correct&&step.responseMode!=='word'?words.filter(w=>w.language===a.languageCode&&wordMatches(w,submittedAnswer)).map(w=>w.senseId):undefined,answer:['attempt','advance'].includes(data.kind)?submittedAnswer:undefined,feedback:result,help:data.kind==='hint'||data.kind==='reveal'?s.help:undefined,source:data.source,activeDeltaMs:delta,construction:['construct','context'].includes(step.kind)&&step.responseMode!=='word',context:step.kind==='context',newContext:Boolean(step.newContext),priorKnowledge:s.priorKnowledge,firstIndependentAt:s.firstIndependentAt,arrivalAt:s.arrivalAt,beganAt:s.beganAt,activeMs:s.activeMs};
      const changes=await db.batch([
        db.prepare('UPDATE learning_sessions SET state=?,version=version+1,last_event_id=?,updated_at=?,due_at=? WHERE id=? AND user_id=? AND version=?').bind(JSON.stringify(s),data.eventId,eventTime,dueAt,row.id,uid,data.version),
        db.prepare('INSERT INTO learning_events (event_id,user_id,session_id,kind,data,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM learning_sessions WHERE id=? AND user_id=? AND version=? AND last_event_id=?) ON CONFLICT(user_id,event_id) DO NOTHING').bind(data.eventId,uid,row.id,data.kind,JSON.stringify(event),eventTime,row.id,uid,data.version+1,data.eventId)
        ,...[...touched].map(key=>db.prepare('INSERT INTO learning_exposures (user_id,language_code,material_key,source,seen_at) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM learning_sessions WHERE id=? AND user_id=? AND last_event_id=?) ON CONFLICT(user_id,language_code,material_key) DO UPDATE SET seen_at=excluded.seen_at').bind(uid,a.languageCode||'de',key,'lesson',eventTime,row.id,uid,data.eventId))
      ]) as {meta:{changes:number}}[];
      if(!changes[0].meta.changes) {
        const saved=await db.prepare('SELECT session_id FROM learning_events WHERE user_id=? AND event_id=?').bind(uid,data.eventId).first();
        if(!saved)throw new HttpError(409,'Your learning changed in another tab. Your local text is still available. Reload the saved draft before continuing.');
      }
      return json(await view(env,uid,await sessionRow(env,uid,row.id)));
    }
  }
  match=path.match(/^\/api\/learning\/drafts\/([^/]+)$/);
  if(match) {
    const id=decodeURIComponent(match[1]);lesson(id);
    const read=()=>db.prepare('SELECT * FROM lesson_drafts WHERE user_id=? AND lesson_id=?').bind(uid,id).first();
    if(request.method==='GET'){const row=await read();return json(row?{data:JSON.parse(row.data),version:row.version,updatedAt:row.updated_at}:{data:null,version:-1});}
    if(request.method==='PUT') {
      const data=z.object({requestId:z.string().uuid().optional(),version:z.number().int().min(-1),data:z.object({step:z.number().int().min(0).max(20),answer:z.string().max(6000),meaning:z.string().max(2000).optional(),reviewAnswer:z.string().max(6000).optional(),confidence:z.string().max(30).optional()}).strict()}).strict().parse(await body(request));
      const requestId=data.requestId||crypto.randomUUID(),resource=`draft:${id}`;
      const replay=await db.prepare('SELECT resource FROM learning_requests WHERE user_id=? AND request_id=?').bind(uid,requestId).first();
      if(replay){if(replay.resource!==resource)throw new HttpError(409,'This save belongs to another activity.');const saved=await read();return json({data:JSON.parse(saved!.data),version:saved!.version,updatedAt:saved!.updated_at});}
      const stamp=now();
      const changes=await db.batch([
       data.version===-1?db.prepare('INSERT INTO lesson_drafts (user_id,lesson_id,data,updated_at,last_request_id) VALUES (?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO NOTHING').bind(uid,id,JSON.stringify(data.data),stamp,requestId):db.prepare('UPDATE lesson_drafts SET data=?,version=version+1,updated_at=?,last_request_id=? WHERE user_id=? AND lesson_id=? AND version=?').bind(JSON.stringify(data.data),stamp,requestId,uid,id,data.version),
       db.prepare("INSERT INTO learning_requests (user_id,request_id,resource,status,created_at) SELECT ?,?,?,'succeeded',? WHERE EXISTS (SELECT 1 FROM lesson_drafts WHERE user_id=? AND lesson_id=? AND last_request_id=?) ON CONFLICT(user_id,request_id) DO NOTHING").bind(uid,requestId,resource,stamp,uid,id,requestId)
      ]) as {meta:{changes:number}}[];
      if(!changes[0].meta.changes){const saved=await db.prepare('SELECT resource FROM learning_requests WHERE user_id=? AND request_id=?').bind(uid,requestId).first();if(!saved)throw new HttpError(409,'A newer draft exists. Keep your text here and load the saved version before replacing it.');}
      const row=(await read())!;
      return json({data:JSON.parse(row.data),version:row.version,updatedAt:row.updated_at});
    }
  }
  return null;
}


export function exposureKeysInText(languageCode:string,material:string):string[]{
 const n=normalizeAnswer(material,languageCode),keys=new Set<string>();
 for(const a of activities.filter(a=>a.languageCode===languageCode))for(const step of [...a.steps,...a.review,...(a.review7||[])]){
  for(const v of step.validation?.accepted||[])if(n.includes(normalizeAnswer(v.text,languageCode)))keys.add(v.key||step.validation!.key);
  for(const example of step.examples||[])if(n.includes(normalizeAnswer(example.sentence,languageCode)))for(const k of step.exposures||[])keys.add(k);
 }
 return [...keys];
}
export async function saveExposure(env:Env,uid:number,code:string,key:string,source:string){
 await env.DB.prepare('INSERT INTO learning_exposures (user_id,language_code,material_key,source,seen_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id,language_code,material_key) DO UPDATE SET seen_at=excluded.seen_at,source=excluded.source').bind(uid,code,key,source,now()).run();
}

// Topic-explicit and contextually short Japanese noun sentences share one novelty family.
function noveltyFamily(key:string){return /^ja\|(is|question|not)\|/.test(key)?key.split('|').slice(0,3).join('|'):key;}
