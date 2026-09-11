export interface Statement {
  bind(...args: unknown[]): Statement;
  first<T = Record<string, any>>(): Promise<T | null>;
  all<T = Record<string, any>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta: { changes: number; last_row_id?: number } }>;
}
export interface Env {
  DB: { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown[]> };
  BUCKET?: { put(key:string,body:any,options?:any):Promise<any>; get(key:string):Promise<any>; delete(key:string | string[]):Promise<any> };
  ASSETS?: { fetch(request:Request):Promise<Response> };
  ADMIN_CHATGPT_USER_IDS?: string;
  OPTIONAL_AI_DAILY_GLOBAL_LIMIT?:string;
  OPENAI_API_KEY?: string;
  OPENAI_CHAT_MODEL?: string;
  OPENAI_TRANSCRIPTION_MODEL?: string;
  OPENAI_TTS_MODEL?: string;
  GEMINI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  GEMINI_MODEL?: string;
}
export type Account = { id:number; chatgptId:string; username:string; email:string; firstName:string; lastName:string; profilePicture:null; isAdmin:boolean; emailVerified:true; ttsEnabled:boolean; ttsAutoPlay:boolean; createdAt:string; preferences:import('../shared/schema').LearningPreferences };
export type Message = { role:'user'|'assistant'; content:string };
