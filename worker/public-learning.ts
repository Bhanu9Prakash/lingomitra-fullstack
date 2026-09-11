import { z } from 'zod';
import { activities, activity, publicStep } from './learning-content';
import { grade } from './learning-validator';
import { body, HttpError, json } from './core';

// No account data, provider calls, or database writes. Public correctness is practice,
// never a verified account ability claim. Each response contains one current step.
export async function publicLearningRoute(request:Request):Promise<Response|null>{
 if(new URL(request.url).pathname!=='/api/public/learning'||request.method!=='POST')return null;
 const d=z.object({activityId:z.string().max(100),stepIndex:z.number().int().min(0).max(80),kind:z.enum(['step','attempt','hint','reveal']),answer:z.string().max(2000).optional(),hintLevel:z.number().int().min(0).max(10).optional()}).strict().parse(await body(request));
 const a=activity(d.activityId);if(!a||!activities.includes(a))throw new HttpError(404,'Choose an available language starter.');
 const s=a.steps[d.stepIndex];if(!s)throw new HttpError(400,'This step is unavailable. Reopen the starter.');
 if(d.kind!=='step'&&!['construct','context','understand'].includes(s.kind))throw new HttpError(400,'This step already has its explanation.');
 const feedback=d.kind==='attempt'?grade(s,d.answer||''):undefined;
 if(feedback){feedback.independent=false;feedback.evidence=feedback.correct&&s.kind==='understand'?'recognized':feedback.correct?'supported':'attempted';if(feedback.correct)feedback.message='That message works. Try a different combination next.';delete feedback.semanticKey;}
 const level=d.kind==='reveal'?99:Math.min((d.hintLevel||0)+1,s.hints?.length||1);
 return json({activityId:a.id,title:a.title,languageCode:a.languageCode,audioLocale:a.audioLocale,script:a.script,contentVersion:a.version,reviewStatus:a.reviewStatus,stepIndex:d.stepIndex,totalSteps:a.steps.length,step:publicStep(s),nextActivityId:a.nextActivityId,...(feedback?{feedback}:{}),...(['hint','reveal'].includes(d.kind)?{help:{level,text:level===99?s.answer:s.hints?.[level-1]||'You may ask for a complete example.'}}:{})});
}
