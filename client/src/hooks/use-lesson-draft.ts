import { useEffect, useRef, useState } from 'react';
import { learningApi, LearningError } from '@/lib/learning-api';
import { useAuth } from './use-auth';
export type PracticeDraft={step:number;answer:string;meaning?:string;reviewAnswer?:string;confidence?:string};
const blank:PracticeDraft={step:0,answer:'',meaning:'',reviewAnswer:'',confidence:'soon'};
export function useLessonDraft(lessonId:string) {
 const {user}=useAuth(),key=`lingomitra-practice:${user?.id}:${lessonId}`;
 const [data,setData]=useState<PracticeDraft>(blank),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[conflict,setConflict]=useState(false),[recovered,setRecovered]=useState('');
 const version=useRef(-1),current=useRef(data),savedData=useRef(''),inFlight=useRef(false),live=useRef(true),pending=useRef<{path:string;body:any;method:string}|null>(null);current.current=data;
 const preserve=()=>{try{if(JSON.stringify(current.current)!==savedData.current)sessionStorage.setItem(key,JSON.stringify({data:current.current,at:Date.now()}));}catch{}};
 async function load(){try{const r=await learningApi<{data:PracticeDraft|null;version:number}>(`/api/learning/drafts/${lessonId}`);if(!live.current)return;const d=r.data||blank;version.current=r.version;setData(d);savedData.current=JSON.stringify(d);pending.current=null;setLoaded(true);setError('');setSaved(true);setConflict(false);try{const local=JSON.parse(sessionStorage.getItem(key)||'null');if(local&&Date.now()-local.at<86400000&&JSON.stringify(local.data)!==JSON.stringify(d))setRecovered([local.data.meaning,local.data.answer,local.data.reviewAnswer].filter(Boolean).join('\n'));else sessionStorage.removeItem(key);}catch{}}catch(e){if(live.current)setError((e as Error).message);}}
 useEffect(()=>{live.current=true;void load();return()=>{preserve();live.current=false;};},[lessonId]);
 async function save(finishSeconds?:number){if(!loaded||inFlight.current||conflict)return false;
  const snapshot=current.current;
  const req=pending.current||{path:finishSeconds===undefined?`/api/learning/drafts/${lessonId}`:`/api/learning/finish/${lessonId}`,body:{requestId:crypto.randomUUID(),version:version.current,data:snapshot,...(finishSeconds===undefined?{}:{timeSpent:finishSeconds})},method:finishSeconds===undefined?'PUT':'POST'};
  pending.current=req;inFlight.current=true;setSaving(true);
  try{const r=await learningApi<{version:number;data:PracticeDraft}>(req.path,req.body,req.method);version.current=r.version;savedData.current=JSON.stringify(r.data);pending.current=null;
   if(live.current){if(req.path.includes('/finish/')){if(JSON.stringify(snapshot)!==JSON.stringify(current.current))setRecovered([current.current.meaning,current.current.answer,current.current.reviewAnswer].filter(Boolean).join('\n'));setData(r.data);}setSaved(JSON.stringify(current.current)===savedData.current);setError('');}
   try{if(JSON.stringify(current.current)===savedData.current)sessionStorage.removeItem(key);}catch{}return true;
  }catch(e){preserve();if(live.current){setError((e as Error).message);setConflict(e instanceof LearningError&&e.status===409);}return false;}
  finally{inFlight.current=false;if(live.current)setSaving(false);}
 }
 useEffect(()=>{if(!loaded)return;const dirty=JSON.stringify(data)!==savedData.current;setSaved(!dirty);preserve();if(!dirty||error||inFlight.current)return;const timer=setTimeout(()=>void save(),1200);return()=>clearTimeout(timer);},[data,loaded,saving,error]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{preserve();if(loaded&&JSON.stringify(current.current)!==savedData.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[loaded]);
 return {data,setData,loaded,error,saving,saved,save:()=>save(),finish:(seconds:number)=>save(seconds),conflict,recovered,setRecovered,reload:()=>{preserve();setRecovered([current.current.meaning,current.current.answer,current.current.reviewAnswer].filter(Boolean).join('\n'));return load();}};
}
