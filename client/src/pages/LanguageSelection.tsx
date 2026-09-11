import { Link } from 'wouter';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { pathways } from '@shared/pathways';
import { useAuth } from '@/hooks/use-auth';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LanguageSelection() {
  const { user } = useAuth();
  const reduced = useReducedMotion() !== false;
  return <main className="studio-page language-catalog"><div className="studio-shell">
    <header className="language-catalog-header"><div className="studio-heading"><p className="eyebrow">Start somewhere useful</p><h1>What would you like to learn?</h1><p>Choose a language and a first step. Every pathway is open.</p></div><p className="catalog-teaching-language">Explanations in English</p></header>
    <AnimatedGroup className="pathway-list library-pathways" variants={{
      container: { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: reduced ? 0 : .025 } } },
      item: { hidden: { opacity: 1, y: reduced ? 0 : 8 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : .24 } } },
    }}>
      {pathways.map(p => <Card key={p.code} className="pathway-card" role="article" aria-labelledby={`pathway-${p.code}`}>
        <CardHeader><div className="pathway-card-title"><h2 id={`pathway-${p.code}`}>{p.name}</h2><span className="pathway-native" lang={p.code}>{p.nativeName}</span></div><p className="pathway-card-meta">3 guided ideas · {p.count} course lessons</p></CardHeader>
        <CardContent><p>{p.titles[0]}</p></CardContent>
        <CardFooter><Button asChild variant="outline"><Link href={user ? `/learn/${p.starters[0]}` : `/try/${p.code}`}>Start {p.name}<ArrowUpRight size={17} aria-hidden="true" /></Link></Button>{user && <Button asChild variant="ghost" size="sm"><Link href={`/language/${p.code}`} aria-label={`Browse the ${p.name} course`}><BookOpen size={16} aria-hidden="true" />Course</Link></Button>}</CardFooter>
      </Card>)}
    </AnimatedGroup>
    <p className="catalog-reading-note">New writing system? Reading support is built into the opening lessons. A microphone is never required.</p>
  </div></main>;
}
