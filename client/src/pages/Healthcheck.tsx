import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
export default function Healthcheck(){
  const health=useQuery<{status:string;lessons:number;languages:number}>({queryKey:['/api/health'],retry:false});
  const capabilities=useQuery<{chat:boolean;transcription:boolean;speech:string}>({queryKey:['/api/capabilities'],retry:false});
  return <main className="guided-shell"><h1>Service status</h1><section className="guided-card"><h2>Lessons and saved learning</h2><p role="status">{health.isLoading?'Checking…':health.error?'The learning service could not be reached. Your account has not been reset.':`Service responding: ${health.data?.lessons} course lessons across ${health.data?.languages} languages.`}</p><Button variant="outline" onClick={()=>{health.refetch();capabilities.refetch();}}>Check again</Button><h2 className="mt-6">Optional assistance</h2><p>{capabilities.error?'Optional service status could not load.':capabilities.isLoading?'Checking…':capabilities.data?.chat?'AI tutor is configured. A request may still fail if the provider is unavailable.':'AI tutor is unavailable. Authored lessons and typed sentence practice remain usable.'}</p><p>{capabilities.data?.transcription?'Voice transcription is configured.':'Use typed input; voice transcription is unavailable.'}</p></section><Link href="/languages">Return to learning</Link></main>;
}
