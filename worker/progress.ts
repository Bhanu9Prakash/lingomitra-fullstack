import { z } from "zod";
import { body, json, now, HttpError, record } from "./core";
import { lesson, language, languages, lessons } from "./catalog";
import type { Env, Account } from "./types";
const completedActivities = ["predict", "practice-1", "practice-2", "practice-3", "transfer", "reflect"] as const;

const learningNotesSchema = z.object({
  version: z.literal(1),
  attempts: z.number().int().min(1).max(100),
  correct: z.number().int().min(0).max(100),
  confidence: z.enum(["again", "soon", "got-it"]),
  weakConcepts: z.array(z.string().trim().min(1).max(180)).max(5),
  completedActivities: z.array(z.enum(completedActivities)),
  review: z.object({
    dueAt: z.string().datetime(),
    concept: z.string().trim().min(1).max(180),
    prompt: z.string().trim().min(1).max(500),
    cue: z.string().trim().min(1).max(700),
    lastRating: z.enum(["again", "soon", "got-it"]).optional(),
    lastAnswer:z.string().max(6000).optional(),
  }),
});
const selfPracticeNotesSchema=learningNotesSchema.extend({version:z.literal(2),mode:z.literal('self-practice'),correct:z.null(),completedActivities:z.array(z.literal('practice'))});

const progressUpdateSchema = z.object({
  completed: z.boolean().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  score: z.number().int().min(0).max(100).nullable().optional(),
  timeSpent: z.number().int().min(0).max(8 * 60 * 60).optional(),
  notes: z.string().max(16000).optional(),
}).strict();

const reviewRatingSchema = z.object({
  answer:z.string().trim().max(6000).optional(),
  rating: z.enum(["again", "soon", "got-it"]),
});

function parseLearningNotes(notes: string | null) {
  if (!notes) return null;
  try {
    return z.union([learningNotesSchema,selfPracticeNotesSchema]).parse(JSON.parse(notes));
  } catch {
    return null;
  }
}

export async function progressRoute(request:Request,env:Env,user:Account):Promise<Response|null> {
  const url=new URL(request.url),path=url.pathname,db=env.DB,uid=user.id;
  if(path==='/api/progress/overview'&&request.method==='GET'){
    const rows=(await db.prepare('SELECT * FROM user_progress WHERE user_id=?').bind(uid).all()).results.map(record);
    const drafts=(await db.prepare('SELECT lesson_id FROM lesson_drafts WHERE user_id=?').bind(uid).all()).results;
    const starter=(await db.prepare('SELECT language_code FROM learning_sessions WHERE user_id=?').bind(uid).all()).results;
    return json({courses:languages.map(l=>{const courseLessons=lessons.filter(x=>x.languageCode===l.code),progress=rows.filter(x=>x.lessonId.startsWith(l.code+'-')),completed=progress.filter(x=>x.completed).length;return {languageCode:l.code,total:courseLessons.length,completed,percent:Math.round(completed/courseLessons.length*100),progress,lessons:courseLessons.map(x=>({...x,content:''})),hasStarted:progress.length>0||drafts.some(x=>x.lesson_id.startsWith(l.code+'-'))||starter.some(x=>x.language_code===l.code)};})});
  }
  const read=async(id:string)=>{const row=await db.prepare('SELECT * FROM user_progress WHERE user_id=? AND lesson_id=?').bind(uid,id).first();return row?{...record(row),version:row.version}:null;};
  const list=async(code:string)=>{language(code);return (await db.prepare('SELECT * FROM user_progress WHERE user_id=? AND language_code=?').bind(uid,code).all()).results.map(record);};
  let match=path.match(/^\/api\/progress\/lesson\/([^/]+)(\/complete)?$/);
  if(match){
    const id=decodeURIComponent(match[1]);const currentLesson=lesson(id);
    if(request.method==='GET'){const existing=await read(id);if(!existing)throw new HttpError(404,'Progress not found.');return json(existing);}
    if(request.method==='POST'){
      if(match[2])throw new HttpError(400,'Complete the learning activity to finish this lesson.');
      const data=progressUpdateSchema.parse(await body(request));const notes=data.notes?parseLearningNotes(data.notes):null;
      if(data.notes&&!notes)throw new HttpError(400,'The learning review is invalid.');
      if(notes?.version===2&&data.score!==null)throw new HttpError(400,'Self-practice does not receive a correctness score.');
      if(data.completed&&(!notes||!(notes.version===2?notes.completedActivities.includes('practice'):completedActivities.every(a=>notes.completedActivities.includes(a)))||data.progress!==100||data.score===undefined||data.timeSpent===undefined))throw new HttpError(400,'Save a practice attempt before completing this lesson.');
      const previous=await read(id);const updated={completed:false,completedAt:null,progress:0,score:null,timeSpent:0,notes:null,...previous,...data,lastAccessedAt:now()};
      updated.timeSpent=Math.max(previous?.timeSpent||0,data.timeSpent||0);
      if(previous?.completed||data.completed){updated.completed=true;updated.progress=100;updated.completedAt=previous?.completedAt||now();}
      delete updated.id;delete updated.userId;delete updated.version;
      const content=JSON.stringify({...updated,lessonId:id});
      const row=previous?await db.prepare('UPDATE user_progress SET data=?,version=version+1 WHERE id=? AND user_id=? AND lesson_id=? AND version=? RETURNING *').bind(content,previous.id,uid,id,previous.version).first():await db.prepare('INSERT INTO user_progress (user_id,lesson_id,language_code,data) VALUES (?,?,?,?) ON CONFLICT(user_id,lesson_id) DO NOTHING RETURNING *').bind(uid,id,currentLesson.languageCode,content).first();
      if(!row)throw new HttpError(409,'Your learning changed in another tab. Please retry saving.');
      return json(record(row));
    }
  }
  match=path.match(/^\/api\/progress\/language\/([^/]+)(\/reset)?$/);
  if(match){const code=match[1];language(code);if(request.method==='GET'&&!match[2])return json(await list(code));
    if(request.method==='DELETE'&&match[2]){await db.batch([db.prepare('DELETE FROM learning_exposures WHERE user_id=? AND language_code=?').bind(uid,code),db.prepare('DELETE FROM learning_requests WHERE user_id=? AND resource LIKE ?').bind(uid,'%:'+code+'-%'),db.prepare('DELETE FROM user_progress WHERE user_id=? AND language_code=?').bind(uid,code),db.prepare('DELETE FROM chat_history WHERE user_id=? AND lesson_id LIKE ?').bind(uid,code+'-lesson%'),db.prepare('DELETE FROM learning_sessions WHERE user_id=? AND language_code=?').bind(uid,code),db.prepare('DELETE FROM lesson_drafts WHERE user_id=? AND lesson_id LIKE ?').bind(uid,code+'-lesson%')]);return json({message:'Progress reset.'});}}
  if(path==='/api/progress/review/due'&&request.method==='GET'){
    const records=await list(url.searchParams.get('language')||'');
    const items=records.flatMap(r=>{const notes=parseLearningNotes(r.notes);return !r.completed||!notes||new Date(notes.review.dueAt)>new Date()?[]:[{lessonId:r.lessonId,...notes.review,confidence:notes.confidence}];}).sort((a,b)=>a.dueAt.localeCompare(b.dueAt));return json({items});
  }
  match=path.match(/^\/api\/progress\/review\/lesson\/([^/]+)$/);
  if(match&&request.method==='POST'){
    const {rating,answer}=reviewRatingSchema.parse(await body(request));const existing=await read(match[1]);const notes=existing?parseLearningNotes(existing.notes):null;
    if(!existing||!notes)throw new HttpError(404,'No saved review item was found.');
    const dueAt=new Date(Date.now()+{again:1,soon:3,'got-it':14}[rating]*86400000).toISOString();
    const updated={...existing,notes:JSON.stringify({...notes,confidence:rating,review:{...notes.review,dueAt,lastRating:rating,...(answer?{lastAnswer:answer}:{})}}),lastAccessedAt:now()};
    const changed=await db.prepare('UPDATE user_progress SET data=?,version=version+1 WHERE id=? AND user_id=? AND lesson_id=? AND version=?').bind(JSON.stringify(updated),existing.id,uid,match[1],existing.version).run();if(!changed.meta.changes)throw new HttpError(409,'This review changed in another tab. Please retry.');return json({progress:updated,nextReviewAt:dueAt});
  }
  return null;
}
