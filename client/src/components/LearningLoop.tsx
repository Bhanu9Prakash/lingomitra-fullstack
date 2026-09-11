import { pathway } from '@shared/pathways';
import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import type { Lesson } from '@shared/schema';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useLessonDraft } from '@/hooks/use-lesson-draft';
import { learningApi } from '@/lib/learning-api';
import MascotMoment from './MascotMoment';
interface Props {lesson:Lesson;nextLesson:Lesson|null;prevLesson:Lesson|null;onNavigate:(id:string)=>void;}
export default function LearningLoop({lesson,nextLesson,prevLesson,onNavigate}:Props) {
  const draft=useLessonDraft(lesson.lessonId),{data,setData}=draft,query=useQueryClient(),began=useRef(Date.now());
  const [saveError,setSaveError]=useState(''),[completed,setCompleted]=useState(false),[completing,setCompleting]=useState(false);
  const next=(step:number)=>setData({...data,step});
  async function finish(){setCompleting(true);setSaveError('');try{
    if(!await draft.finish(Math.min(28800,Math.round((Date.now()-began.current)/1000))))throw new Error('This practice could not finish saving. Your text is still here.');
    setCompleted(true);setData({...data,step:3});query.invalidateQueries();
  }catch(e){setSaveError((e as Error).message);}finally{setCompleting(false);}}
  if(!draft.loaded)return <section className="learning-card"><h1>{lesson.title}</h1><p role={draft.error?'alert':'status'}>{draft.error||'Loading your saved practice…'}</p>{draft.error&&<Button onClick={draft.reload}>Try again</Button>}</section>;
  return <section className="learning-loop" aria-labelledby="lesson-outcome"><div className="learning-card">
    <p className="eyebrow">Course notes & self-practice · English explanations</p><h1 id="lesson-outcome">{lesson.title}</h1>
    <p>This course activity saves your practice and reflection. It does not automatically judge whether a sentence is correct. The guided openings have authored sentence checks in all seven languages. Later course activities remain self-practice while their teaching is improved in reviewed batches.</p>
    {pathway(lesson.languageCode)&&<p><Link href={`/learn/${pathway(lesson.languageCode)!.starters[0]}`}>Open this language’s guided starter</Link></p>}
    {data.step===0&&<><MascotMoment state="neutral" alt=""/><h2>Choose one useful pattern</h2><p>Open the original notes below. Work through one example and its explanation. Choose words and forms that the notes have already taught. You do not need to cover every table in one sitting.</p><label htmlFor="practice-meaning">What do you want your sentence to mean?</label><Textarea id="practice-meaning" value={data.meaning||''} onChange={e=>setData({...data,meaning:e.target.value})} placeholder="You can describe the meaning in English."/><Button className="mt-4" onClick={()=>next(1)}>Put the example away and try</Button></>}
    {data.step===1&&<><h2>Build from the pieces you know</h2><p>Close the notes. Use your chosen pattern to express your meaning. If possible, change one taught word from the example. Keep unfamiliar verb forms or word order out of this attempt; reopen the explanation if you need it.</p>{data.meaning&&<p>Your intended meaning: {data.meaning}</p>}<label htmlFor="practice-answer">Your sentence</label><Textarea id="practice-answer" lang={lesson.languageCode} value={data.answer} onChange={e=>setData({...data,answer:e.target.value})} placeholder="Write your sentence here."/><p className="muted">You may practice aloud privately, too. No microphone is required and speaking here is self-reported.</p><div className="guided-actions"><Button disabled={!data.answer.trim()} onClick={()=>next(2)}>Compare with the explanation</Button><Button variant="ghost" onClick={()=>next(0)}>Return to the meaning</Button></div></>}
    {data.step===2&&<><h2>Check one part at a time</h2><p>Reopen the notes. Does your sentence express the intended meaning? Compare the word order and the forms with the taught example. If you are unsure, keep it as a question for the optional tutor or a teacher.</p><p lang={lesson.languageCode} className="guided-example">{data.answer}</p><label htmlFor="practice-revision">Your revision or remaining question (optional)</label><Textarea id="practice-revision" lang={lesson.languageCode} value={data.reviewAnswer||''} onChange={e=>setData({...data,reviewAnswer:e.target.value})}/><p>How much support would you like when you return?</p><RadioGroup value={data.confidence||'soon'} onValueChange={confidence=>setData({...data,confidence})} className="guided-options">{[['again','A worked example'],['soon','A small cue if I need it'],['got-it','Let me try before any cue']].map(([value,label])=><label key={value} htmlFor={`confidence-${value}`}><RadioGroupItem id={`confidence-${value}`} value={value}/>{label}</label>)}</RadioGroup><div className="guided-actions"><Button disabled={completing||draft.saving||!data.answer.trim()} onClick={finish}>{completing?'Saving…':'Save practice and revisit tomorrow'}</Button><Button variant="ghost" onClick={()=>next(1)}>Revise the sentence</Button></div></>}
    {(data.step===3||completed)&&<><h2>Your practice is saved</h2><p>This marks a completed practice activity, with no correctness or mastery score. Try retrieving the pattern tomorrow and compare it with the explanation.</p><div className="guided-actions">{nextLesson&&<Button onClick={()=>onNavigate(nextLesson.lessonId)}>Next lesson</Button>}{prevLesson&&<Button variant="outline" onClick={()=>onNavigate(prevLesson.lessonId)}>Previous lesson</Button>}<Button variant="ghost" onClick={()=>next(0)}>Practice this lesson again</Button></div></>}
    {(draft.error||saveError)&&<div role="alert"><p>{draft.error||saveError}</p><Button variant="outline" onClick={draft.conflict?draft.reload:()=>void draft.save()}>{draft.conflict?'Keep this text and load saved version':'Retry draft save'}</Button></div>}
    {draft.recovered&&<aside className="guided-note"><h3>Your unsaved text</h3><p className="whitespace-pre-wrap">{draft.recovered}</p><Button variant="ghost" onClick={()=>draft.setRecovered('')}>Dismiss recovered text</Button></aside>}
    <div className="guided-foot"><span role="status">{draft.saving?'Saving draft…':draft.saved?'Draft saved to your account':'Draft not yet saved'}</span><Button size="sm" variant="ghost" disabled={draft.saving} onClick={()=>void draft.save()}>Save draft</Button></div>
  </div></section>;
}
