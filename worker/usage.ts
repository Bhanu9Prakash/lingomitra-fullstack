import { HttpError, now } from './core';
import type { Env } from './types';
export const dailyLimits={chat:20,transcription:5,speech:10};
export async function reserveUse(env:Env,uid:number,kind:keyof typeof dailyLimits) {
  const configured=Number(env.OPTIONAL_AI_DAILY_GLOBAL_LIMIT||1000);
  const globalLimit=Number.isFinite(configured)?Math.max(0,Math.floor(configured)):1000,day=now().slice(0,10);
  const row=await env.DB.prepare('INSERT INTO ai_usage (user_id,day,kind,used) SELECT ?,?,?,1 WHERE (SELECT COALESCE(SUM(used),0) FROM ai_usage WHERE day=? AND kind IN (?,?,?))<? ON CONFLICT(user_id,day,kind) DO UPDATE SET used=used+1 WHERE used<? RETURNING used').bind(uid,day,kind,day,'chat','transcription','speech',globalLimit,dailyLimits[kind]).first();
  if(!row){const total=await env.DB.prepare("SELECT COALESCE(SUM(used),0) AS n FROM ai_usage WHERE day=? AND kind IN ('chat','transcription','speech')").bind(day).first();if(total!.n>=globalLimit)throw new HttpError(429,'Cloud practice is unavailable for today. Continue with the lesson, type your answer, or use a device voice. All lessons and authored help stay free.');}
  if(!row)throw new HttpError(429,`Today’s optional ${kind==='chat'?'AI coaching':kind==='transcription'?'voice clip':'cloud playback'} allowance is used. It resets at midnight UTC. All lessons, authored hints and typed practice stay available; no payment is needed.`);
}
export async function countTokens(env:Env,uid:number,input:number,output:number,scope?:string) {
  const metrics=[['input-tokens',input],['output-tokens',output],...(scope?[[`input-tokens:${scope}`,input],[`output-tokens:${scope}`,output]]:[])] as [string,number][];
  await env.DB.batch(metrics.map(([kind,count])=>env.DB.prepare('INSERT INTO ai_usage (user_id,day,kind,used) VALUES (?,?,?,?) ON CONFLICT(user_id,day,kind) DO UPDATE SET used=used+excluded.used').bind(uid,now().slice(0,10),kind,Number.isFinite(count)?Math.max(0,Math.round(count)):0)));
}
