export class LearningError extends Error { constructor(message:string,public status:number){super(message);} }
export async function learningApi<T>(path:string,data?:unknown,method=data===undefined?'GET':'POST'):Promise<T> {
  const response=await fetch(path,{method,credentials:'include',cache:'no-store',keepalive:method!=='GET',...(data===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})});
  const result=await response.json().catch(()=>null);
  if(!response.ok)throw new LearningError(result?.message||'This could not be saved. Keep this page open and try again.',response.status);
  return result as T;
}
export function arrivalTime() {
  try {
    const stored=sessionStorage.getItem('lingomitra-arrival');
    if(stored&&Date.now()-Date.parse(stored)<86400000)return stored;
    const value=new Date().toISOString();sessionStorage.setItem('lingomitra-arrival',value);return value;
  }catch{return new Date().toISOString();}
}

export function guestWasSeen(code:string){try{return Boolean(sessionStorage.getItem('lingomitra-guest-exposure:'+code))||(code==='de'&&sessionStorage.getItem('lingomitra-german-preview')==='water');}catch{return true;}}

export function guestActivities(code:string):string[]{try{const seen=JSON.parse(sessionStorage.getItem('lingomitra-guest-exposure:'+code)||'{}');return Object.keys(seen).filter(k=>Date.now()-Date.parse(seen[k])<86400000);}catch{return [];}}
