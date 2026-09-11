import { z } from 'zod';
import { account, accountFromRow, body, checkOrigin, HttpError, json, now, record, requireDb } from './core';
import { language, languages, lesson, lessons } from './catalog';
import { capabilities } from './ai';
import { progressRoute } from './progress';
import { chatRoute } from './chat';
import { conversationRoute } from './conversations';
import { adminRoute, publicBlog } from './admin';
import type { Env } from './types';
import { learningRoute } from './learning';
import { wordsRoute } from './words';
import { practiceRoute } from './practice';
import { publicLearningRoute } from './public-learning';
declare const __APP_HTML__:string;

export default { async fetch(request:Request,env:Env):Promise<Response>{
 try{
  const url=new URL(request.url),path=url.pathname;
  if(!path.startsWith('/api/')){
   if(['/subscribe'].includes(path))return Response.redirect(new URL('/languages',url).href,302);
   if(['/verify-email','/forgot-password','/reset-password'].includes(path))return Response.redirect(new URL('/auth',url).href,302);
   if(path==='/ws')return new Response('Not found',{status:404});
   if(/\.[a-z0-9]+$/i.test(path))return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
   if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
   if(/^\/(dashboard|words|practice|language|lesson|learn|profile|settings|admin|contact|conversation|conversation-practice)(\/|$)/.test(path)||/^\/[a-z]{2}\/lesson\//.test(path)){
    if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(new URL('/signin-with-chatgpt?return_to='+encodeURIComponent(path+url.search),url).href,302);
   }
   return new Response(request.method==='HEAD'?null:__APP_HTML__,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
  }
  checkOrigin(request);
  if(path==='/api/capabilities'&&request.method==='GET')return json(capabilities(env));
  if(path==='/api/health'&&request.method==='GET'){await requireDb(env).prepare('SELECT 1 AS ok').first();return json({status:'ok',lessons:lessons.length,languages:languages.length});}
  if(path==='/api/languages'&&request.method==='GET')return json(languages);
  let match=path.match(/^\/api\/languages\/([a-z]+)$/);if(match&&request.method==='GET')return json(language(match[1]));
  if(path.startsWith('/api/media/blog/')&&request.method==='GET'){
   const key=path.slice('/api/media/'.length);const metadata=await requireDb(env).prepare('SELECT * FROM uploads WHERE object_key=?').bind(key).first();if(!metadata||!env.BUCKET)throw new HttpError(404,'Image not found.');const object=await env.BUCKET.get(key);if(!object)throw new HttpError(404,'Image not found.');return new Response(object.body,{headers:{'content-type':metadata.content_type,'cache-control':'public, max-age=3600','x-content-type-options':'nosniff'}});
  }
  if(path==='/api/blog'||path.startsWith('/api/blog/')){requireDb(env);const response=await publicBlog(request,env);if(response)return response;}
  const publicLearning=await publicLearningRoute(request);if(publicLearning)return publicLearning;
  const user=await account(request,env),db=env.DB;
  if(path==='/api/user'&&request.method==='GET')return json(user);
  if((path==='/api/user'||path==='/api/user/preferences')&&['PATCH','PUT'].includes(request.method)){
   const data=z.object({ttsEnabled:z.boolean().optional(),ttsAutoPlay:z.boolean().optional(),minimizeCompanion:z.boolean().optional(),selectedTarget:z.enum(['de','es','fr','hi','zh','ja','kn']).optional(),explanationLanguage:z.literal('en').optional(),knownLanguages:z.array(z.string().regex(/^[a-z]{2,3}$/)).max(12).optional(),nativeLanguage:z.string().max(60).optional(),learningAnalytics:z.boolean().optional()}).strict().parse(await body(request));
   const {ttsEnabled,ttsAutoPlay,...learning}=data;
   const saved=await db.prepare('UPDATE users SET tts_enabled=COALESCE(?,tts_enabled),tts_auto_play=COALESCE(?,tts_auto_play),preferences=json_patch(preferences,?) WHERE id=? RETURNING *').bind(ttsEnabled===undefined?null:Number(ttsEnabled),ttsAutoPlay===undefined?null:Number(ttsAutoPlay),JSON.stringify(learning),user.id).first();
   if(!saved)throw new HttpError(409,'Your account changed. Reload before saving these settings.');return json(accountFromRow(saved,env));
  }
  if(path==='/api/user/delete'&&request.method==='DELETE'){
   const {confirmation}=z.object({confirmation:z.string()}).strict().parse(await body(request));if(confirmation!==user.username)throw new HttpError(400,'The confirmation does not match your display name.');
   const uploads=(await db.prepare('SELECT object_key FROM uploads WHERE user_id=?').bind(user.id).all()).results;
   if(uploads.length){if(!env.BUCKET)throw new HttpError(503,'Deletion is temporarily unavailable. Try again.');await env.BUCKET.delete(uploads.map(x=>x.object_key));}
   await db.prepare('DELETE FROM users WHERE id=?').bind(user.id).run();return json({success:true,message:'Your LingoMitra data has been deleted. Your ChatGPT account is unchanged.'});
  }
  match=path.match(/^\/api\/languages\/([a-z]+)\/lessons$/);if(match&&request.method==='GET'){language(match[1]);return json(lessons.filter(l=>l.languageCode===match![1]));}
  match=path.match(/^\/api\/lessons\/([^/]+)$/);if(match&&request.method==='GET')return json(lesson(decodeURIComponent(match[1])));
  if(path==='/api/contact'&&request.method==='POST'){
   const data=z.object({name:z.string().trim().min(1).max(160),email:z.string().email().max(254),category:z.string().min(1).max(60),message:z.string().trim().min(10).max(5000)}).parse(await body(request));const row=await db.prepare('INSERT INTO contact_submissions (user_id,data) VALUES (?,?) RETURNING *').bind(user.id,JSON.stringify({...data,createdAt:now(),isResolved:false,notes:null})).first();return json({success:true,message:'Your message has been saved for the LingoMitra team.',submission:record(row)},201);
  }
  for(const route of [practiceRoute,learningRoute,wordsRoute,progressRoute,chatRoute,conversationRoute,adminRoute]){const response=await route(request,env,user);if(response)return response;}
  throw new HttpError(404,'This endpoint was not found.');
 }catch(error){
  if(error instanceof z.ZodError)return json({message:error.issues[0]?.message||'Invalid request.',error:error.issues[0]?.message||'Invalid request.'},400);
  if(error instanceof HttpError)return json({message:error.message,error:error.message},error.status);
  console.error('LingoMitra request failed',error instanceof Error?error.message:'Unknown error');
  return json({message:'LingoMitra could not complete this request. Please try again before leaving this page.',error:'The service is temporarily unavailable. Please try again.'},503);
 }
} };
