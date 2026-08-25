import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
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
  const [reviewResponse, setReviewResponse] = useState("");
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const { data: language, isLoading: isLanguageLoading } = useQuery<Language>({
    queryKey: [`/api/languages/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: lessons = [], isLoading: isLessonLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/languages/${languageCode}/lessons`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: [`/api/progress/language/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: Boolean(languageCode),
  });
  const { data: reviewData } = useQuery<{ items: ReviewItem[] }>({
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
        body: JSON.stringify({ rating }),
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

  if (isLanguageLoading || isLessonLoading) {
    return <main className="studio-page"><div className="studio-shell"><p aria-live="polite">Preparing your learning space…</p></div></main>;
  }
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
              <p>Progress only changes when you complete a learning activity—never when you simply open a page.</p>
            </div>
          </div>
          <MascotMoment state="neutral" className="today-mascot" alt="The LingoMitra fox ready to learn" />
        </header>

        <section className="today-grid" aria-label="Today’s learning actions">
          <Card className="today-primary">
            <CardContent>
              <div>
                <p className="eyebrow">Continue learning</p>
                <h2>{nextLesson ? nextLesson.title : "Your course is ready"}</h2>
                <p>{nextLesson ? "One focused pattern, then practice it in context." : "Choose a course to begin your first activity."}</p>
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
                <h2>{reviewItems.length ? `${reviewItems.length} idea${reviewItems.length === 1 ? "" : "s"} due` : "Nothing due yet"}</h2>
                <p>{reviewItems.length ? "Recall one process in a fresh context." : "Complete a lesson and choose a review state to build your queue."}</p>
              </div>
              {reviewItems.length ? <Button variant="outline" onClick={() => setActiveReview(reviewItems[0])}>Start review</Button> : null}
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
              <Button variant="outline" onClick={() => navigate(`/conversation?language=${encodeURIComponent(languageCode)}`)}>Practice speaking</Button>
            </CardContent>
          </Card>
        </section>

        {activeReview ? (
          <section className="review-workbench" aria-labelledby="review-title">
            <div>
              <p className="eyebrow">Productive recall</p>
              <h2 id="review-title">{activeReview.concept}</h2>
              <p>{activeReview.prompt}</p>
            </div>
            <Textarea value={reviewResponse} onChange={(event) => setReviewResponse(event.target.value)} placeholder="Write or say your new sentence, then jot down what you said…" />
            <details><summary>Need a cue?</summary><p>{activeReview.cue}</p></details>
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
              <h2>{completedLessonIds.size} of {sortedLessons.length} learning activities completed</h2>
            </div>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} />
          <div className="lesson-outline-list">
            {sortedLessons.map((lesson) => {
              const completed = completedLessonIds.has(lesson.lessonId);
              return (
                <button key={lesson.lessonId} className="outline-lesson" onClick={() => navigate(`/${languageCode}/lesson/${lessonNumber(lesson)}`)}>
                  {completed ? <CheckCircle2 aria-label="Completed" /> : <BookOpen aria-hidden="true" />}
                  <span><strong>{lesson.title}</strong><small>{completed ? "Completed through practice" : "Open learning activity"}</small></span>
                  <ChevronRight aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}