import { useEffect, useRef } from 'react';
import type { TeachingStep, LearningFeedback } from '@shared/learning';
import { Textarea } from './ui/textarea';
import { RadioGroup,RadioGroupItem } from './ui/radio-group';
import MascotMoment from './MascotMoment';
import LessonAudio from './LessonAudio';
import { CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
export default function LessonStep({step,language,audioLocale,answer,onAnswer,quiet,help,feedback,onComposition}:{step:TeachingStep;language:string;audioLocale?:string;answer:string;onAnswer:(s:string)=>void;quiet:boolean;help?:{level:number;text:string};feedback?:LearningFeedback;onComposition?:(active:boolean)=>void}){
 const heading=useRef<HTMLHeadingElement>(null),construct=step.kind==='construct'||step.kind==='context';
 useEffect(()=>{heading.current?.focus();onComposition?.(false);},[step.id]);
 return <>
  <p className="eyebrow">{construct?'Your turn':step.kind==='finish'?'Revisit and reuse':'One idea at a time'}</p>
  <h1 id="step-title" tabIndex={-1} ref={heading}>{step.title}</h1><p className="guided-teacher">{step.text}</p>
  {!quiet&&!construct&&step.companion&&!feedback&&<div className="guided-companion"><MascotMoment state="neutral" alt=""/><p>{step.companion}</p></div>}
  {!construct&&step.examples?.map(e=><figure className="guided-example" key={e.sentence}><p className="example-label">An example</p><blockquote lang={language}>{e.sentence}</blockquote>{e.reading&&<p className="reading-guide" lang="en">{e.reading}</p>}<figcaption>{e.meaning}</figcaption><LessonAudio text={e.sentence} language={audioLocale||language}/></figure>)}
  {!construct&&step.words&&<section className="guided-vocabulary" aria-label="New pieces"><h2>New pieces</h2><dl className="guided-words">{step.words.map(w=><div key={w.word}><dt lang={language}>{w.word}</dt>{w.reading&&<dd className="reading-guide">{w.reading}</dd>}<dd>{w.meaning}</dd></div>)}</dl></section>}
  {(construct||step.kind==='prior')&&<div className="guided-entry"><label htmlFor="sentence-answer">{step.prompt}</label><Textarea id="sentence-answer" lang={language} dir="ltr" value={answer} onChange={e=>onAnswer(e.target.value)} onCompositionStart={()=>onComposition?.(true)} onCompositionEnd={()=>onComposition?.(false)} autoComplete="off" autoCorrect="off" spellCheck={false} rows={3} placeholder={step.kind==='prior'?'Optional: what you already know':step.responseMode==='word'?'Your word or phrase':'Your sentence'} aria-describedby="entry-help"/><p id="entry-help" className="muted">{['hi','kn','zh','ja'].includes(language)?'Use the language’s script or the sound guide you learned. Romanized input checks meaning and structure separately from writing the script.':step.responseMode==='word'?'Type the word or phrase.':'Type your sentence.'} You may practise aloud privately. Speaking is not scored here.</p></div>}
  {step.kind==='understand'&&<RadioGroup value={answer} onValueChange={onAnswer} aria-label={step.text} className="guided-options">{step.options?.map((option,i)=><label key={option} htmlFor={`option-${step.id}-${i}`}><RadioGroupItem id={`option-${step.id}-${i}`} value={option}/><span>{option}</span></label>)}</RadioGroup>}
 </>;
}

export function LessonFeedback({help,feedback,quiet}:{help?:{level:number;text:string};feedback?:LearningFeedback;quiet:boolean}) {
 return <>
  {help&&<Alert className="guided-hint" role="status"><Info aria-hidden="true"/><AlertTitle>{help.level===99?'One possible answer':'Thinking cue'}</AlertTitle><AlertDescription><p>{help.text}</p><small>This attempt has support. Try a different message next.</small></AlertDescription></Alert>}
  {feedback&&<Alert className={`guided-feedback ${feedback.correct?'is-correct':''}`} role="status">{feedback.correct?<CheckCircle2 size={20} aria-hidden="true"/>:<Info size={20} aria-hidden="true"/>}<AlertTitle>{feedback.correct?'The message fits':feedback.category==='unrecognized'?'This version needs a closer look':feedback.category==='alternative'?'Another possible expression':'Let’s check this part'}</AlertTitle><AlertDescription><p>{feedback.message}</p>{feedback.detail&&<p>{feedback.detail}</p>}{!quiet&&feedback.independent&&<div className="verified-companion"><MascotMoment state="celebrate" alt=""/><span>You made a new sentence without an in-app hint.</span></div>}</AlertDescription></Alert>}
 </>;
}
