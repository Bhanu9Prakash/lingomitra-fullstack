import { HttpError } from './core';
import type { Env, Message } from './types';
import { dailyLimits, reserveUse, countTokens } from './usage';
export function capabilities(env:Env){return {chat:Boolean(env.OPENAI_API_KEY||env.GEMINI_API_KEY||env.GOOGLE_API_KEY),transcription:Boolean(env.OPENAI_API_KEY),speech:env.OPENAI_API_KEY?'openai':'device',dailyLimits};}
async function providerFetch(url:string,init:RequestInit):Promise<Response>{
  let response:Response;
  try{response=await fetch(url,{...init,signal:AbortSignal.timeout(45_000)});}catch{throw new HttpError(503,'The tutor could not connect. Please try again.');}
  if(!response.ok){console.error('Model provider request failed',response.status);throw new HttpError(response.status===429?429:503,response.status===429?'The tutor is busy. Please try again shortly.':'The tutor is temporarily unavailable. Your saved learning is safe.');}
  return response;
}
export async function reply(env:Env,instructions:string,messages:Message[],uid:number,languageCode='unknown'):Promise<string>{
  if(!capabilities(env).chat)throw new HttpError(503,'AI tutoring is awaiting setup. You can continue with lessons and reviews.');
  await reserveUse(env,uid,'chat');
  const history=messages.slice(-8).map(m=>({role:m.role,content:m.content.slice(0,2000)}));let result='';
  if(env.OPENAI_API_KEY){
    const response=await providerFetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:env.OPENAI_CHAT_MODEL||'gpt-4.1-mini',messages:[{role:'system',content:instructions},...history],max_completion_tokens:600})});
    const data:any=await response.json();result=data.choices?.[0]?.message?.content||'';
    await countTokens(env,uid,data.usage?.prompt_tokens||0,data.usage?.completion_tokens||0,`openai:${env.OPENAI_CHAT_MODEL||'gpt-4.1-mini'}:${languageCode}`);
  }else{
    const response=await providerFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL||'gemini-3.7-flash')}:generateContent`,{method:'POST',headers:{'x-goog-api-key':(env.GEMINI_API_KEY||env.GOOGLE_API_KEY)!,'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:instructions}]},contents:history.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:700}})});
    const data:any=await response.json();result=(data.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('');
    await countTokens(env,uid,data.usageMetadata?.promptTokenCount||0,data.usageMetadata?.candidatesTokenCount||0,`gemini:${env.GEMINI_MODEL||'gemini-3.7-flash'}:${languageCode}`);
  }
  if(!result.trim())throw new HttpError(503,'The tutor returned no response. Please try again.');return result.trim().slice(0,8000);
}
export async function transcribe(env:Env,file:File,uid:number):Promise<string>{
  if(!env.OPENAI_API_KEY)throw new HttpError(503,'Voice input is awaiting setup. Please type your message.');
  if(!file.size||file.size>2*1024*1024)throw new HttpError(400,'Record a shorter audio clip (up to 2 MB). You can type instead.');
  if(!/^audio\/(webm|mp4|mpeg|ogg|wav|x-wav)(;|$)/.test(file.type))throw new HttpError(400,'This recording format is not supported.');
  await reserveUse(env,uid,'transcription');
  const form=new FormData();form.set('file',file);form.set('model',env.OPENAI_TRANSCRIPTION_MODEL||'gpt-transcribe');form.set('response_format','json');
  const response=await providerFetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`},body:form});const result:any=await response.json();
  if(!result.text?.trim())throw new HttpError(422,'No transcript was returned. Your pronunciation was not assessed. Try again or type your message.');return result.text.trim();
}
export async function speech(env:Env,text:string,uid:number):Promise<any>{
  if(!env.OPENAI_API_KEY)return {success:true,provider:'device'};
  try{await reserveUse(env,uid,'speech');}catch(e){if(e instanceof HttpError&&e.status===429)return {success:true,provider:'device'};throw e;}
  const response=await providerFetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:env.OPENAI_TTS_MODEL||'gpt-4o-mini-tts',input:text,voice:'coral',response_format:'wav'})});
  const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {success:true,provider:'openai',audioData:btoa(binary)};
}
