import { z } from 'zod';
import { body,HttpError,json,now } from './core';
import { lesson } from './catalog';
import type { Env,Account } from './types';
const draftSchema=z.object({step:z.number().int().min(0).max(3),answer:z.string().max(6000),meaning:z.string().max(2000).optional(),reviewAnswer:z.string().max(6000).optional(),confidence:z.enum(['again','soon','got-it']).optional()}).strict();
export async function practiceRoute(request:Request,env:Env,user:Account):Promise<Response|null>{
 const match=new URL(request.url).pathname.match(/^\/api\/learning\/finish\/([^/]+)$/);if(!match||request.method!=='POST')return null;
 const id=decodeURIComponent(match[1]),l=lesson(id),uid=user.id,db=env.DB;
 const d=z.object({requestId:z.string().uuid(),version:z.number().int().min(-1),data:draftSchema,timeSpent:z.number().int().min(0).max(28800)}).strict().parse(await body(request));
 if(!d.data.answer.trim())throw new HttpError(400,'Keep a practice attempt before finishing.');
 const resource=`finish:${id}`,existing=await db.prepare('SELECT resource FROM learning_requests WHERE user_id=? AND request_id=?').bind(uid,d.requestId).first();
 const read=async()=>{const r=await db.prepare('SELECT data,version FROM lesson_drafts WHERE user_id=? AND lesson_id=?').bind(uid,id).first();return {data:r?JSON.parse(r.data):null,version:r?.version??-1};};
 if(existing){if(existing.resource!==resource)throw new HttpError(409,'This save belongs to another lesson.');return json(await read());}
 const stamp=now(),draft=JSON.stringify({...d.data,step:3});
 const notes={version:2,mode:'self-practice',attempts:1,correct:null,confidence:d.data.confidence||'soon',weakConcepts:[],completedActivities:['practice'],review:{dueAt:new Date(Date.now()+86400000).toISOString(),concept:l.title.slice(0,180),prompt:'Put the notes away. Rebuild a sentence using the words and forms you met in this lesson.',cue:'Open the original course notes for an example. This is self-practice, not an automatic language assessment.'}};
 const progress=JSON.stringify({lessonId:id,completed:true,completedAt:stamp,lastAccessedAt:stamp,progress:100,score:null,timeSpent:d.timeSpent,notes:JSON.stringify(notes)});
 const guard='EXISTS (SELECT 1 FROM lesson_drafts WHERE user_id=? AND lesson_id=? AND last_request_id=?)';
 const changes=await db.batch([
  d.version===-1?db.prepare('INSERT INTO lesson_drafts (user_id,lesson_id,data,updated_at,last_request_id) VALUES (?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO NOTHING').bind(uid,id,draft,stamp,d.requestId):db.prepare('UPDATE lesson_drafts SET data=?,updated_at=?,last_request_id=?,version=version+1 WHERE user_id=? AND lesson_id=? AND version=?').bind(draft,stamp,d.requestId,uid,id,d.version),
  db.prepare(`INSERT INTO user_progress (user_id,lesson_id,language_code,data) SELECT ?,?,?,? WHERE ${guard} ON CONFLICT(user_id,lesson_id) DO UPDATE SET data=json_set(excluded.data,'$.completedAt',COALESCE(json_extract(user_progress.data,'$.completedAt'),json_extract(excluded.data,'$.completedAt')),'$.timeSpent',MAX(COALESCE(json_extract(user_progress.data,'$.timeSpent'),0),json_extract(excluded.data,'$.timeSpent'))),version=user_progress.version+1`).bind(uid,id,l.languageCode,progress,uid,id,d.requestId),
  db.prepare(`INSERT INTO learning_requests (user_id,request_id,resource,status,created_at) SELECT ?,?,?,'succeeded',? WHERE ${guard} ON CONFLICT(user_id,request_id) DO NOTHING`).bind(uid,d.requestId,resource,stamp,uid,id,d.requestId)
 ]) as {meta:{changes:number}}[];
 if(!changes[0].meta.changes){const saved=await db.prepare('SELECT resource FROM learning_requests WHERE user_id=? AND request_id=?').bind(uid,d.requestId).first();if(!saved)throw new HttpError(409,'This practice changed on another tab or device. Keep your text and load the saved version.');}
 return json(await read());
}
