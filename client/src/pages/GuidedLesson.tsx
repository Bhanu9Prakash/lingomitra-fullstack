import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useEffect, useRef, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ChevronRight, Lightbulb, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { arrivalTime, learningApi, LearningError, guestWasSeen, guestActivities } from '@/lib/learning-api';
import LessonStep, { LessonFeedback } from '@/components/LessonStep';
import LessonWorkspace from '@/components/LessonWorkspace';
import { pathwayForActivity } from '@shared/pathways';
import type { LearningSession } from '@shared/learning';
import type { Lesson } from '@shared/schema';
import { ActiveClock, reconcileAnswer, readRecovery, saveRecovery } from '@shared/learning-client';
import ChatUI from '@/components/ChatUI';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function GuidedLessonPage(){const [,params]=useRoute('/learn/:activityId');return <GuidedLesson key={params?.activityId} activityId={params?.activityId||'de-starter-01'}/>;}

export function GuidedLesson({activityId}:{activityId:string}) {
  const {user}=useAuth(),queryClient=useQueryClient();
  const path=pathwayForActivity(activityId),language=path?.code||'de';
  const [composing,setComposing]=useState(false);
  const [session,setSession]=useState<LearningSession|null>(null),[answer,setAnswer]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[paused,setPaused]=useState(false),[notes,setNotes]=useState<string|null>(null),[conflict,setConflict]=useState(false),[recovery,setRecovery]=useState('');
  const [quiet,setQuiet]=useState(()=>Boolean(user?.preferences?.minimizeCompanion));
  const [showRecovery,setShowRecovery]=useState(false);
  const [coach,setCoach]=useState<Lesson|null>(null),[coachOpen,setCoachOpen]=useState(false);
  const stateRef=useRef(session),answerRef=useRef(answer),busyRef=useRef(false),clock=useRef(new ActiveClock(performance.now())),pending=useRef<{path:string;data:any}|null>(null),mounted=useRef(true),heading=useRef<HTMLHeadingElement>(null),recoveryStep=useRef('');
  const cacheKey=`lingomitra-draft:${user?.id}:${activityId}`;
  const preserveRecovery=(text:string,stepId=stateRef.current?.step.id||'unknown',at=Date.now())=>{if(!text)return;setRecovery(text);recoveryStep.current=stepId;setShowRecovery(false);try{saveRecovery(sessionStorage,cacheKey+':recovery',{answer:text,stepId,at});}catch{}};
  stateRef.current=session;answerRef.current=answer;
  const remember=(value:LearningSession)=>{stateRef.current=value;setSession(value);queryClient.invalidateQueries({predicate:q=>['/api/learning/summary','/api/words','/api/words/view'].includes(String(q.queryKey[0]))});};
  const load=async()=>{
    setBusy(true);busyRef.current=true;
    try {
      const isReview=new URLSearchParams(window.location.search).has('review');
      const s=await learningApi<LearningSession>('/api/learning/start',{activityId,mode:isReview?'review':'lesson',arrivalAt:arrivalTime(),previewSeen:guestWasSeen(language),previewActivities:guestActivities(language)});
      if(!mounted.current)return;
      remember(s);void learningApi('/api/user/preferences',{selectedTarget:language},'PATCH').then(()=>queryClient.invalidateQueries({queryKey:['/api/user']})).catch(()=>{});setAnswer(s.answer);setError('');setConflict(false);pending.current=null;
      if(isReview)window.history.replaceState(null,'',window.location.pathname);
      try {const local=readRecovery(sessionStorage,cacheKey),unresolved=readRecovery(sessionStorage,cacheKey+':recovery');if(unresolved)preserveRecovery(unresolved.answer,unresolved.stepId,unresolved.at);if(local&&local.answer!==s.answer)preserveRecovery(local.answer,local.stepId,local.at);}catch{}
    }catch(e){if(mounted.current)setError((e as Error).message);}finally{busyRef.current=false;if(mounted.current)setBusy(false);}
  };
  useEffect(()=>{mounted.current=true;void load();return()=>{clock.current.setRunning(false,performance.now());void send('draft');mounted.current=false;};},[activityId]);
  useEffect(()=>{heading.current?.focus();},[session?.step.id]);
  useEffect(()=>{
    const visibility=()=>{clock.current.setRunning(Boolean(session)&&!paused&&!busy&&!coachOpen&&!session?.completed&&document.visibilityState==='visible',performance.now());if(document.visibilityState==='hidden'&&clock.current.pending>0)void send('draft');};
    visibility();document.addEventListener('visibilitychange',visibility);
    const timer=window.setInterval(()=>{clock.current.sample(performance.now());if(clock.current.pending>0&&!busyRef.current&&!pending.current)void send('draft');},20000);
    return()=>{clock.current.setRunning(false,performance.now());clearInterval(timer);document.removeEventListener('visibilitychange',visibility);};
  },[paused,busy,coachOpen,session?.completed]);
  useEffect(()=>{
    const warn=(e:BeforeUnloadEvent)=>{if(answerRef.current!==stateRef.current?.answer||pending.current){e.preventDefault();e.returnValue='';}};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[]);
  useEffect(()=>{
    if(!session)return;
    try{if(answer===session.answer&&!pending.current)sessionStorage.removeItem(cacheKey);else saveRecovery(sessionStorage,cacheKey,{answer,at:Date.now(),stepId:session.step.id});}catch{}
    if(answer===session.answer||busy||error||paused)return;
    const timer=window.setTimeout(()=>void send('draft'),1200);return()=>clearTimeout(timer);
  },[answer,session?.version,busy,error,paused]);

  async function send(kind:string,extra:Record<string,unknown>={},retry=false) {
    const s=stateRef.current;if(!s||busyRef.current||composing&&kind==='attempt')return null;
    if(pending.current&&!retry){setError('Retry the previous save first. Your current text stays here.');return null;}
    clock.current.sample(performance.now());
    const request=retry&&pending.current?pending.current:{path:`/api/learning/sessions/${s.id}/event`,data:{eventId:crypto.randomUUID(),version:s.version,kind,answer:answerRef.current,activeDeltaMs:Math.min(3600000,Math.round(clock.current.pending)),...extra}};
    pending.current=request;busyRef.current=true;setBusy(true);setError('');
    try {
      const result=await learningApi<LearningSession>(request.path,request.data);
      if(!mounted.current)return null;
      clock.current.consume(request.data.activeDeltaMs||0);
      remember(result);pending.current=null;setConflict(false);
      const merged=reconcileAnswer({requestAnswer:request.data.answer,currentAnswer:answerRef.current,savedAnswer:result.answer,advance:request.data.kind==='advance'});
      if(merged.recovery)preserveRecovery(merged.recovery,s.step.id);
      setAnswer(merged.answer);
      try{if(merged.answer===result.answer)sessionStorage.removeItem(cacheKey);}catch{}
      return result;
    }catch(e){if(mounted.current){setError((e as Error).message);setConflict(e instanceof LearningError&&e.status===409);}return null;}
    finally{busyRef.current=false;if(mounted.current)setBusy(false);}
  }
  async function openNotes() {
    if(notes!==null){setNotes(null);return;}
    const saved=await send('support',{source:'notes'});if(!saved)return;
    try{const source=await learningApi<Lesson>(`/api/lessons/${saved.linkedLessonId}`);setNotes(source.content);}catch(e){setError((e as Error).message);}
  }
  async function openCoach(){const saved=await send('support',{source:'tutor'});if(!saved)return;try{const source=await learningApi<Lesson>(`/api/lessons/${saved.linkedLessonId}`);setCoach(source);setCoachOpen(true);}catch(e){setError((e as Error).message);}}
  async function toggleQuiet(){const next=!quiet;setQuiet(next);try{await learningApi('/api/user/preferences',{minimizeCompanion:next},'PATCH');queryClient.invalidateQueries({queryKey:['/api/user']});}catch{setError('The companion setting could not sync. It is changed for this page.');}}
  if(!session)return <main className="guided-shell"><h1>{path?.name||'Language'} starter</h1>{error?<div role="alert"><p>{error}</p><Button onClick={load} disabled={busy}>Try again</Button></div>:<p role="status">Preparing your saved lesson…</p>}<Link href="/languages">Browse all languages</Link></main>;
  const step=session.step,construct=step.kind==='construct'||step.kind==='context';
  const hasResponse=Boolean(session.feedback)||session.help?.level===99;
  return <LessonWorkspace title={session.title} step={step} stepIndex={session.stepIndex} totalSteps={session.totalSteps} review={session.mode==='review'} busy={busy} navigation={<><Link href={`/language/${language}`}><ArrowLeft size={16} aria-hidden="true"/> {path?.name} course</Link><span>English explanations</span><Button size="sm" variant="ghost" onClick={()=>setPaused(!paused)}>{paused?<Play size={16} aria-hidden="true"/>:<Pause size={16} aria-hidden="true"/>} {paused?'Resume':'Pause'}</Button></>}>
    {session.prerequisiteWarnings.length>0&&session.stepIndex===0&&<aside className="guided-note">New to these pieces? You can start with {session.prerequisiteWarnings.map((a,i)=><span key={a.id}>{i>0?', ':''}<Link href={`/learn/${a.id}`}>{a.title}</Link></span>)}. Every activity stays open.</aside>}
    {paused?<section className="guided-card"><h1>Take your time.</h1><p>Your last saved position is ready when you are. Thinking time is never penalized.</p><Button onClick={()=>setPaused(false)}>Resume learning</Button></section>:<section className="guided-card" aria-labelledby="step-title">
      <LessonStep step={step} language={language} audioLocale={session.audioLocale} answer={answer} onAnswer={setAnswer} quiet={quiet} help={session.help} feedback={session.feedback} onComposition={setComposing}/>
      {(construct||step.kind==='understand')&&<div className="guided-actions sentence-actions"><Button className="sentence-check" variant={session.feedback?.correct?'outline':'default'} disabled={composing||busy||!answer.trim()||Boolean(pending.current)} onClick={()=>void send('attempt')}>{step.kind==='understand'?'Check the meaning':step.responseMode==='word'?'Check word':session.feedback?'Check this version':'Check sentence'}</Button><div className="sentence-help-actions"><Button variant="ghost" disabled={busy||composing||Boolean(pending.current)} onClick={()=>void send('hint')}><Lightbulb size={16} aria-hidden="true"/> Thinking cue</Button><Button variant="ghost" disabled={busy||composing||Boolean(pending.current)} onClick={()=>void send('reveal')}>{step.responseMode==='word'?'Show the word':'Show an example'}</Button></div></div>}
      <LessonFeedback help={session.help} feedback={session.feedback} quiet={quiet}/>
      {step.kind==='finish'&&<div className="guided-note"><p>We recorded what you attempted and the support you used. One sentence is a useful beginning, not fluency.</p>{session.priorKnowledge==='demonstrated-before-teaching'&&<p>You could make the opening request before teaching, so it will not be counted as a gain from this lesson.</p>}{session.completed&&<p>Saved. Suggested next review: {session.dueAt?new Date(session.dueAt).toLocaleDateString(): 'tomorrow'}.</p>}</div>}
      {!session.completed&&session.canAdvance&&<Button className="guided-next" variant={session.feedback&&!session.feedback.correct?'ghost':'default'} disabled={busy||Boolean(pending.current)} onClick={()=>void send('advance')}>{step.kind==='prior'?(answer.trim()?'Continue from here':'I don’t know yet'):step.kind==='finish'?'Save and plan a revisit':session.feedback&&!session.feedback.correct?'Keep as unassessed and continue':step.responseMode==='word'?'Use it in a sentence':construct||step.kind==='understand'?'Continue practice':'Continue'}<ChevronRight size={16} aria-hidden="true"/></Button>}
      {session.completed&&<div className="guided-actions">{session.nextActivityId&&<Button asChild><Link href={`/learn/${session.nextActivityId}`}>Continue to the next idea</Link></Button>}<Button asChild variant="outline"><Link href={activityId.startsWith('word-')?'/words/'+language:'/dashboard/'+language}>{activityId.startsWith('word-')?'Back to Words':'Back to Today'}</Link></Button><Link href={`/language/${language}`}>Choose any {path?.name} lesson</Link></div>}
    </section>}
    {recovery&&<aside className="guided-note"><h2>An unsaved draft from this device</h2><p>Original task: {recoveryStep.current}. This recovery stays on this device until you dismiss it or 24 hours pass.</p>{showRecovery?<p lang={language}>{recovery}</p>:<Button size="sm" variant="outline" disabled={busy||Boolean(pending.current)} onClick={async()=>{if(await send('support',{source:'external'}))setShowRecovery(true);}}>Show recovered text (records support)</Button>}<Button size="sm" variant="ghost" onClick={()=>{setRecovery('');try{sessionStorage.removeItem(cacheKey+':recovery');}catch{}}}>Dismiss recovered text</Button></aside>}
    {error&&<div className="guided-error" role="alert"><p>{error}</p>{pending.current&&!conflict&&<Button disabled={busy} onClick={()=>void send('draft',{},true)}><RotateCcw size={16}/> Retry save</Button>}{conflict&&<Button disabled={busy} onClick={()=>{preserveRecovery(answer);void load();}}>Keep this text and load saved version</Button>}</div>}
    <div className="guided-foot"><span role="status">{busy?'Saving…':pending.current||answer!==session.answer?'Draft not yet saved':'Saved to your account'}</span><Button variant="ghost" type="button" onClick={toggleQuiet}>{quiet?'Show companion commentary':'Minimize companion commentary'}</Button></div>
    <Accordion type="single" collapsible className="guided-details"><AccordionItem value="details"><AccordionTrigger>About this starter and your learning record</AccordionTrigger><AccordionContent><p>This original {path?.name} pilot uses English explanations. Human teacher review and learner testing are still pending. Typed sentence checks assess a limited set of taught patterns. Help, corrections and repeated sentences are recorded separately from new independent constructions. We cannot detect help outside the app.</p><p>Arrival time includes setup and sign-in. Active time estimates the visible, unpaused lesson, including quiet thinking. Saving time and the optional tutor panel are excluded. Your answers stay in your account; temporary unsaved text on this device expires after 24 hours. You can delete your data in Settings.</p></AccordionContent></AccordionItem></Accordion>
    <div className="guided-reference"><Button variant="ghost" disabled={busy||Boolean(pending.current)} onClick={openNotes}>{notes!==null?'Close original course notes':'Open the original course notes (with examples)'}</Button><p>Opening notes records support for this session. All original lesson IDs and saved completion remain available.</p>{notes!==null&&<div className="lesson-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown></div>}</div>
    <Button variant="ghost" disabled={busy||Boolean(pending.current)} onClick={openCoach}>Ask the optional tutor (records support)</Button>
    <p className="guided-details"><Link href={`/contact?lesson=${encodeURIComponent(session.linkedLessonId)}&activity=${encodeURIComponent(activityId)}&version=${encodeURIComponent(session.contentVersion)}&step=${encodeURIComponent(step.id)}`}>Report a confusing part of this step</Link></p>
    <Dialog open={coachOpen} onOpenChange={setCoachOpen}><DialogContent className="max-w-4xl max-h-[90dvh] overflow-y-auto"><DialogTitle>Optional lesson tutor</DialogTitle><DialogDescription>Help here is recorded for this session. Your lesson draft stays saved. Close this panel to return.</DialogDescription>{coach&&<ChatUI lesson={coach}/>}</DialogContent></Dialog>
  </LessonWorkspace>;
}
