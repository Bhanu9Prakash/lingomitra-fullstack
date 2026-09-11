import { once } from './request-guard';
import { z } from 'zod';
import { body, json, now, HttpError, record, safeInteger } from './core';
import { language } from './catalog';
import { reply, transcribe } from './ai';
import type { Env, Account, Message } from './types';
import { coachContext } from './coach-context';
import { recordLearningSupport } from './learning';
export const scenarios:Record<string,string[]>={
 restaurant:['Order a meal. The tutor is your waiter.','Order a drink and a pastry at a cafe.'],
 travel:['Check in at an airport. The tutor is the check-in agent.','Book a hotel room. The tutor is the receptionist.','Ask a local for directions.'],
 shopping:['Ask a sales assistant about clothes.','Ask about groceries at a store.'],
 business:['Practice a job interview. The tutor is the interviewer.','Explain a project to a colleague.'],
 daily:['Make small talk with a neighbor.','Tell a friend about your weekend.'],
 medical:['Practice describing a symptom at a clinic. This is language roleplay, not medical advice.','Ask a pharmacist where to find an item.']
};
export async function conversationRoute(request:Request,env:Env,user:Account):Promise<Response|null>{
 const url=new URL(request.url),path=url.pathname,db=env.DB,uid=user.id;
 if(path==='/api/conversation/topics'&&request.method==='GET')return json({topics:Object.entries(scenarios).map(([id,list])=>({id,name:id[0].toUpperCase()+id.slice(1),scenarios:list.length}))});
 if(path==='/api/conversation/sessions'){
  if(request.method==='GET'){const code=url.searchParams.get('languageCode');const rows=code?await db.prepare('SELECT * FROM conversation_sessions WHERE user_id=? AND language_code=? ORDER BY id DESC LIMIT 100').bind(uid,code).all():await db.prepare('SELECT * FROM conversation_sessions WHERE user_id=? ORDER BY id DESC LIMIT 100').bind(uid).all();return json({sessions:rows.results.map(record)});}
  if(request.method==='POST'){const data=z.object({languageCode:z.string().max(5),topic:z.string().max(30),difficultyLevel:z.enum(['beginner','intermediate','advanced']).default('beginner')}).strict().parse(await body(request));language(data.languageCode);const choices=scenarios[data.topic];if(!choices)throw new HttpError(400,'Choose a supported conversation topic.');const content={...data,scenario:choices[Math.floor(Math.random()*choices.length)],messages:[],duration:0,status:'active',score:null,feedback:null,createdAt:now(),updatedAt:now(),completedAt:null};const row=await db.prepare('INSERT INTO conversation_sessions (user_id,language_code,data) VALUES (?,?,?) RETURNING *').bind(uid,data.languageCode,JSON.stringify(content)).first();return json({session:record(row)},201);}
 }
 const match=path.match(/^\/api\/conversation\/sessions\/(\d+)(\/(message|complete))?$/);
 if(!match)return null;const id=safeInteger(match[1]);const row=await db.prepare('SELECT * FROM conversation_sessions WHERE id=? AND user_id=?').bind(id,uid).first();
 if(!row)throw new HttpError(404,'Conversation session not found.');const session=record(row);
 if(request.method==='GET'&&!match[2])return json({session});
 if(request.method==='POST'&&match[3]==='complete'){
  const turns=session.messages.filter((m:Message)=>m.role==='user').length;const updated={...session,status:'completed',completedAt:session.completedAt||now(),updatedAt:now(),score:null,feedback:turns?`You practiced ${turns} learner turn${turns===1?'':'s'} in this ${session.topic} context. Try one follow-up question next time.`:'Practice saved. Next time, try one short opening sentence.'};
  const changed=await db.prepare('UPDATE conversation_sessions SET data=?,version=version+1 WHERE id=? AND user_id=? AND version=?').bind(JSON.stringify(updated),id,uid,row.version).run();if(!changed.meta.changes)throw new HttpError(409,'This conversation changed. Reload before finishing.');return json({session:updated});
 }
 if(request.method==='POST'&&match[3]==='message'){
  if(session.status!=='active')throw new HttpError(400,'This conversation is already complete. Start a new practice.');
  const data=z.object({requestId:z.string().uuid().optional(),message:z.string().trim().min(1).max(2000).optional(),audioData:z.string().max(14_000_000).optional(),audioMimeType:z.string().max(80).optional()}).strict().parse(await body(request,14_100_000));let message=data.message;
  if(!message&&data.audioData)throw new HttpError(400,'Transcribe the recording first, check the text, then send the confirmed message.');
  if(!message)throw new HttpError(400,'Send a message or a recording.');
  return json(await once(env,uid,data.requestId,`conversation:${session.languageCode}-${id}`,{message},async()=>{
  await recordLearningSupport(env,uid,session.languageCode,'tutor');
  const scope=await coachContext(env,uid,undefined,session.languageCode);
  const messages:Message[]=[...session.messages,{role:'user',content:message}];const response=await reply(env,`You are a language roleplay partner in ${language(session.languageCode).name}. Scenario: ${session.scenario}. Level: ${session.difficultyLevel}. Use short natural replies, explain corrections in English, and ask one follow-up. ${scope?'Use the exposed words and structures for learner prompts: '+JSON.stringify(scope):'The learner may be a complete beginner. Establish what words they know before inviting a sentence.'} If the scenario needs new material, introduce no more than one new item, with an English meaning and example, before asking the learner to use it. This is unassessed language practice. A typed or transcribed message is not a validated pronunciation assessment. Never give medical, legal or financial advice.`,messages,uid,session.languageCode);
  const updated={...session,messages:[...messages,{role:'assistant',content:response}].slice(-100),duration:session.duration,updatedAt:now()};const changed=await db.prepare('UPDATE conversation_sessions SET data=?,version=version+1 WHERE id=? AND user_id=? AND version=?').bind(JSON.stringify(updated),id,uid,row.version).run();if(!changed.meta.changes)throw new HttpError(409,'This conversation changed in another tab. Reload before sending again.');
  await recordLearningSupport(env,uid,session.languageCode,'tutor',response);
  return {userMessage:message,aiResponse:response,messages:updated.messages,audioData:null};
  }));
 }
 return null;
}
