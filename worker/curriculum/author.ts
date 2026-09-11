import type { Activity, AuthoredStep, LanguageCode, AnswerVariant } from './types';
export const finish:AuthoredStep={id:'finish',kind:'finish',title:'Keep this idea for later',text:'You have practised a useful pattern. Your record separates sentences made with help, new independent combinations, and later retrieval. Completion is not mastery. Return tomorrow for a short attempt before the examples reappear.',companion:'We can pick this up next time.'};
export const words=(...items:string[])=>items.map(item=>{const [word,meaning,reading]=item.split('|');return {word,meaning,...(reading?{reading}:{})};});
export const model=(sentence:string,meaning:string,key:string,reading?:string)=>({sentence,meaning,key,reading});
export function teach(id:string,title:string,text:string,items:string[]=[],examples:ReturnType<typeof model>[]=[]):AuthoredStep {
 return {id,kind:'teach',title,text,words:items.length?words(...items):undefined,examples:examples.length?examples.map(({key,...e})=>e):undefined,exposures:examples.map(e=>e.key)};
}
export const prior=(prompt:string):AuthoredStep=>({id:'prior',kind:'prior',title:'Before we start',text:'Can you already say this? Try it if you can, or continue with the box empty. This is a starting point, not a test you need to pass.',prompt,companion:'You can begin with “I don’t know yet”.'});
export function task(code:LanguageCode,id:string,key:string,prompt:string,accepted:(string|AnswerVariant)[],hints:string[],misconceptions:{match:string;category:string;message:string}[]=[],eligible=true):AuthoredStep {
 const variants=accepted.map(x=>typeof x==='string'?{text:x}:x);
 return {id,kind:'construct',title:eligible?'Make a new combination':'Try the pattern',text:eligible?'The examples are put away. Take the time you need.':'Try first. A cue or a complete example is always available.',prompt,answer:variants[0].text,validation:{language:code,key,accepted:variants,misconceptions},hints,independentEligible:eligible};
}
export function meaning(id:string,text:string,options:string[],correct:string,hint:string):AuthoredStep{return {id,kind:'understand',title:'Check the meaning',text,options,correctOption:correct,answer:correct,hints:[hint]};}
export function course(code:LanguageCode,id:string,title:string,outcome:string,legacy:string[],prerequisites:string[],steps:AuthoredStep[],review:AuthoredStep[],review7:AuthoredStep[]=[]):Activity {
 const locales={de:'de-DE',es:'es-ES',fr:'fr-FR',hi:'hi-IN',zh:'zh-CN',ja:'ja-JP',kn:'kn-IN'};
 return {id,languageCode:code,teachingLanguage:'en',audioLocale:locales[code],script:({de:'Latn',es:'Latn',fr:'Latn',hi:'Deva',zh:'Hans',ja:'Jpan',kn:'Knda'})[code],title,outcome,linkedLessonId:legacy[0],legacyIds:legacy,version:code==='de'?'2.0.0':'1.0.0',reviewStatus:'awaiting-human-review',prerequisites,steps:[...steps,finish],review:[...review,finish],review7:review7.length?[...review7,finish]:undefined};
}
