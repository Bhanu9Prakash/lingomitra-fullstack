import type { TeachingStep } from '../shared/learning';
import { activities as germanV1 } from './curriculum/german-v1';
import { german } from './curriculum/german';
import { german as germanV2 } from './curriculum/german-v2';
import { spanish } from './curriculum/spanish';
import { french } from './curriculum/french';
import { hindi } from './curriculum/hindi';
import { mandarin } from './curriculum/mandarin';
import { japanese } from './curriculum/japanese';
import { kannada } from './curriculum/kannada';
import { buildWords } from './word-content';
import wordPracticeV1 from './curriculum/word-practice-v1.json';
export type { Activity, AuthoredStep, LanguageCode } from './curriculum/types';
export type { TaskTarget } from './curriculum/german-v1';
export { semanticKey } from './curriculum/german-v1';
import type { Activity, AuthoredStep } from './curriculum/types';

// These authored keys and feedback rules are Worker-only. Never import into React.
export const archivedActivities:Activity[]=germanV1.map(a=>({...a,languageCode:'de' as const,teachingLanguage:'en' as const,script:'Latn',audioLocale:'de-DE'}));
germanV2.forEach((a,i)=>a.nextActivityId=germanV2[i+1]?.id);
export const activities:Activity[]=[...german,...spanish,...french,...hindi,...mandarin,...japanese,...kannada];
for(const code of ['de','es','fr','hi','zh','ja','kn']){
 const path=activities.filter(a=>a.languageCode===code);
 path.forEach((a,i)=>a.nextActivityId=path[i+1]?.id);
}
// The generator supplies source mappings and future authoring candidates.
// Delivered practice uses this immutable bank so later lesson edits cannot
// silently change a saved 1.0.0 session. Add a new bank/version for revisions.
export const wordActivities:Activity[]=wordPracticeV1 as Activity[];
export const words=buildWords(activities).map(w=>({...w,practice:wordActivities.find(a=>a.targetSenseId===w.senseId)}));
export function activity(id:string,version?:string){return [...activities,...archivedActivities,...germanV2,...wordActivities].find(a=>a.id===id&&(!version||a.version===version));}
export function publicStep(step:AuthoredStep):TeachingStep {
 // Allowlist is intentional: newly authored answer metadata is private by default.
 const {id,kind,title,text,examples,words,prompt,options,companion,responseMode}=step;
 return {id,kind,title,text,...(examples?{examples}:{}),...(words?{words}:{}),...(prompt?{prompt}:{}),...(options?{options}:{}),...(responseMode?{responseMode}:{}),...(companion&&!['construct','context'].includes(kind)?{companion}:{})};
}
