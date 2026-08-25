import { ArrowDown, ArrowRight, Ear, Lightbulb, MessageSquareText } from "lucide-react";
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
            <h1>Build sentences by thinking, not by collecting lists.</h1>
            <p className="landing-lede">LingoMitra helps you notice a pattern, predict the next sentence, and reuse the same reasoning in a fresh context.</p>
            <div className="landing-actions">
              <Button size="lg" onClick={beginLearning}>Start learning <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See how it works <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="landing-note">No streak pressure. Progress comes from completed learning activity.</p>
          </div>
          <div className="landing-mascot-wrap">
            <MascotMoment state="thinking" className="landing-mascot" alt="The LingoMitra fox thinking through a sentence" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="method-section">
        <div className="landing-shell">
          <p className="eyebrow">The LingoMitra method</p>
          <h2>One small loop, repeated with purpose.</h2>
          <div className="method-sequence">
            <article><span>01</span><Lightbulb aria-hidden="true" /><h3>Notice</h3><p>Find one contrast or pattern that makes a sentence work.</p></article>
            <article><span>02</span><Ear aria-hidden="true" /><h3>Predict</h3><p>Pause, say your answer aloud, and construct it before coaching appears.</p></article>
            <article><span>03</span><MessageSquareText aria-hidden="true" /><h3>Reuse</h3><p>Transform the same idea in varied contexts, then meet it again in review.</p></article>
          </div>
        </div>
      </section>
    </main>
  );
}