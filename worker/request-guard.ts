import type { Env } from './types';
import { HttpError,now } from './core';
export async function once<T>(env:Env,uid:number,id:string|undefined,resource:string,payload:unknown,work:()=>Promise<T>):Promise<T>{
 if(!id)return work(); // Backward compatibility for previously deployed clients.
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const scoped=`${resource}:${hash}`;
 const read=()=>env.DB.prepare('SELECT resource,status,response FROM learning_requests WHERE user_id=? AND request_id=?').bind(uid,id).first();
 const replay=(r:any):T=>{if(r.resource!==scoped)throw new HttpError(409,'This request identifier belongs to a different message. Reload the saved conversation before sending a new message.');if(r.status==='running')throw new HttpError(409,'This message is still being processed, or its outcome is uncertain. Reload the conversation before sending another message.');const result=JSON.parse(r.response||'null');if(r.status==='failed')throw new HttpError(result?.status||503,result?.message||'This request did not complete. Reload the conversation before trying a new message.');return result;};
 const previous=await read();if(previous)return replay(previous);
 const changed=await env.DB.prepare("INSERT INTO learning_requests (user_id,request_id,resource,status,created_at) VALUES (?,?,?,'running',?) ON CONFLICT(user_id,request_id) DO NOTHING").bind(uid,id,scoped,now()).run();
 if(!changed.meta.changes)return replay(await read());
 try{const result=await work();await env.DB.prepare("UPDATE learning_requests SET status='succeeded',response=? WHERE user_id=? AND request_id=?").bind(JSON.stringify(result),uid,id).run();return result;}
 catch(e){const error=e instanceof HttpError?e:new HttpError(503,'This request could not finish. Reload the conversation to check its saved state.');await env.DB.prepare("UPDATE learning_requests SET status='failed',response=? WHERE user_id=? AND request_id=?").bind(JSON.stringify({status:error.status,message:error.message}),uid,id).run();throw error;}
}
