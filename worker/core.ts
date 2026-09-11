import type { Env, Account } from './types';

export class HttpError extends Error { constructor(public status:number,message:string) { super(message); } }
export const json = (value:unknown,status=200) => new Response(JSON.stringify(value), { status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'private, no-store','vary':'Cookie','x-content-type-options':'nosniff'} });
export const now = () => new Date().toISOString();
export function requireDb(env:Env) { if(!env.DB) throw new HttpError(503,'Saved learning is temporarily unavailable. Please try again.'); return env.DB; }
export async function body(request:Request,limit=100_000):Promise<any> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415,'Send JSON for this request.');
  if (Number(request.headers.get('content-length') || 0)>limit) throw new HttpError(413,'The request is too large.');
  const reader=request.body?.getReader(); if(!reader) throw new HttpError(400,'A request body is required.');
  const chunks:Uint8Array[]=[]; let length=0;
  while(true) { const {done,value}=await reader.read(); if(done)break; length+=value.byteLength; if(length>limit){await reader.cancel();throw new HttpError(413,'The request is too large.');} chunks.push(value); }
  const bytes=new Uint8Array(length); let offset=0; for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try { const result=JSON.parse(new TextDecoder().decode(bytes)); if(!result || Array.isArray(result) || typeof result!=='object')throw new Error(); return result; } catch { throw new HttpError(400,'Invalid JSON request.'); }
}
export function checkOrigin(request:Request) {
  if(['GET','HEAD','OPTIONS'].includes(request.method))return;
  const origin=request.headers.get('origin');
  if(request.headers.get('sec-fetch-site')==='cross-site'||(origin && origin!==new URL(request.url).origin))throw new HttpError(403,'Use LingoMitra to make this change.');
}
export async function audioForm(request:Request) {
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'A recording is required.');
  const parts:Uint8Array[]=[];let size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>2.1*1024*1024){await reader.cancel();throw new HttpError(413,'Record a shorter clip, or type your message.');}parts.push(chunk.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  try{return await new Response(bytes,{headers:{'content-type':request.headers.get('content-type')||''}}).formData();}catch{throw new HttpError(400,'This recording could not be read. Please try again or type.');}
}
export function accountFromRow(row:any,env:Env):Account {
  const allowed=(env.ADMIN_CHATGPT_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
  return {id:row.id,chatgptId:row.chatgpt_id,username:row.display_name,email:row.email,firstName:row.display_name,lastName:'',profilePicture:null,isAdmin:Boolean(row.is_admin)||allowed.includes(row.chatgpt_id),emailVerified:true,ttsEnabled:Boolean(row.tts_enabled),ttsAutoPlay:Boolean(row.tts_auto_play),createdAt:row.created_at,preferences:JSON.parse(row.preferences||'{}')};
}
export async function account(request:Request,env:Env):Promise<Account> {
  // These headers are injected and protected by the Sites dispatcher. Never use
  // email, a query parameter, localStorage, or the request body as the user key.
  const id=request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email');
  if(!id || !email)throw new HttpError(401,'Sign in with ChatGPT to continue.');
  const encoded=request.headers.get('oai-authenticated-user-full-name'); let name=email;
  if(encoded&&request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{name=decodeURIComponent(encoded)||email;}catch{}}
  const db=requireDb(env);
  const row=await db.prepare('INSERT INTO users (chatgpt_id,email,display_name,created_at) VALUES (?,?,?,?) ON CONFLICT(chatgpt_id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name RETURNING *').bind(id,email,name,now()).first();
  if(!row)throw new HttpError(503,'Your account could not be loaded.');
  return accountFromRow(row,env);
}
export function record(row:any) { return row ? {...JSON.parse(row.data),id:row.id,...(row.user_id!==undefined?{userId:row.user_id}:{})} : null; }
export function safeInteger(value:string|number) { const n=Number(value); if(!Number.isSafeInteger(n)||n<1)throw new HttpError(400,'Invalid record.');return n; }
