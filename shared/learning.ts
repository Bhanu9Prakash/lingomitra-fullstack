export type StepKind = 'prior' | 'teach' | 'understand' | 'construct' | 'context' | 'finish';
export type TeachingStep = {
  id: string; kind: StepKind; title: string; text: string;
  examples?: { sentence: string; meaning: string; reading?: string }[];
  words?: { word: string; meaning: string; reading?: string }[];
  prompt?: string; options?: string[]; companion?: string; responseMode?: 'word';
};
export type LearningFeedback = {
  correct: boolean; category: string; message: string; independent: boolean;
  evidence: 'recognized' | 'supported' | 'independent' | 'retrieved' | 'reused' | 'attempted' | 'word-recalled' | 'word-retrieved';
  detail?: string; semanticKey?: string; modality?: 'native-script' | 'romanized';
};
export type LearningSession = {
  languageCode?: string; audioLocale?: string; script?: string; id: string; activityId: string; title: string; linkedLessonId: string; version: number;
  contentVersion: string; reviewStatus: string; mode: 'lesson' | 'review';
  step: TeachingStep; stepIndex: number; totalSteps: number; answer: string;
  feedback?: LearningFeedback; help?: { level: number; text: string };
  assisted: boolean; completed: boolean; dueAt: string | null; activeMs: number;
  prerequisiteWarnings: { id: string; title: string }[]; priorKnowledge: string;
  nextActivityId?: string; canAdvance: boolean; beganAt: string;
};
export type LearningSummary = {
  activities: { languageCode?: string; id: string; title: string; outcome: string; linkedLessonId: string; prerequisites: string[]; href: string }[];
  resume: { id: string; title: string; href: string; updatedAt: string } | null;
  reviews: { languageCode?: string; id: string; title: string; href: string; dueAt: string }[];
  skills: { languageCode?: string; id: string; title: string; seen: boolean; recognized: boolean; supported: number; independentCombinations: number; retrievedLater: boolean; contextualReuse: boolean; appliedNewContext: boolean; completed: boolean; dueAt: string | null }[];
};
export type CourseOverview={courses:{languageCode:string;total:number;completed:number;percent:number;hasStarted:boolean;lessons:import('./schema').Lesson[];progress:import('./schema').UserProgress[]}[]};
