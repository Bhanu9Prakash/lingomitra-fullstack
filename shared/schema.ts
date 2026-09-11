// API types shared by the existing React learning surfaces. Runtime storage lives in db/schema.ts.
export type LearningPreferences={selectedTarget?:string;minimizeCompanion?:boolean;explanationLanguage?:'en';knownLanguages?:string[];nativeLanguage?:string;learningAnalytics?:boolean;savedWordIds?:string[]};
export type User={id:number;chatgptId:string;username:string;email:string;firstName:string;lastName:string;profilePicture:string|null;isAdmin:boolean;emailVerified:boolean;ttsEnabled:boolean;ttsAutoPlay:boolean;createdAt:string;preferences?:LearningPreferences};
export type Language={id:number;code:string;name:string;flagCode:string;speakers:number;isAvailable:boolean};
export type Lesson={id:number;lessonId:string;languageCode:string;title:string;content:string;orderIndex:number};
export type UserProgress={id:number;userId:number;lessonId:string;completed:boolean;completedAt:string|Date|null;progress:number;score:number|null;lastAccessedAt:string|Date;timeSpent:number;notes:string|null};
