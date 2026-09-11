import type { LearningFeedback } from '../shared/learning';
import type { AuthoredStep, TaskTarget } from './learning-content';
import { semanticKey, activities } from './learning-content';

export function normalizeGerman(value:string) {
  return value.normalize('NFC').trim().toLowerCase().replace(/moechte/g,'möchte').replace(/[.,!?;:„“"“”]/g,'').replace(/\s+/g,' ').trim();
}
function gradeGermanV1(step:AuthoredStep,answer:string):LearningFeedback {
  const fail=(category:string,message:string):LearningFeedback=>({correct:false,category,message,independent:false,evidence:'attempted'});
  if(step.kind==='understand') return answer===step.correctOption?{correct:true,category:'meaning',message:'That meaning fits.',independent:false,evidence:'recognized'}:fail('meaning','Check what the speaker wants the listener to understand. You can ask for a hint.');
  const t:TaskTarget={...step.target!};
  const normalized=normalizeGerman(answer),tokens=normalized.split(' ');
  if(!t.drink&&!t.language) {
    const drink=['Tee','Wasser','Kaffee'].find(x=>tokens.includes(x.toLowerCase()));
    if(drink)t.drink=drink as TaskTarget['drink'];
    t.please=tokens.includes('bitte');
  }
  if(/\bmochte(n)?\b/.test(normalized))return fail('verb-form','The dots change the meaning: möchte is “would like”; mochte is “liked”. You can type moechte for möchte.');
  if(/^(tee|wasser|kaffee)( bitte)?$/.test(normalized)||/^(ich hätte gern|ich würde gern|ich will|könnte ich)\b/.test(normalized))return fail('alternative','That may work as a different request. This checker can assess the taught möchte pattern. Try a full sentence with it, or keep your alternative as unassessed practice.');
  const object=t.drink||t.language;
  if(!object)return fail('vocabulary','Choose one of the drinks we taught: Tee, Wasser or Kaffee.');
  const others=['tee','wasser','kaffee','deutsch','englisch'].filter(x=>x!==object.toLowerCase());
  if(others.some(x=>tokens.includes(x)))return fail('meaning',`Your sentence uses a different drink or language. The prompt asks for ${object}.`);
  if(t.subject==='sie'&&(tokens.includes('du')||tokens.includes('möchtest')))return fail('register','This task uses polite Sie. Use möchten with Sie; du and möchtest belong to an informal version.');
  const verb=t.subject==='sie'?'möchten':'möchte';
  if(tokens.includes(t.subject==='sie'?'möchte':'möchten')||tokens.some(x=>['lerne','trinke','lernst','trinkst','zu'].includes(x)))return fail('verb-form',t.subject==='sie'?'Use möchten with polite Sie. Keep lernen or trinken unchanged at the end.':'After Ich möchte, keep the action as lernen or trinken. This pattern does not use zu.');
  const base=t.question?[verb,t.subject,object.toLowerCase()]:[t.subject,verb,object.toLowerCase()];
  if(t.action)base.push(t.action);
  const actual=tokens.filter(x=>x!=='bitte');
  const starts=t.question?[verb,t.subject]:[t.subject,verb];
  const articles=t.drink?(t.drink==='Wasser'?['','ein']:['','einen']):[''];
  const middles=['','bitte','gern','gerne','bitte gern','bitte gerne','gern bitte','gerne bitte'];
  const variants=articles.flatMap(article=>middles.flatMap(middle=>['','bitte'].filter(end=>!(end&&middle.includes('bitte'))).map(end=>[...starts,middle,article,object.toLowerCase(),t.action||'',end].filter(Boolean).join(' '))));
  if(variants.includes(normalized)) {
    if(t.please&&!tokens.includes('bitte'))return fail('meaning','The request works. Add bitte to include the “please” requested in this task.');
    const result:LearningFeedback={correct:true,category:'target',message:'That sentence expresses the requested meaning.',independent:false,evidence:'supported',semanticKey:semanticKey(t)};
    if((t.subject==='sie'&&!/\bSie\b/.test(answer))||!new RegExp(`\\b${object}\\b`).test(answer)||/^[a-zäöü]/.test(answer.trim()))result.detail='The sentence pattern works. In writing, capitalize the first word, German nouns, and polite Sie.';
    return result;
  }
  if(actual.length===base.length&&[...actual].sort().join(' ')===[...base].sort().join(' '))return fail('word-order',t.question?(actual[0]==='sie'&&actual[1]==='möchten'?'Sie möchten … can check something you heard when spoken with a questioning tone. For the neutral question in this task, put möchten before Sie. Keep the action at the end.':'For this polite question, put möchten before Sie. Keep the action at the end.'):t.action?'Keep Ich möchte at the start, the drink or language next, and the action last.':'Put möchte after Ich, and the drink after möchte.');
  if(!tokens.includes(object.toLowerCase())&&tokens.some(x=>x.startsWith(object.toLowerCase().slice(0,3))))return fail('spelling',`Check the spelling of ${object}. Your intended word may be right.`);
  return fail('unrecognized','I cannot reliably assess this version. You can keep it as unassessed practice or request help. This is a limit of the checker, not a judgment that your sentence is wrong.');
}


export function normalizeAnswer(value:string,language:string) {
 let s=value.normalize(language==='ja'?'NFKC':'NFC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.,!?;:。？！、¿¡।„“”"：]/g,'').replace(/\s+/g,' ').trim();
 if(language==='de')s=s.replace(/moechte/g,'möchte');
 if(language==='zh')s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[1-5]/g,'').replace(/\s/g,'');
 if(language==='ja')s=s.replace(/kōhī/g,'koohii').replace(/\s/g,'');
 if(language==='hi'){
  const aliases:Record<string,string>={mai:'main',mein:'main',hum:'ham',hun:'hoon',huun:'hoon',hu:'hoon',nahi:'nahin',yahan:'yahaan',thik:'theek',tayyar:'taiyaar',taiyar:'taiyaar',thaka:'thakaa',thaki:'thakii',thakee:'thakii',pani:'paanii',paani:'paanii',chai:'chaay',doodh:'duudh',peeta:'piitaa',peeti:'piitii',peete:'piite'};
  s=s.split(' ').map(w=>aliases[w]||w).join(' ');
 }
 if(language==='kn'){
  const aliases:Record<string,string>={neeru:'niiru',neer:'niiru',tī:'tii',tee:'tii',kaapi:'kaafi',coffee:'kaafi',kāfi:'kaafi',haalu:'haalu',bēku:'beeku',beku:'beeku',bēḍa:'beeda',beda:'beeda',bēkā:'beekaa',beka:'beekaa',koḍi:'kodi',dayaviṭṭu:'dayavittu',aṅgaḍiyalli:'angadiyalli'};
  s=s.split(' ').map(w=>aliases[w]||w).join(' ');
 }
 return s;
}
export function grade(step:AuthoredStep,answer:string):LearningFeedback {
 if(!step.validation)return gradeGermanV1(step,answer);
 const v=step.validation,n=normalizeAnswer(answer,v.language);
 const fail=(category:string,message:string):LearningFeedback=>({correct:false,category,message,independent:false,evidence:'attempted'});
 if(v.language==='de'&&/\b(ein|einen)\s+(deutsch|englisch|spanisch)\s+lernen\b/iu.test(n))return fail('article','Use the language name without an indefinite article in this pattern.');
 const match=v.accepted.find(x=>normalizeAnswer(x.text,v.language)===n);
 const modality=/[\u0900-\u097f\u0c80-\u0cff\u3040-\u30ff\u3400-\u9fff]/.test(answer)?'native-script':['hi','kn','zh','ja'].includes(v.language)?'romanized':'native-script';
 if(match)return {correct:true,category:'target',message:'That sentence expresses the requested meaning.',independent:false,evidence:'supported',semanticKey:match.key||v.key,modality,detail:match.detail||(modality==='romanized'?'The message and pattern work in romanized input. Native-script writing and pronunciation are not assessed.':undefined)};
 // Accents in these particular taught words may be a writing issue without changing the requested meaning.
 if(['es','fr'].includes(v.language)){
  const unaccent=(x:string)=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const near=v.accepted.find(x=>unaccent(normalizeAnswer(x.text,v.language))===unaccent(n));
  if(near)return {correct:true,category:'spelling',message:'The intended message is clear.',independent:false,evidence:'supported',semanticKey:near.key||v.key,modality,detail:'The meaning and pattern work. Check the accents in the taught spelling; writing accuracy is recorded separately.'};
 }
 for(const m of v.misconceptions||[])if(new RegExp(m.match,'iu').test(answer)||new RegExp(m.match,'iu').test(n))return fail(m.category,m.message);
 // Exact match to another taught meaning is a meaning mismatch, not an invented grammar error.
 for(const a of activities.filter(a=>a.languageCode===v.language))for(const s of [...a.steps,...a.review,...(a.review7||[])])if(s.validation?.accepted.some(x=>normalizeAnswer(x.text,v.language)===n))return fail('meaning','That is a sentence from the taught patterns, but it communicates a different meaning or role. Check who the message is about, its choice, and whether you are asking or telling.');
 return fail('unrecognized','I cannot reliably assess this version. It may be a valid alternative. Keep it as unassessed practice, or ask for a cue or example.');
}
// A spontaneous but off-task answer can consume a future assessment combination.
export function recognizedKeys(language:string,answer:string):string[]{
 const n=normalizeAnswer(answer,language),keys=new Set<string>();
 for(const a of activities.filter(a=>a.languageCode===language))for(const s of [...a.steps,...a.review,...(a.review7||[])])if(s.validation?.accepted.some(variant=>normalizeAnswer(variant.text,language)===n)){keys.add(s.validation.key);for(const variant of s.validation.accepted)if(variant.key)keys.add(variant.key);}
 return [...keys];
}
