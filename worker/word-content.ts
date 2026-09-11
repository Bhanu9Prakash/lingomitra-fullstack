import vocabulary from './curriculum/vocabulary.json';
import type { Activity, AuthoredStep, LanguageCode } from './curriculum/types';

const eligible: Record<string, number[]> = { de:[3,4,5,7,8], es:[3,4,5,6], fr:[2,3,4,5], hi:[5,6,7,12,13,14], zh:[4,5,6,14,15], ja:[1,2,3,4], kn:[4,5,6,7,14,15] };
const contains = (sentence: string, word: string, code: string) => {
  const s=sentence.normalize('NFC').toLocaleLowerCase(), w=word.normalize('NFC').toLocaleLowerCase();
  if(['ja','zh'].includes(code)) return s.includes(w);
  return s.split(/[\s.,!?;:।]+/u).join(' ').includes(w) && new RegExp(`(^|[^\\p{L}\\p{M}])${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^\\p{L}\\p{M}])`,'u').test(s);
};
export const wordKey=(senseId:string)=>`lexical:${senseId}`;
export const wordMatches=(word:{language:string;forms:{native:string}[]},sentence:string)=>word.forms.some(f=>contains(sentence,f.native,word.language));

/** Explicit source-derived senses, not machine translation or generated synonyms. */
export function buildWords(curriculum:Activity[]) {
  return vocabulary.map(v => {
    const forms=v.forms.map(f=>({native:f.native,reading:f.reading}));
    const lessons=curriculum.filter(a=>a.languageCode===v.language&&a.steps.some(s=>s.words?.some(w=>forms.some(f=>f.native===w.word))));
    const candidates=lessons.flatMap(a=>[...a.steps,...a.review,...(a.review7||[])].filter(s=>s.validation&&s.validation.accepted.some(x=>forms.some(f=>contains(x.text,f.native,v.language)))).map(step=>({activity:a,step})));
    const context=candidates[0];
    const enabled=Boolean(context)&&eligible[v.language]?.includes(Number(v.lexemeId.split('.')[2]));
    const firstForm=forms[0];
    const readings=(firstForm.reading||'').split(' · ').map(s=>s.trim()).filter(Boolean);
    const lexical:AuthoredStep={id:'recall-word',kind:'construct',responseMode:'word',title:'Bring back the word',text:'The word and example are put away. Try from memory; help is always available.',prompt:`Write the ${v.language==='fr'?'taught word or phrase':'word or phrase'} for “${v.meaning.en}”.`,answer:firstForm.native,validation:{language:v.language as LanguageCode,key:wordKey(v.senseId),accepted:[{text:firstForm.native},...readings.map(text=>({text}))]},hints:['Think of where you met this word in the lesson.'],independentEligible:true};
    const distractors=vocabulary.filter(x=>x.language===v.language&&x.senseId!==v.senseId&&x.meaning.en!==v.meaning.en&&eligible[x.language]?.includes(Number(x.lexemeId.split('.')[2]))).slice(0,2).map(x=>x.meaning.en);
    const options=[...distractors];options.splice(Number(v.lexemeId.split('.')[2])%3,0,v.meaning.en);
    const recognition:AuthoredStep={id:'recognize-word',kind:'understand',title:'Connect word and meaning',text:`What does ${firstForm.native} mean in this lesson?`,options,answer:v.meaning.en,correctOption:v.meaning.en,hints:['Think of the example you just read.']};
    let practice:Activity|undefined;
    if(enabled&&context){
      const use=(step:AuthoredStep,id:string):AuthoredStep=>({...step,id,kind:'context',responseMode:undefined,title:'Use it in a sentence',text:'Bring the word into the pattern from your lesson.',independentEligible:true,newContext:false,examples:undefined,words:undefined,companion:undefined});
      const contextual=use(context.step,'use-in-sentence');
      const returning=use(candidates.find(c=>c.activity.id===context.activity.id&&c.step.validation?.key!==context.step.validation?.key)?.step||context.step,'return-sentence');
      const study:AuthoredStep={id:'meet-word',kind:'teach',title:'A word with somewhere to go',text:`From “${context.activity.title}”. Read it, then close the example and try.`,words:[{word:firstForm.native,meaning:v.meaning.en,...(firstForm.reading?{reading:firstForm.reading}:{})}],examples:[{sentence:context.step.answer!,meaning:`For this situation: ${context.step.prompt}`}],exposures:[wordKey(v.senseId),context.step.validation!.key]};
      const finish:AuthoredStep={id:'finish',kind:'finish',title:'A word, and a way to use it',text:'Your word recall and sentence practice are saved separately. Come back tomorrow and try before opening the example.'};
      practice={id:`word-${v.senseId}`,title:`Word practice · ${v.meaning.en}`,outcome:'Recall a word, then use it in its lesson pattern.',category:'word-practice',targetSenseId:v.senseId,languageCode:v.language as LanguageCode,teachingLanguage:'en',audioLocale:context.activity.audioLocale,script:context.activity.script,linkedLessonId:context.activity.linkedLessonId,version:'1.0.0',reviewStatus:'awaiting-human-review',prerequisites:[context.activity.id],steps:[study,recognition,lexical,contextual,finish],review:[lexical,returning,finish]};
    }
    return {lexemeId:v.lexemeId,senseId:v.senseId,language:v.language,native:v.lemmaOrPhrase,meaning:v.meaning.en,reading:firstForm.reading||undefined,forms,grammar:v.genderOrClass||undefined,combinations:v.commonCombinations,lessons:lessons.map(a=>({activityId:a.id,lessonId:a.linkedLessonId,title:a.title})),reviewStatus:v.reviewStatus,context,practice};
  });
}
