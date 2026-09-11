import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Volume2, Square } from 'lucide-react';

// Device speech is optional listening support, never a pronunciation score.
export default function LessonAudio({text,language='de-DE'}:{text:string;language?:string}) {
  const [playing,setPlaying]=useState(false),[error,setError]=useState('');
  useEffect(()=>()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();},[]);
  const play=(rate:number)=>{
    if(!('speechSynthesis' in window)){setError('Audio is unavailable on this device. The complete text is here.');return;}
    const voices=window.speechSynthesis.getVoices(),code=language.toLowerCase().split('-')[0];
    const voice=voices.find(v=>v.lang.toLowerCase()===language.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split('-')[0]===code);
    if(!voice){setError('A voice for this language is not available on this device yet. You can retry or continue with the text.');return;}
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);
    utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=rate;utterance.onend=()=>setPlaying(false);
    utterance.onerror=()=>{setPlaying(false);setError('Audio did not play. You can keep learning with the text.');};
    setError('');setPlaying(true);window.speechSynthesis.speak(utterance);
  };
  return <div className="lesson-audio"><Button type="button" size="sm" variant="outline" aria-label="Listen to this example" onClick={()=>play(0.9)}><Volume2 size={16} aria-hidden="true"/> Listen</Button><Button type="button" size="sm" variant="outline" onClick={()=>play(0.65)}>Slower</Button>{playing&&<Button type="button" size="sm" variant="ghost" onClick={()=>{window.speechSynthesis.cancel();setPlaying(false);}}><Square size={14} aria-hidden="true"/> Stop</Button>}<span className="lesson-audio-note">Optional device voice</span>{error&&<p role="status">{error}</p>}</div>;
}
