import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import MascotMoment from '@/components/MascotMoment';
import LearningLanguagePicker from '@/components/LearningLanguagePicker';
import { useLearningScope } from '@/hooks/use-learning-scope';
import { learningApi } from '@/lib/learning-api';
import type { LearningSummary } from '@shared/learning';

export default function Today() {
  const { code, selected, select, error: preferenceError, user } = useLearningScope();
  const { data, error, isLoading, refetch } = useQuery<LearningSummary>({ queryKey: ['/api/learning/summary', code, user?.id], queryFn: () => learningApi('/api/learning/summary?language=' + code), enabled: Boolean(selected) });
  const next = data?.activities.find(a => !data.skills.some(s => s.id === a.id && s.completed) && a.id !== data.resume?.id);
  const lead = data?.resume || next || data?.activities[0];
  const following = data?.activities.find(a => a.id !== lead?.id && !data.skills.some(s => s.id === a.id && s.completed));
  const allFinished = data?.activities.every(a => data.skills.some(s => s.id === a.id && s.completed));
  const upcoming = data?.skills.map(s => s.dueAt).filter((d): d is string => Boolean(d) && Date.parse(d!) > Date.now()).sort()[0];
  return <main className="studio-page"><div className="studio-shell today-learning">
    <header className="studio-page-heading"><div><p className="eyebrow">Today{selected ? ' / ' + selected.name : ''}</p><h1>A little more you can say.</h1><p>Pick up where you left off.</p></div><LearningLanguagePicker code={code} onChange={select} /></header>
    {preferenceError && <p role="status">{preferenceError}</p>}
    {!selected ? <section className="studio-empty"><h2>Choose your language above.</h2><p>Your lessons and words stay together in each language.</p></section> : isLoading ? <p className="studio-empty" role="status">Finding your saved place…</p> : error ? <section className="studio-empty" role="alert"><h2>Your learning record couldn’t load.</h2><p>It has not been reset.</p><Button onClick={() => refetch()}>Try again</Button></section> : data && lead && <>
      <Card className="today-continue"><div className="today-continue-copy"><CardHeader><p className="eyebrow">{data.resume ? 'Continue learning' : allFinished ? 'A familiar idea' : 'Your next lesson'}</p><h2>{lead.title}</h2></CardHeader><CardContent><p>{data.resume ? 'Your saved place and sentence are ready.' : 'outcome' in lead ? lead.outcome : selected.outcome}</p></CardContent><CardFooter><Button asChild><Link href={lead.href}>{data.resume ? 'Continue lesson' : allFinished ? 'Open lesson' : 'Begin lesson'}<ArrowRight size={18} aria-hidden="true" /></Link></Button></CardFooter></div><MascotMoment state="neutral" className="today-companion" alt="" /></Card>
      <section className="today-review" aria-labelledby="ready-title"><div><p className="eyebrow">Ready to revisit</p><h2 id="ready-title">{data.reviews.length ? data.reviews.length + (data.reviews.length === 1 ? ' idea is' : ' ideas are') + ' ready for another try.' : upcoming ? 'A little space before your next review.' : 'Your first review comes next.'}</h2><p>{data.reviews.length ? 'Try recalling it first. Help is there whenever you need it.' : upcoming ? 'Your next suggestion is ' + new Date(upcoming).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '. You can practise any time.' : 'Finish a lesson, then come back tomorrow for a short review.'}</p></div><Button asChild variant="outline"><Link href={data.reviews.length ? '/practice/' + code : '/language/' + code}>{data.reviews.length ? 'Open review' : 'Browse all ' + selected.name + ' lessons'}</Link></Button></section>
      <div className="today-next"><span>Next idea</span><Link href={following?.href || '/words/' + code}>{following?.title || 'Bring your words into a sentence'}<ArrowRight size={17} aria-hidden="true" /></Link></div>
    </>}
  </div></main>;
}
