import type { TeachingStep } from '../../shared/learning';
export type LanguageCode='de'|'es'|'fr'|'hi'|'zh'|'ja'|'kn';
export type AnswerVariant={text:string;key?:string;detail?:string;modality?:'native-script'|'romanized'};
export type Validation={language:LanguageCode;key:string;accepted:AnswerVariant[];misconceptions?:{match:string;category:string;message:string}[];requires?:string[]};
export type AuthoredStep=TeachingStep & {
 target?:import('./german-v1').TaskTarget; validation?:Validation;
 hints?:string[];answer?:string;correctOption?:string;exposures?:string[];
 newContext?:boolean;independentEligible?:boolean;
};
export type Activity={id:string;title:string;outcome:string;linkedLessonId:string;version:string;reviewStatus:string;prerequisites:string[];nextActivityId?:string;steps:AuthoredStep[];review:AuthoredStep[];review7?:AuthoredStep[];languageCode?:LanguageCode;teachingLanguage?:'en';script?:string;audioLocale?:string;legacyIds?:string[];structures?:string[];category?:'word-practice';targetSenseId?:string};
