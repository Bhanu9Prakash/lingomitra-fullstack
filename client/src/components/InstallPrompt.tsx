import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
export default function InstallPrompt(){
  const [location]=useLocation(),[prompt,setPrompt]=useState<any>(null),[status,setStatus]=useState('');
  useEffect(()=>{const handler=(e:Event)=>{e.preventDefault();setPrompt(e);};window.addEventListener('beforeinstallprompt',handler);return()=>window.removeEventListener('beforeinstallprompt',handler);},[]);
  if(location!=='/settings'||!prompt)return null;
  return <section className="install-option"><h2>Keep LingoMitra close</h2><p>Add a shortcut to this device. An internet connection is needed to load lessons, save learning and use the tutor.</p><Button onClick={async()=>{try{await prompt.prompt();await prompt.userChoice;setPrompt(null);}catch{setStatus('Installation did not start. You can keep using this website.');}}}>Add to this device</Button><p role="status">{status}</p></section>;
}
