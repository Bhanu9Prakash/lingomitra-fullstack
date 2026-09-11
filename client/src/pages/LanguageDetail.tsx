import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { pathway } from '@shared/pathways';
import { learningApi } from '@/lib/learning-api';
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, ChevronRight, MessageCircle, RotateCcw } from "lucide-react";
import { Language, Lesson, UserProgress } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import FlagIcon from "@/components/FlagIcon";
import MascotMoment from "@/components/MascotMoment";

interface ReviewItem {
  lessonId: string;
  concept: string;
  prompt: string;
  cue: string;
  dueAt: string;
  confidence: "again" | "soon" | "got-it";
}

function lessonNumber(lesson: Lesson) {
  return lesson.orderIndex || Number(lesson.lessonId.match(/(\d+)/)?.[1] || 1);
}

export default function LanguageDetail() {
  const [, parameters] = useRoute("/language/:code");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const languageCode = parameters?.code || "";
  const selected=pathway(languageCode);
  useEffect(()=>{setActiveReview(null);setReviewResponse('');if(selected)void learningApi('/api/user/preferences',{selectedTarget:languageCode},'PATCH').catch(()=>{});},[languageCode]);
  const [reviewResponse, setReviewResponse] = useState("");
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const { data: language, isLoading: isLanguageLoading, error: languageError, refetch: reloadLanguage } = useQuery<Language>({
    queryKey: [`/api/languages/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: lessons = [], isLoading: isLessonLoading, error: lessonError, refetch: reloadLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/languages/${languageCode}/lessons`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: progress = [], error: progressError, refetch: reloadProgress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: [`/api/progress/language/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: reviewData, error: reviewError, refetch: reloadReview } = useQuery<{ items: ReviewItem[] }>({
    queryKey: [`/api/progress/review/due?language=${languageCode}`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });

  const saveReviewMutation = useMutation({
    mutationFn: async ({ item, rating }: { item: ReviewItem; rating: "again" | "soon" | "got-it" }) => {
      const response = await fetch(`/api/progress/review/lesson/${item.lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, answer: reviewResponse }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "We could not save that review.");
      }
      return response.json() as Promise<{ nextReviewAt: string }>;
    },
    onSuccess: ({ nextReviewAt }) => {
      setReviewMessage(`Saved. This idea will return ${new Date(nextReviewAt).toLocaleDateString()}.`);
      setReviewResponse("");
      setActiveReview(null);
      queryClient.invalidateQueries({ queryKey: [`/api/progress/review/due?language=${languageCode}`] });
    },
    onError: (error: Error) => setReviewMessage(error.message),
  });

  const sortedLessons = useMemo(() => [...lessons].sort((a, b) => a.orderIndex - b.orderIndex), [lessons]);
  const completedLessonIds = new Set(progress.filter((record) => record.completed).map((record) => record.lessonId));
  const nextLesson = sortedLessons.find((lesson) => !completedLessonIds.has(lesson.lessonId)) || sortedLessons.at(-1);
  const percent = sortedLessons.length ? Math.round((completedLessonIds.size / sortedLessons.length) * 100) : 0;
  const reviewItems = reviewData?.items || [];

  if (isLanguageLoading || isLessonLoading || progressLoading) {
    return <main className="studio-page"><div className="studio-shell"><p aria-live="polite">Preparing your learning space…</p></div></main>;
  }
  if(languageError||lessonError)return <main className="guided-shell"><h1>Course temporarily unavailable</h1><p role="alert">We could not load this course. Your saved learning has not been reset.</p><Button onClick={()=>{reloadLanguage();reloadLessons();}}>Try again</Button><Link href="/languages">All languages</Link></main>;
  if (!language) {
    return <main className="studio-page"><div className="studio-shell"><h1>Language not found</h1><Button onClick={() => navigate("/languages")}>Choose a language</Button></div></main>;
  }

  return (
    <main className="studio-page">
      <div className="studio-shell space-y-8">
        <header className="today-header">
          <div className="today-language">
            <FlagIcon code={language.flagCode} size={42} />
            <div>
              <p className="eyebrow">Your {language.name} workspace</p>
              <h1>Today, build one useful sentence.</h1>
              <p>Your original course completion is preserved. Assessed starter skills and saved drafts appear on Today.</p>
            </div>
          </div>
          <MascotMoment state="neutral" className="today-mascot" alt="The LingoMitra fox ready to learn" />
        </header>

        {progressError&&<div role="alert"><p>Your saved completion could not load. The course remains open.</p><Button onClick={()=>reloadProgress()}>Retry completion history</Button></div>}
        {selected&&<section className="starter-path"><p className="eyebrow">{selected.name} starter · English explanations</p><h2>Build your first useful sentences</h2><ol>{selected.starters.map((id,i)=><li key={id}><span>{String(i+1).padStart(2,'0')}</span><Link href={`/learn/${id}`}>{selected.titles[i]}</Link></li>)}</ol><p>Optional hints, language-specific checks, and a saved return path. Original course notes stay below.</p><Link href="/dashboard">See your saved evidence and reviews</Link></section>}
        <section className="today-grid" aria-label="Today’s learning actions">
          <Card className="today-primary">
            <CardContent>
              <div>
                <p className="eyebrow">Continue learning</p>
                <h2>{nextLesson ? nextLesson.title : "Your course is ready"}</h2>
                <p>{nextLesson ? "Open the notes and choose one taught pattern to practice." : "Choose a course to begin your first activity."}</p>
              </div>
              {nextLesson ? (
                <Button size="lg" onClick={() => navigate(`/${languageCode}/lesson/${lessonNumber(nextLesson)}`)}>
                  Open lesson <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="today-action">
            <CardContent>
              <RotateCcw aria-hidden="true" />
              <div>
                <p className="eyebrow">Due review</p>
                <h2>{reviewError?"Review unavailable":reviewItems.length ? `${reviewItems.length} idea${reviewItems.length === 1 ? "" : "s"} due` : "Nothing due yet"}</h2>
                <p>{reviewItems.length ? "Recall one process in a fresh context." : "Complete a lesson and choose a review state to build your queue."}</p>
              </div>
              {reviewError&&<Button variant="outline" onClick={()=>reloadReview()}>Retry review queue</Button>}{reviewItems.length ? <Button variant="outline" onClick={() => setActiveReview(reviewItems[0])}>Start review</Button> : null}
            </CardContent>
          </Card>

          <Card className="today-action">
            <CardContent>
              <MessageCircle aria-hidden="true" />
              <div>
                <p className="eyebrow">Conversation practice</p>
                <h2>Use a sentence in context</h2>
                <p>Choose a situation, then speak or type your way through it.</p>
              </div>
              <Button variant="outline" onClick={() => navigate(`/conversation?language=${encodeURIComponent(languageCode)}`)}>Speak or type</Button>
            </CardContent>
          </Card>
        </section>

        {activeReview ? (
          <section className="review-workbench" aria-labelledby="review-title">
            <div>
              <p className="eyebrow">Self-practice review</p><p>This response is saved as practice. Your rating sets the next reminder; it is not a correctness or mastery score.</p>
              <h2 id="review-title">{activeReview.concept}</h2>
              <p>{activeReview.prompt}</p>
            </div>
            <label htmlFor="review-response">Your recalled sentence</label><Textarea id="review-response" lang={languageCode} value={reviewResponse} onChange={(event) => setReviewResponse(event.target.value)} placeholder="Write or say your new sentence, then jot down what you said…" />
            <Accordion type="single" collapsible className="review-cue"><AccordionItem value="cue"><AccordionTrigger>Need a cue?</AccordionTrigger><AccordionContent><p>{activeReview.cue}</p></AccordionContent></AccordionItem></Accordion>
            <div className="review-ratings">
              {(["again", "soon", "got-it"] as const).map((rating) => (
                <Button
                  key={rating}
                  variant={rating === "got-it" ? "default" : "outline"}
                  disabled={!reviewResponse.trim() || saveReviewMutation.isPending}
                  onClick={() => saveReviewMutation.mutate({ item: activeReview, rating })}
                >
                  {rating === "got-it" ? "Got it · 14 days" : rating === "soon" ? "Soon · 3 days" : "Again · tomorrow"}
                </Button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setActiveReview(null)}>Not now</Button>
          </section>
        ) : null}
        {reviewMessage ? <p className="form-success" role="status">{reviewMessage}</p> : null}

        <section className="course-outline">
          <div className="outline-heading">
            <div>
              <p className="eyebrow">Course outline</p>
              <h2>{progressError?"Completion history unavailable":`${completedLessonIds.size} of ${sortedLessons.length} course activities completed`}</h2>
            </div>
            {!progressError&&<span>{percent}% completed</span>}
          </div>
          {!progressError&&<Progress value={percent} aria-label="Course completion, not mastery" />}
          <div className="lesson-outline-list">
            {sortedLessons.map((lesson) => {
              const completed = completedLessonIds.has(lesson.lessonId);
              return (
                <Button variant="ghost" key={lesson.lessonId} className="outline-lesson" onClick={() => navigate(`/${languageCode}/lesson/${lessonNumber(lesson)}`)}>
                  {completed ? <CheckCircle2 aria-label="Completed" /> : <BookOpen aria-hidden="true" />}
                  <span><strong>{lesson.title}</strong><small>{progressError?"Open course notes":completed ? "Practice completed" : "Open course notes and self-practice"}</small></span>
                  <ChevronRight aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}