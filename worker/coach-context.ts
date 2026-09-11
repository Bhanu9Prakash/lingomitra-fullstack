import type { Env } from './types';
import { activity, publicStep } from './learning-content';
export async function coachContext(env:Env,uid:number,lessonId?:string,languageCode?:string) {
  const rows=(await env.DB.prepare('SELECT activity_id,content_version,language_code,state FROM learning_sessions WHERE user_id=? ORDER BY updated_at DESC').bind(uid).all()).results;
  const row=rows.find(row=>(!languageCode||row.language_code===languageCode)&&(!lessonId||activity(row.activity_id,row.content_version)?.linkedLessonId===lessonId));
  if(!row)return null;
  const a=activity(row.activity_id,row.content_version);if(!a)return null;
  const s=JSON.parse(row.state),exposed=a.steps.slice(0,s.mode==='review'?a.steps.length:s.stepIndex+1).filter(step=>step.kind==='teach').map(publicStep);
  return {activityId:a.id,title:a.title,exposed};
}
