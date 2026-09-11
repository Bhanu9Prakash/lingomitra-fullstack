import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Bookmark, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import LearningLanguagePicker from '@/components/LearningLanguagePicker';
import { useLearningScope } from '@/hooks/use-learning-scope';
import { learningApi } from '@/lib/learning-api';
import type { WordsSummary, WordRecord, WordDetail } from '@shared/words';
import type { LearningSummary } from '@shared/learning';

function evidence(w: WordRecord) {
  return w.retrievedLater ? 'Recalled on a later visit' : w.recalled ? 'Recalled in practice' : w.usedInContext ? (w.supported ? 'Used with support' : 'Used in a sentence') : w.recognized ? 'Meaning recognized' : w.encountered ? 'Seen in your learning' : 'From the lesson collection';
}
export default function Words() {
  const { code, selected, select, error: preferenceError, user } = useLearningScope();
  const cache = useQueryClient();
  const [search, setSearch] = useState(''), [filter, setFilter] = useState('encountered');
  const [opened, setOpened] = useState<WordRecord | null>(null), [detail, setDetail] = useState<WordDetail | null>(null), [detailError, setDetailError] = useState('');
  const [delivery, setDelivery] = useState(''), [deliveryError, setDeliveryError] = useState(''), [deliveryRetry, setDeliveryRetry] = useState(0);
  const [bookmarkBusy, setBookmarkBusy] = useState(''), [bookmarkError, setBookmarkError] = useState('');
  const opener = useRef<HTMLButtonElement | null>(null);
  const detailRequest = useRef(0);
  const { data, error, isLoading, refetch } = useQuery<WordsSummary>({ queryKey: ['/api/words', code, user?.id], queryFn: () => learningApi('/api/words?language=' + code), enabled: Boolean(selected) });
  const summary = useQuery<LearningSummary>({ queryKey: ['/api/learning/summary', code, user?.id], queryFn: () => learningApi('/api/learning/summary?language=' + code), enabled: Boolean(selected) });
  const visible = (data?.words || []).filter(w => (filter === 'all' || filter === 'saved' && w.saved || filter === 'due' && w.dueAt && Date.parse(w.dueAt) <= Date.now() || filter === 'encountered' && w.encountered) && [w.native, w.meaning, w.reading || ''].some(s => s.normalize('NFC').toLocaleLowerCase().includes(search.normalize('NFC').toLocaleLowerCase().trim())));
  const signature = `${user?.id}:${code}:${visible.map(w => w.senseId).join(',')}`;
  useEffect(() => { setSearch(''); setFilter('encountered'); setOpened(null); detailRequest.current++; }, [code, user?.id]);
  useEffect(() => {
    let current = true;
    setDeliveryError('');
    if (!visible.length) { setDelivery(signature); return; }
    // Do not display an answer-bearing collection until its exposure is saved.
    learningApi('/api/words/exposure', { senseIds: visible.map(w => w.senseId), includeExample: false }).then(() => {
      if (current) { setDelivery(signature); void cache.invalidateQueries({ queryKey: ['/api/learning/summary'] }); }
    }).catch(() => { if (current) setDeliveryError('The word collection couldn’t open safely with your saved practice. Try again.'); });
    return () => { current = false; };
  }, [signature, deliveryRetry]);
  async function open(w: WordRecord, element: HTMLButtonElement) {
    const requestId = ++detailRequest.current;
    opener.current = element; setOpened(w); setDetail(null); setDetailError('');
    try { const result = await learningApi<WordDetail>('/api/words/exposure', { senseIds: [w.senseId], includeExample: true }); if(requestId === detailRequest.current) setDetail(result); }
    catch { if(requestId === detailRequest.current) setDetailError('The example couldn’t load. Your word and saved practice are still here.'); }
  }
  async function bookmark(w: WordRecord) {
    setBookmarkBusy(w.senseId); setBookmarkError('');
    try {
      await learningApi(`/api/words/${w.senseId}/bookmark`, { saved: !w.saved });
      cache.setQueryData<WordsSummary>(['/api/words', code, user?.id], previous => previous && ({ ...previous, words: previous.words.map(x => x.senseId === w.senseId ? { ...x, saved: !w.saved } : x) }));
      if (opened?.senseId === w.senseId) setOpened({ ...w, saved: !w.saved });
      void cache.invalidateQueries({ queryKey: ['/api/user'] });
    } catch { setBookmarkError('This bookmark couldn’t save. Please try again.'); }
    finally { setBookmarkBusy(''); }
  }
  const due = summary.data?.reviews[0];
  return <main className="studio-page"><div className="studio-shell words-workspace">
    <header className="studio-page-heading"><div><p className="eyebrow">Words{selected ? ' / ' + selected.name : ''}</p><h1>Make them yours.</h1><p>Bring words back in useful sentences.</p></div><LearningLanguagePicker code={code} onChange={select} /></header>
    {preferenceError && <p role="status">{preferenceError}</p>}
    {!selected ? <section className="studio-empty"><h2>Choose a language to open your words.</h2></section> : <>
      {summary.error && <p role="alert">Review suggestions couldn’t load. <Button variant="ghost" onClick={() => summary.refetch()}>Try again</Button></p>}
      <section className="words-review-strip"><div><p className="eyebrow">{due ? 'Ready today' : 'Room to remember'}</p><h2>{due?.title || 'A short return to your learning.'}</h2>{!due && <p>Review suggestions appear after you finish a lesson.</p>}</div><Button asChild variant={due ? 'default' : 'outline'}><Link href={'/practice/' + code}>{due ? 'Review in a sentence' : 'Open practice'}<ArrowRight size={17} aria-hidden="true" /></Link></Button></section>
      <section aria-labelledby="word-list-title"><div className="words-list-heading"><h2 id="word-list-title">From your lessons</h2><p>{data ? data.words.filter(w => w.encountered).length + ' words encountered' : 'Loading your collection…'}</p></div>
        <div className="words-tools"><div className="word-search"><Label htmlFor="word-search" className="sr-only">Search words and meanings</Label><Search size={18} aria-hidden="true" /><Input id="word-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words and meanings" /></div><Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Filter word collection"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="encountered">In my learning</SelectItem><SelectItem value="saved">Saved words</SelectItem><SelectItem value="due">Ready to review</SelectItem><SelectItem value="all">All lesson words</SelectItem></SelectContent></Select></div>
        {bookmarkError && <p role="alert">{bookmarkError}</p>}
        {isLoading ? <p className="studio-empty" role="status">Loading your words…</p> : error ? <div className="studio-empty" role="alert"><p>Your word record couldn’t load. It has not been reset.</p><Button onClick={() => refetch()}>Try again</Button></div> : deliveryError ? <div className="studio-empty" role="alert"><p>{deliveryError}</p><Button onClick={() => setDeliveryRetry(v => v + 1)}>Try again</Button></div> : !visible.length ? <div className="studio-empty"><h3>{search ? 'No matching words yet.' : filter === 'encountered' ? 'Your words will gather here.' : filter === 'saved' ? 'Keep a few words close.' : filter === 'due' ? 'Nothing is due right now.' : 'No words to show.'}</h3><p>{filter === 'saved' ? 'Use the bookmark beside a word to find it here later.' : 'Open a lesson, or browse the words it introduces.'}</p><Button variant="outline" onClick={() => { setSearch(''); setFilter('all'); }}>Browse lesson words</Button></div> : delivery !== signature ? <p className="studio-empty" role="status">Opening your word collection…</p> : <ul className="word-list">{visible.map(w => <li key={w.senseId}><Button variant="ghost" className="word-open" onClick={e => void open(w, e.currentTarget)} aria-label={`Open ${w.native}: ${w.meaning}`}><span className="word-native" lang={code}>{w.native}</span><span className="word-meaning">{w.meaning}</span><span className="word-evidence">{evidence(w)}</span><ChevronRight size={18} aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label={`${w.saved ? 'Remove bookmark for' : 'Save'} ${w.native}`} aria-pressed={w.saved} disabled={Boolean(bookmarkBusy)} onClick={() => void bookmark(w)}><Bookmark size={18} fill={w.saved ? 'currentColor' : 'none'} aria-hidden="true" /></Button></li>)}</ul>}
      </section><p className="evidence-note">Recognition, word recall and sentence use are different parts of learning. These records are not a fluency score.</p>
    </>}
    <Dialog open={Boolean(opened)} onOpenChange={open => { if (!open) setOpened(null); }}><DialogContent className="word-detail" onCloseAutoFocus={e => { e.preventDefault(); opener.current?.focus(); }}><DialogTitle lang={opened?.language}>{opened?.native}</DialogTitle><DialogDescription>{opened?.meaning}</DialogDescription>{opened && <>
      {opened.reading && <p className="word-reading">{opened.reading}</p>}
      {opened.grammar && <p>{opened.grammar}</p>}
      <div className="word-evidence-detail"><h3>Your practice so far</h3><dl><div><dt>Recognized the meaning</dt><dd>{opened.recognized ? 'Recorded' : 'Not yet recorded'}</dd></div><div><dt>Recalled the word</dt><dd>{opened.recalled ? 'Recorded' : 'Not yet recorded'}</dd></div><div><dt>Recalled it on a later visit</dt><dd>{opened.retrievedLater ? 'Recorded' : 'Not yet recorded'}</dd></div><div><dt>Used it in a sentence</dt><dd>{opened.usedInContext ? opened.supported ? 'Recorded with support' : 'Recorded' : 'Not yet recorded'}</dd></div></dl></div>
      {opened.forms.length > 1 && <p className="word-forms"><strong>Forms in these lessons: </strong>{opened.forms.map(f => f.native).join(' · ')}</p>}
      {detailError ? <p role="alert">{detailError}</p> : !detail ? <p role="status">Opening the lesson example…</p> : detail.example && <figure className="word-example"><blockquote lang={opened.language}>{detail.example.sentence}</blockquote><figcaption>{detail.example.situation}</figcaption></figure>}
      {opened.practiceHref && <Button asChild><Link href={opened.practiceHref}>Practise this word in a sentence<ArrowRight size={17} aria-hidden="true" /></Link></Button>}
      <div className="word-source"><h3>From your lessons</h3>{opened.lessons.map(l => <Link key={l.activityId} href={'/learn/' + l.activityId}>{l.title}<ChevronRight size={16} aria-hidden="true" /></Link>)}</div>
      <p className="word-review-note">These teaching examples are awaiting language review. Pronunciation is not scored.</p>
    </>}</DialogContent></Dialog>
  </div></main>;
}
