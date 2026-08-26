import { ArrowDown, ArrowRight, Check, Ear, Lightbulb, MessageSquareText, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import MascotMoment from "./MascotMoment";

export default function Hero() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const beginLearning = () => {
    navigate(user ? "/languages" : "/auth?tab=register&returnTo=%2Flanguages");
  };

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-shell landing-grid">
          <div className="landing-copy">
            <p className="eyebrow">A warm studio for language thinking</p>
            <h1>Build sentences by <em>thinking.</em></h1>
            <p className="landing-lede">LingoMitra helps you notice a pattern, predict the next sentence, and reuse the same reasoning in a fresh context.</p>
            <div className="landing-actions">
              <Button size="lg" onClick={beginLearning}>Start learning <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See how it works <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="landing-note">No streak pressure. Progress comes from completed learning activity.</p>
          </div>

          <div className="hero-workbench" aria-label="The LingoMitra learning loop">
            <div className="hero-workbench-label"><Sparkles aria-hidden="true" /> A lesson in motion</div>
            <div className="hero-mascot-stage">
              <MascotMoment state="thinking" className="landing-mascot" alt="The LingoMitra fox thinking through a sentence" />
            </div>
            <div className="hero-prompt hero-prompt-notice">
              <span>01</span>
              <div><strong>Notice</strong><small>What changed?</small></div>
            </div>
            <div className="hero-prompt hero-prompt-predict">
              <span>02</span>
              <div><strong>Predict</strong><small>Say it first</small></div>
            </div>
            <div className="hero-prompt hero-prompt-reuse">
              <span>03</span>
              <div><strong>Reuse</strong><small>New context</small></div>
            </div>
            <div className="hero-loop-line" aria-hidden="true"><span /></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="method-section">
        <div className="landing-shell">
          <div className="method-heading">
            <div>
              <p className="eyebrow">The LingoMitra method</p>
              <h2>One small loop, repeated with purpose.</h2>
            </div>
            <p className="method-intro">Each lesson makes you construct an answer before revealing support. The effort is the learning.</p>
          </div>
          <ol className="method-sequence">
            <li><span>01</span><Lightbulb aria-hidden="true" /><h3>Notice</h3><p>Find one contrast or pattern that makes a sentence work.</p></li>
            <li><span>02</span><Ear aria-hidden="true" /><h3>Predict</h3><p>Pause, say your answer aloud, and construct it before coaching appears.</p></li>
            <li><span>03</span><MessageSquareText aria-hidden="true" /><h3>Reuse</h3><p>Transform the same idea in varied contexts, then meet it again in review.</p></li>
          </ol>
        </div>
      </section>

      <section className="practice-section">
        <div className="landing-shell practice-panel">
          <MascotMoment state="coach" className="practice-mascot" alt="The LingoMitra fox coaching a learner" />
          <div className="practice-copy">
            <p className="eyebrow">Built for durable learning</p>
            <h2>Less scrolling. More constructing.</h2>
            <p>The product stays quiet while you think, then gives support exactly when it is useful.</p>
            <ul>
              <li><Check aria-hidden="true" /> Pause before the answer appears</li>
              <li><Check aria-hidden="true" /> Speak or type a genuine attempt</li>
              <li><Check aria-hidden="true" /> Review according to confidence</li>
            </ul>
          </div>
          <Button size="lg" onClick={beginLearning}>Choose a language <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>
    </main>
  );
}
