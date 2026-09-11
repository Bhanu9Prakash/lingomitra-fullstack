import { z } from 'zod';
import { body, json, now, HttpError, record, safeInteger, accountFromRow } from './core';
import { languages, lessons } from './catalog';
import type { Env, Account } from './types';
import { activities } from './learning-content';
import { dailyLimits } from './usage';
const blogSchema=z.object({title:z.string().trim().min(1).max(200),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200),content:z.string().min(1).max(150_000),excerpt:z.string().max(1000).nullable().optional(),featuredImage:z.string().max(1500).nullable().optional(),status:z.enum(['draft','published']).default('draft'),tags:z.array(z.string().max(80)).max(20).default([]),metaTitle:z.string().max(200).nullable().optional(),metaDescription:z.string().max(1000).nullable().optional()});
export async function publicBlog(request:Request,env:Env):Promise<Response|null>{
 const path=new URL(request.url).pathname;
 if(request.method!=='GET')return null;
 if(path==='/api/blog')return json((await env.DB.prepare("SELECT * FROM blog_posts WHERE status='published' ORDER BY id DESC LIMIT 100").all()).results.map(record));
 const match=path.match(/^\/api\/blog\/([^/]+)$/);if(match){const row=await env.DB.prepare("SELECT * FROM blog_posts WHERE slug=? AND status='published'").bind(decodeURIComponent(match[1])).first();if(!row)throw new HttpError(404,'Article not found.');await env.DB.prepare("UPDATE blog_posts SET data=json_set(data,'$.viewCount',coalesce(json_extract(data,'$.viewCount'),0)+1) WHERE id=?").bind(row.id).run();return json(record(row));}return null;
}
export async function adminRoute(request:Request,env:Env,user:Account):Promise<Response|null>{
 const url=new URL(request.url),path=url.pathname,db=env.DB;
 if(!path.startsWith('/api/admin/'))return null;if(!user.isAdmin)throw new HttpError(403,'Administrator access is required.');
 if(path==='/api/admin/users'&&request.method==='GET')return json((await db.prepare('SELECT * FROM users ORDER BY id DESC LIMIT 1000').all()).results.map(row=>accountFromRow(row,env)));
 if(path==='/api/admin/learning-operations'&&request.method==='GET'){
  const usage=(await db.prepare('SELECT day,kind,sum(used) AS used FROM ai_usage WHERE day>=? GROUP BY day,kind ORDER BY day DESC').bind(new Date(Date.now()-14*86400000).toISOString().slice(0,10)).all()).results;
  const attempts=await db.prepare("SELECT count(*) AS attempts,sum(CASE WHEN json_extract(data,'$.feedback.independent')=1 THEN 1 ELSE 0 END) AS independentAttempts FROM learning_events WHERE kind='attempt'").first();
  return json({usage,dailyLimits,attempts,activities:activities.map(a=>({id:a.id,title:a.title,version:a.version,reviewStatus:a.reviewStatus})),model:env.OPENAI_API_KEY?env.OPENAI_CHAT_MODEL||'gpt-4.1-mini':env.GEMINI_MODEL||'gemini-3.7-flash'});
 }
 if(path==='/api/admin/analytics'&&request.method==='GET'){const users=await db.prepare('SELECT count(*) AS count FROM users').first();const completed=await db.prepare("SELECT count(*) AS count FROM user_progress WHERE json_extract(data,'$.completed')=1").first();return json({userCount:users?.count||0,languageCount:languages.length,lessonCount:lessons.length,completedLessonCount:completed?.count||0});}
 if(path==='/api/admin/make-admin'&&request.method==='POST'){const {userId}=z.object({userId:z.number().int().positive()}).strict().parse(await body(request));const changed=await db.prepare('UPDATE users SET is_admin=1 WHERE id=?').bind(userId).run();if(!changed.meta.changes)throw new HttpError(404,'User not found.');return json({success:true});}
 if(path==='/api/admin/contact-submissions'&&request.method==='GET')return json((await db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC LIMIT 1000').all()).results.map(record));
 let match=path.match(/^\/api\/admin\/contact-submissions\/(\d+)\/resolve$/);
 if(match&&request.method==='POST'){const {notes}=z.object({notes:z.string().max(4000).optional()}).parse(await body(request));const changed=await db.prepare("UPDATE contact_submissions SET data=json_set(data,'$.isResolved',json('true'),'$.notes',?) WHERE id=?").bind(notes||'',safeInteger(match[1])).run();if(!changed.meta.changes)throw new HttpError(404,'Submission not found.');return json({success:true});}
 if(path==='/api/admin/blog/upload-image'&&request.method==='POST'){
  if(!env.BUCKET)throw new HttpError(503,'Image uploads are temporarily unavailable.');
  if(Number(request.headers.get('content-length')||0)>5_500_000)throw new HttpError(413,'Upload an image under 5 MB.');
  const form=await request.formData();const file=form.get('image');if(!(file instanceof File)||!file.size||file.size>5_000_000||!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))throw new HttpError(400,'Choose a PNG, JPEG, WebP or GIF under 5 MB.');
  const key=`blog/${user.id}/${crypto.randomUUID()}`;await db.prepare('INSERT INTO uploads (object_key,user_id,content_type) VALUES (?,?,?)').bind(key,user.id,file.type).run();
  try{await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type}});}catch(e){await db.prepare('DELETE FROM uploads WHERE object_key=?').bind(key).run();throw e;}
  return json({url:`/api/media/${key}`,filename:file.name,size:file.size,type:file.type});
 }
 if(path==='/api/admin/blog'&&request.method==='GET')return json((await db.prepare('SELECT * FROM blog_posts ORDER BY id DESC LIMIT 1000').all()).results.map(record));
 match=path.match(/^\/api\/admin\/blog\/(\d+)$/);
 if(path==='/api/admin/blog'&&request.method==='POST'){
  const data=blogSchema.parse(await body(request,180_000));validateImage(data.featuredImage);const item={...data,authorId:user.id,viewCount:0,createdAt:now(),updatedAt:now(),publishedAt:data.status==='published'?now():null};const row=await db.prepare('INSERT INTO blog_posts (slug,status,data) VALUES (?,?,?) RETURNING *').bind(data.slug,data.status,JSON.stringify(item)).first();return json(record(row),201);
 }
 if(match){const id=safeInteger(match[1]);const existing=record(await db.prepare('SELECT * FROM blog_posts WHERE id=?').bind(id).first());if(!existing)throw new HttpError(404,'Article not found.');
  if(request.method==='GET')return json(existing);
  if(request.method==='DELETE'){await db.prepare('DELETE FROM blog_posts WHERE id=?').bind(id).run();return json({success:true});}
  if(request.method==='PATCH'){const data=blogSchema.partial().parse(await body(request,180_000));validateImage(data.featuredImage);const updated={...existing,...data,updatedAt:now(),publishedAt:data.status==='published'&&!existing.publishedAt?now():existing.publishedAt};await db.prepare('UPDATE blog_posts SET slug=?,status=?,data=? WHERE id=?').bind(updated.slug,updated.status,JSON.stringify(updated),id).run();return json(updated);}
 }
 return null;
}
function validateImage(value:string|null|undefined){if(value&&!value.startsWith('/api/media/blog/')&&!/^https:\/\//.test(value))throw new HttpError(400,'Use an uploaded image or an HTTPS image URL.');}
