import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { runInNewContext } from 'node:vm';
import worker from '../worker/index';

import {database,request} from './helpers';

const completed = { completed: true, progress: 100, score: 100, timeSpent: 45, notes: JSON.stringify({ version: 1, attempts: 5, correct: 4, confidence: 'again', weakConcepts: [], completedActivities: ['predict', 'practice-1', 'practice-2', 'practice-3', 'transfer', 'reflect'], review: { dueAt: '2026-01-01T00:00:00.000Z', concept: 'Word order', prompt: 'Build a sentence.', cue: 'Remember the verb.' } }) };

test('the additive learning migration preserves populated legacy accounts and progress byte for byte',()=>{
  const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys = ON');
  for(const file of ['0000_steady_valeria_richards.sql','0001_tiresome_tyrannus.sql'])sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
  sqlite.prepare('INSERT INTO users (chatgpt_id,email,display_name,created_at) VALUES (?,?,?,?)').run('existing-id','old@example.test','Existing learner','2026-01-01');
  const data=JSON.stringify(completed);
  sqlite.prepare('INSERT INTO user_progress (user_id,lesson_id,language_code,data,version) VALUES (1,?,?,?,7)').run('de-lesson03','de',data);
  sqlite.exec(readFileSync('drizzle/0002_powerful_ted_forrester.sql','utf8'));
  sqlite.exec(readFileSync('drizzle/0003_classy_star_brand.sql','utf8'));
  const row=sqlite.prepare('SELECT * FROM user_progress WHERE user_id=1').get()!;
  assert.equal(row.data,data);assert.equal(row.version,7);
  const user=sqlite.prepare('SELECT * FROM users WHERE id=1').get()!;
  assert.equal(user.chatgpt_id,'existing-id');assert.equal(user.preferences,'{}');sqlite.close();
});

test('anonymous requests and browser-supplied identities cannot access learner data', async () => {
  const env: any = { DB: database() };
  for (const path of ['/api/user', '/api/progress/language/de?testUser=1', '/api/chat/history/de-lesson01']) assert.equal((await worker.fetch(request(path), env)).status, 401);
});
test('stable ChatGPT IDs preserve profiles without merging accounts that share an email', async () => {
  const env: any = { DB: database() };
  const a = await (await worker.fetch(request('/api/user','alice',undefined,'GET','shared@example.test'),env)).json() as any;
  const again = await (await worker.fetch(request('/api/user','alice',undefined,'GET','new@example.test'),env)).json() as any;
  const b = await (await worker.fetch(request('/api/user','bob',undefined,'GET','shared@example.test'),env)).json() as any;
  assert.equal(a.id,again.id); assert.notEqual(a.id,b.id); assert.equal(a.isAdmin,false);
  assert.equal('password' in a,false); assert.equal('subscriptionTier' in a,false);
});
test('all lessons are accessible and progress, review, and resets are account scoped', async () => {
  const env: any = { DB: database() };
  const lessons = await (await worker.fetch(request('/api/languages/de/lessons','alice'),env)).json() as any[];
  assert.ok(lessons.length >= 25);
  assert.equal((await worker.fetch(request('/api/lessons/de-lesson03','alice'),env)).status,200);
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','alice',{ completed: true }),env)).status,400);
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','alice',completed),env)).status,200);
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','bob'),env)).status,404);
  const queue = await (await worker.fetch(request('/api/progress/review/due?language=de','alice'),env)).json() as any;
  assert.equal(queue.items.length,1);
  await worker.fetch(request('/api/progress/language/de/reset','bob',undefined,'DELETE'),env);
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','alice'),env)).status,200);
  const res = await worker.fetch(request('/api/progress/lesson/de-lesson03','alice'),env);
  assert.match(res.headers.get('cache-control') || '',/no-store/);
});
test('conversation ownership and admin authorization apply on every route', async () => {
  const env: any = { DB: database() };
  const created = await (await worker.fetch(request('/api/conversation/sessions','alice',{languageCode:'de',topic:'travel',difficultyLevel:'beginner'}),env)).json() as any;
  const id = created.session.id;
  for (const [suffix,method] of [['','GET'],['/complete','POST'],['/message','POST']]) assert.equal((await worker.fetch(request(`/api/conversation/sessions/${id}${suffix}`,'bob',method==='POST'?{message:'Hallo'}:undefined,method),env)).status,404);
  assert.equal((await worker.fetch(request('/api/admin/users','alice'),env)).status,403);
});

test('a delayed progress save cannot overwrite a completion from another tab', async () => {
  let holdNextRead=false;
  let release!:()=>void;
  let readStarted!:()=>void;
  const waiting=new Promise<void>(resolve=>{release=resolve;});
  const started=new Promise<void>(resolve=>{readStarted=resolve;});
  const env:any={DB:database(async sql=>{
    if(holdNextRead && sql.startsWith('SELECT * FROM user_progress WHERE user_id=')){
      holdNextRead=false; readStarted(); await waiting;
    }
  })};
  await worker.fetch(request('/api/progress/lesson/de-lesson03','alice',{progress:10}),env);
  holdNextRead=true;
  const delayed=worker.fetch(request('/api/progress/lesson/de-lesson03','alice',{progress:20}),env);
  await started;
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','alice',completed),env)).status,200);
  release();
  assert.equal((await delayed).status,409);
  const saved=await (await worker.fetch(request('/api/progress/lesson/de-lesson03','alice'),env)).json() as any;
  assert.equal(saved.completed,true); assert.equal(saved.progress,100); assert.equal(saved.notes,completed.notes);
});
test('cross-site writes are rejected and missing model credentials produce an honest unavailable state', async () => {
  const env: any = { DB: database() };
  const foreign = request('/api/progress/lesson/de-lesson03','alice',completed); foreign.headers.set('origin','https://evil.test');
  assert.equal((await worker.fetch(foreign,env)).status,403);
  const response = await worker.fetch(request('/api/chat','alice',{lessonId:'de-lesson03',conversation:[{role:'user',content:'Hallo'}]}),env);
  assert.equal(response.status,503);
});

test('preferences persist and deleting an account removes only that account data', async () => {
  const env: any = { DB: database() };
  for(const identity of ['alice','bob']) {
    await worker.fetch(request('/api/progress/lesson/de-lesson03',identity,completed),env);
    await worker.fetch(request('/api/chat/init',identity,{lessonId:'de-lesson03'}),env);
    await worker.fetch(request('/api/conversation/sessions',identity,{languageCode:'de',topic:'daily'}),env);
  }
  const updated = await worker.fetch(request('/api/user/preferences','alice',{ttsEnabled:false},'PATCH'),env);
  assert.equal(updated.status,200);
  assert.equal(((await (await worker.fetch(request('/api/user','alice'),env)).json()) as any).ttsEnabled,false);
  assert.equal((await worker.fetch(request('/api/user/preferences','bob',{isAdmin:true},'PATCH'),env)).status,400);
  const account = await (await worker.fetch(request('/api/user','alice'),env)).json() as any;
  assert.equal((await worker.fetch(request('/api/user/delete','alice',{confirmation:'wrong'},'DELETE'),env)).status,400);
  assert.equal((await worker.fetch(request('/api/user/delete','alice',{confirmation:account.username},'DELETE'),env)).status,200);
  const remnants = await env.DB.prepare('SELECT count(*) AS n FROM user_progress WHERE user_id=?').bind(account.id).first();
  assert.equal(remnants.n,0);
  const history = await env.DB.prepare('SELECT count(*) AS n FROM chat_history WHERE user_id=?').bind(account.id).first();
  assert.equal(history.n,0);
  const sessions = await env.DB.prepare('SELECT count(*) AS n FROM conversation_sessions WHERE user_id=?').bind(account.id).first();
  assert.equal(sessions.n,0);
  assert.equal((await worker.fetch(request('/api/progress/lesson/de-lesson03','bob'),env)).status,200);
});

test('service worker does not intercept account data or sign-in routes', () => {
 const listeners:Record<string,Function>={};
 runInNewContext(readFileSync('client/public/service-worker.js','utf8'),{URL,self:{location:{origin:'https://lingomitra.test'},addEventListener:(type:string,listener:Function)=>listeners[type]=listener}});
 for(const path of ['/api/user','/api/progress/language/de','/api/chat/history/de-lesson03','/signin-with-chatgpt','/signout-with-chatgpt','/callback']){
  let intercepted=false;
  listeners.fetch({request:{url:`https://lingomitra.test${path}`,method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});
  assert.equal(intercepted,false,path);
 }
});
