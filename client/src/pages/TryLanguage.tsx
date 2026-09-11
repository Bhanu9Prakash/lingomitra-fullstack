import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useEffect, useRef, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, ChevronRight, Lightbulb, Pause, Play } from 'lucide-react';
import { pathway } from '@shared/pathways';
import type { TeachingStep, LearningFeedback } from '@shared/learning';
import { ActiveClock } from '@shared/learning-client';
import { arrivalTime, learningApi } from '@/lib/learning-api';
import { Button } from '@/components/ui/button';
import LessonStep, { LessonFeedback } from '@/components/LessonStep';
import LessonWorkspace from '@/components/LessonWorkspace';
import { useAuth } from '@/hooks/use-auth';
type PublicStep={activityId:string;title:string;languageCode:string;audioLocale:string;script:string;contentVersion:string;stepIndex:number;totalSteps:number;step:TeachingStep;nextActivityId?:string;feedback?:LearningFeedback;help?:{level:number;text:string}};
export default function TryLanguagePage(){const [,full]=useRoute('/try/:code/:activityId'),[,short]=useRoute('/try/:code');const p=full||short;return <TryLanguage key={`${p?.code}:${full?.activityId}`} code={p?.code||''} activityId={full?.activityId}/>;}
function TryLanguage({code,activityId}:{code:string;activityId?:string}){
 const path=pathway(code),id=activityId||path?.starters[0]||'',{user}=useAuth();
 const [data,setData]=useState<PublicStep|null>(null),[answer,setAnswer]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[paused,setPaused]=useState(false),[quiet,setQuiet]=useState(false),[composing,setComposing]=useState(false),[done,setDone]=useState(false);
 const key=`lingomitra-guest:${code}:${id}`,clock=useRef(new ActiveClock(performance.now())),started=useRef(arrivalTime()),mounted=useRef(true),busyRef=useRef(false);
 const snapshot=useRef({data,answer,done});snapshot.current={data,answer,done};
 const persist=()=>{const current=snapshot.current;if(!current.data)return;clock.current.sample(performance.now());try{sessionStorage.setItem(key,JSON.stringify({...current,at:Date.now(),arrivalAt:started.current,activeMs:clock.current.pending}));const seen=JSON.parse(sessionStorage.getItem('lingomitra-guest-exposure:'+code)||'{}');seen[id]=new Date().toISOString();sessionStorage.setItem('lingomitra-guest-exposure:'+code,JSON.stringify(seen));}catch{}};
 async function load(index=0){setBusy(true);setError('');try{const result=await learningApi<PublicStep>('/api/public/learning',{activityId:id,stepIndex:index,kind:'step'});if(mounted.current){setData(result);if(index!==snapshot.current.data?.stepIndex)setAnswer('');}}catch(e){if(mounted.current)setError((e as Error).message);}finally{if(mounted.current)setBusy(false);}}
 useEffect(()=>{mounted.current=true;let position=0;try{const s=JSON.parse(sessionStorage.getItem(key)||'null');if(s&&Date.now()-s.at<86400000){position=s.data?.stepIndex||0;setAnswer(s.answer||'');setDone(Boolean(s.done));clock.current.pending=s.activeMs||0;started.current=s.arrivalAt||started.current;}else sessionStorage.removeItem(key);}catch{}if(path&&path.starters.includes(id))void load(position);return()=>{persist();mounted.current=false;};},[id]);
 useEffect(()=>{const visibility=()=>clock.current.setRunning(Boolean(data)&&!busy&&!paused&&!done&&document.visibilityState==='visible',performance.now());visibility();document.addEventListener('visibilitychange',visibility);return()=>{clock.current.setRunning(false,performance.now());document.removeEventListener('visibilitychange',visibility);};},[data,busy,paused,done]);
 useEffect(()=>{persist();},[data,answer,done]);
 async function action(kind:'attempt'|'hint'|'reveal'){
  if(!data||busyRef.current||composing)return;busyRef.current=true;setBusy(true);setError('');
  try{const result=await learningApi<PublicStep>('/api/public/learning',{activityId:id,stepIndex:data.stepIndex,kind,answer,hintLevel:data.help?.level===99?0:data.help?.level||0});if(mounted.current)setData({...result,help:result.help||data.help,feedback:result.feedback||data.feedback});}catch(e){if(mounted.current)setError((e as Error).message);}finally{busyRef.current=false;if(mounted.current)setBusy(false);}
 }
 async function next(){if(!data||busyRef.current)return;if(data.step.kind==='finish'){setDone(true);return;}await load(data.stepIndex+1);}
 if(!path||!path.starters.includes(id))return <main className="guided-shell"><h1>Choose a language</h1><Link href="/languages">See the seven pathways</Link></main>;
 const signIn=`/signin-with-chatgpt?return_to=${encodeURIComponent('/learn/'+id)}`;
 if(!data)return <main className="guided-shell"><h1>{path.name} starter</h1><p role={error?'alert':'status'}>{error||'Preparing your first idea…'}</p>{error&&<Button onClick={()=>load()}>Try again</Button>}<Link href="/languages">Choose another language</Link></main>;
 const step=data.step,attempt=['construct','context','understand'].includes(step.kind),canNext=!attempt||Boolean(data.feedback)||data.help?.level===99;
 return <LessonWorkspace title={data.title} step={step} stepIndex={data.stepIndex} totalSteps={data.totalSteps} busy={busy} navigation={<><Link href="/languages"><ArrowLeft size={16} aria-hidden="true"/> All languages</Link><span>{path.name} · English explanations</span><Button variant="ghost" size="sm" onClick={()=>setPaused(!paused)}>{paused?<Play size={16} aria-hidden="true"/>:<Pause size={16} aria-hidden="true"/>} {paused?'Resume':'Pause'}</Button></>}>
  <section className="guided-card" aria-labelledby="step-title">
   {paused?<><h1 id="step-title">Take your time.</h1><p>Your draft stays here while you pause.</p><Button onClick={()=>setPaused(false)}>Resume learning</Button></>:<>
    <LessonStep step={step} language={code} audioLocale={data.audioLocale} answer={answer} onAnswer={setAnswer} quiet={quiet} help={data.help} feedback={data.feedback} onComposition={setComposing}/>
    {attempt&&!done&&<div className="guided-actions sentence-actions"><Button className="sentence-check" variant={data.feedback?.correct?'outline':'default'} disabled={busy||composing||!answer.trim()} onClick={()=>action('attempt')}>Check {step.kind==='understand'?'the meaning':'sentence'}</Button><div className="sentence-help-actions"><Button variant="ghost" disabled={busy||composing} onClick={()=>action('hint')}><Lightbulb size={16} aria-hidden="true"/> Thinking cue</Button><Button variant="ghost" disabled={busy||composing} onClick={()=>action('reveal')}>Show an example</Button></div></div>}
    <LessonFeedback help={data.help} feedback={data.feedback} quiet={quiet}/>
    {!done&&canNext&&<Button className="guided-next" disabled={busy||composing} onClick={next}>{step.kind==='prior'?(answer.trim()?'Continue from here':'I don’t know yet'):step.kind==='finish'?'Keep this practice on this device':attempt?'Try a different message':'Continue'}<ChevronRight size={16}/></Button>}
    {done&&<div className="guided-note"><h2>Your practice is kept on this device</h2><p>You tried one useful pattern. That is a beginning, not fluency. Sign in to save future lessons and return reviews to your account. This practice will not be converted into an unsupported mastery score.</p><div className="guided-actions">{user?<Button asChild><Link href={`/learn/${id}`}>Continue with saved learning</Link></Button>:<Button asChild><a href={signIn} target="_top">Save future learning with ChatGPT</a></Button>}{data.nextActivityId&&<Button asChild variant="outline"><Link href={`/try/${code}/${data.nextActivityId}`}>Try the next idea</Link></Button>}</div></div>}
   </>}
  </section>
  {error&&<div className="guided-error" role="alert"><p>{error}</p><p>Your sentence is still here. Retry the same action when your connection returns.</p></div>}
  <div className="guided-foot"><span>This device · no account required</span><Button variant="ghost" onClick={()=>setQuiet(!quiet)}>{quiet?'Show companion commentary':'Minimize companion commentary'}</Button></div>
  <Accordion type="single" collapsible className="guided-details"><AccordionItem value="details"><AccordionTrigger>About this starter and your practice</AccordionTrigger><AccordionContent><p>Original {path.name} content, awaiting qualified human review and beginner testing. The checker covers a limited set of taught patterns and can leave an answer unassessed. Typed work does not assess speech. Temporary practice on this device expires after 24 hours; it is separate from account-linked evidence.</p><p>Answer checks do not use AI or require a microphone. Device audio is optional and unreviewed. Thinking and listening count as active learning; no countdown is used.</p></AccordionContent></AccordionItem></Accordion>
 </LessonWorkspace>;
}
