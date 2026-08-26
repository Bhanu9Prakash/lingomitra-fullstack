import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, CircleHelp, Ear, Lightbulb, RotateCcw } from "lucide-react";
import { Lesson } from "@shared/schema";
import { SlideTextButton } from "@/components/kokonut/slide-text-button";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import MascotMoment from "./MascotMoment";

type Confidence = "again" | "soon" | "got-it";

interface LearningLoopProps {
  lesson: Lesson;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  onNavigate: (lessonId: string) => void;
}

function extractNotice(content: string, fallback: string) {
  const match = content.match(/>\s*\*\*Thinking Point:?\s*([^*]+)\*\*\s*([\s\S]{0,420}?)(?=\n\n|###|$)/i);
  if (!match) {
    return `Notice the relationship in “${fallback}.” Do not try to memorize every word yet. Look for the one move the sentence makes.`;
  }
  return `${match[1].trim()}: ${match[2].replace(/[*_`>#]/g, "").replace(/\s+/g, " ").trim()}`;
}

function extractOutcome(lesson: Lesson) {
  const firstHeading = lesson.content.match(/^#{1,3}\s+(.+)$/m)?.[1];
  return firstHeading || lesson.title;
}

export default function LearningLoop({ lesson, nextLesson, prevLesson, onNavigate }: LearningLoopProps) {
  const outcome = useMemo(() => extractOutcome(lesson), [lesson]);
  const notice = useMemo(() => extractNotice(lesson.content, outcome), [lesson.content, outcome]);
  const startedAt = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [predict, setPredict] = useState("");
  const [predictionAttempted, setPredictionAttempted] = useState(false);
  const [practice, setPractice] = useState(["", "", ""]);
  const [checkedPractice, setCheckedPractice] = useState([false, false, false]);
  const [transfer, setTransfer] = useState("");
  const [transferChecked, setTransferChecked] = useState(false);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [weakConcept, setWeakConcept] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const practicePrompts = [
    "Keep the same pattern, but change who is doing the action.",
    "Keep the structure, but move it into a new everyday context.",
    "Say your sentence aloud, then write the shortest version that still carries the idea.",
  ];
  const canContinuePractice = checkedPractice.every(Boolean);
  const accuracy = Math.round(
    ((checkedPractice.filter(Boolean).length + (transferChecked ? 1 : 0)) / 4) * 100,
  );

  const saveLearning = async () => {
    if (!confidence) return;
    setSaving(true);
    setSaveError(null);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const notes = {
      version: 1,
      attempts: 1 + practice.filter(Boolean).length + (transfer ? 1 : 0),
      correct: checkedPractice.filter(Boolean).length + (transferChecked ? 1 : 0),
      confidence,
      weakConcepts: weakConcept ? [outcome] : [],
      completedActivities: ["predict", "practice-1", "practice-2", "practice-3", "transfer", "reflect"],
      review: {
        dueAt: new Date().toISOString(),
        concept: outcome,
        prompt: `Build one new sentence using the idea from “${outcome}.”`,
        cue: notice,
      },
    };

    try {
      const response = await fetch(`/api/progress/lesson/${lesson.lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          completed: true,
          progress: 100,
          score: accuracy,
          timeSpent: elapsedSeconds,
          notes: JSON.stringify(notes),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Your learning activity could not be saved.");
      }
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Your learning activity could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = ["Orient", "Notice", "Predict", "Coach", "Practice", "Transfer", "Reflect"];

  return (
    <section className="learning-loop" aria-labelledby="lesson-outcome">
      <div className="learning-progress-shell">
        <div className="learning-progress-meta">
          <span>Step {Math.min(step, 6) + 1} of {stepLabels.length}</span>
          <strong>{stepLabels[Math.min(step, 6)]}</strong>
        </div>
        <Progress
          className="learning-progress-track"
          value={((Math.min(step, 6) + 1) / stepLabels.length) * 100}
          aria-label="Lesson progress"
          aria-valuetext={`${stepLabels[Math.min(step, 6)]}, step ${Math.min(step, 6) + 1} of ${stepLabels.length}`}
        />
        <div className="learning-progress" aria-hidden="true">
          {stepLabels.map((label, index) => (
            <span key={label} className={index === step ? "is-current" : index < step ? "is-complete" : ""}>{label}</span>
          ))}
        </div>
      </div>

      <TransitionPanel activeIndex={step} className="learning-stage">
        <div className="learning-card learning-orient">
          <MascotMoment state="neutral" alt="The LingoMitra fox ready to learn" />
          <div>
            <p className="eyebrow">One thought at a time</p>
            <h1 id="lesson-outcome">{outcome}</h1>
            <p className="learning-lede">By the end, you will build one useful sentence pattern, then adapt it in a new context.</p>
            <div className="learning-cue"><Ear aria-hidden="true" /> Pause for ten seconds. Say the outcome aloud in your own words.</div>
            <SlideTextButton
              text="Start with the pattern"
              hoverText="Begin the lesson"
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setStep(1)}
            />
          </div>
        </div>

        <div className="learning-card">
          <p className="eyebrow">Notice</p>
          <h2>Look for the move, not a list.</h2>
          <p className="notice-copy">{notice}</p>
          <div className="learning-cue"><Lightbulb aria-hidden="true" /> What stays the same when the subject or context changes?</div>
          <Button onClick={() => setStep(2)}>I see the pattern <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>

        <div className="learning-card">
          <MascotMoment state="thinking" alt="The LingoMitra fox thinking through a sentence" />
          <p className="eyebrow">Predict</p>
          <h2>Build it before you see the coaching.</h2>
          <p>Write or say one sentence that uses the idea. It can be imperfect. The point is to make your reasoning visible.</p>
          <Textarea value={predict} onChange={(event) => setPredict(event.target.value)} placeholder="Write the sentence you would try…" className="learning-textarea" />
          <div className="learning-cue"><Ear aria-hidden="true" /> Pause. Say your answer aloud once before continuing.</div>
          {predictionAttempted ? (
            <div className="retry-row">
              <Button variant="outline" onClick={() => setPredictionAttempted(false)}><RotateCcw className="mr-2 h-4 w-4" /> Try once more</Button>
              <Button onClick={() => setStep(3)}>Show the coaching <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          ) : (
            <Button disabled={!predict.trim()} onClick={() => setPredictionAttempted(true)}>Check my reasoning</Button>
          )}
        </div>

        <div className="learning-card coach-card">
          <MascotMoment state="coach" alt="The LingoMitra fox offering coaching" />
          <p className="eyebrow">Coach</p>
          <h2>Compare your construction step by step.</h2>
          <ol className="reasoning-steps">
            <li><strong>Choose the meaning first.</strong> Start with what you want the listener to understand.</li>
            <li><strong>Use the pattern you noticed.</strong> Keep the structural move stable before adding detail.</li>
            <li><strong>Say it in context.</strong> A useful sentence can sound simple; clarity comes before polish.</li>
          </ol>
          <div className="learning-cue"><CircleHelp aria-hidden="true" /> Need a hint? Re-read the Notice card and identify the one part that changes.</div>
          <Button onClick={() => setStep(4)}>Practice the same move differently <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>

        <div className="learning-card">
          <p className="eyebrow">Practice</p>
          <h2>Three small transformations.</h2>
          <p>Each prompt reuses the same process in a different way. Give a genuine attempt before you check your reasoning.</p>
          <div className="practice-stack">
            {practicePrompts.map((prompt, index) => (
              <article key={prompt} className={`practice-item ${checkedPractice[index] ? "is-checked" : ""}`}>
                <span>{index + 1}</span>
                <div>
                  <h3>{prompt}</h3>
                  <Textarea
                    value={practice[index]}
                    onChange={(event) => setPractice((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
                    placeholder="Write your attempt…"
                    disabled={checkedPractice[index]}
                  />
                  {checkedPractice[index] ? (
                    <p className="practice-feedback"><CheckCircle2 aria-hidden="true" /> Good work: you made the process visible. Keep the pattern and vary one part at a time.</p>
                  ) : (
                    <Button variant="outline" size="sm" disabled={!practice[index].trim()} onClick={() => setCheckedPractice((current) => current.map((value, valueIndex) => valueIndex === index ? true : value))}>Check my reasoning</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <Button disabled={!canContinuePractice} onClick={() => setStep(5)}>Use it in a new context <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>

        <div className="learning-card">
          <p className="eyebrow">Transfer</p>
          <h2>One new-context challenge.</h2>
          <p>Imagine a situation that did not appear in the lesson. Build one sentence that uses the same reasoning move.</p>
          <Textarea value={transfer} onChange={(event) => setTransfer(event.target.value)} placeholder="Your new-context sentence…" className="learning-textarea" />
          {!transferChecked ? (
            <Button disabled={!transfer.trim()} onClick={() => setTransferChecked(true)}>Check my reasoning</Button>
          ) : (
            <div className="transfer-feedback">
              <CheckCircle2 aria-hidden="true" />
              <div><strong>You transferred the process.</strong><p>If it felt slow, that is useful information, not a failure. Choose a review state below.</p></div>
              <Button onClick={() => setStep(6)}>Reflect and save <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}
        </div>

        <div className="learning-card">
          {saved ? <MascotMoment state="celebrate" alt="The LingoMitra fox celebrating a completed learning activity" /> : <MascotMoment state="retry" alt="The LingoMitra fox inviting another try" />}
          <p className="eyebrow">Reflect</p>
          <h2>{saved ? "Your learning activity is saved." : "How did that pattern feel?"}</h2>
          {saved ? (
            <>
              <p>We saved your real activity time, {accuracy}% self-checked reasoning coverage, and a review cue. No perfect score was invented.</p>
              <div className="lesson-next-actions">
                {nextLesson ? <Button onClick={() => onNavigate(nextLesson.lessonId)}>Continue to {nextLesson.title} <ChevronRight className="ml-2 h-4 w-4" /></Button> : null}
                {prevLesson ? <Button variant="outline" onClick={() => onNavigate(prevLesson.lessonId)}>Review the previous lesson</Button> : null}
              </div>
            </>
          ) : (
            <>
              <p>Choose the state that honestly describes what you would like to do next. This controls when the review returns.</p>
              <AnimatedBackground
                className="confidence-grid"
                defaultValue={confidence ?? undefined}
                onValueChange={(value) => setConfidence(value as Confidence)}
                role="radiogroup"
                aria-label="How difficult was this lesson?"
              >
                {([
                  ["again", "Again", "Bring this idea back soon with extra support."],
                  ["soon", "Soon", "A short revisit will help the pattern settle."],
                  ["got-it", "Got it", "Keep it in rotation, with more space before the next review."],
                ] as const).map(([value, label, description]) => (
                  <button key={value} data-id={value} type="button" role="radio" aria-checked={confidence === value} className={`confidence-option ${confidence === value ? "is-selected" : ""}`}>
                    <strong>{label}</strong><span>{description}</span>
                  </button>
                ))}
              </AnimatedBackground>
              <label className="weak-concept-toggle"><input type="checkbox" checked={weakConcept} onChange={(event) => setWeakConcept(event.target.checked)} /> Save this idea as one to revisit</label>
              {saveError ? <p className="form-error" role="alert">{saveError}</p> : null}
              <Button size="lg" disabled={!confidence || saving} onClick={saveLearning}>{saving ? "Saving your learning…" : "Save reflection"}</Button>
            </>
          )}
        </div>
      </TransitionPanel>
    </section>
  );
}
