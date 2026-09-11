import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import MascotMoment from "./MascotMoment";
import SlideTextButton from './kokonut/slide-text-button';

export default function Hero() {
  const { user } = useAuth();


  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-shell landing-grid">
          <div className="landing-copy">
            <p className="eyebrow">A little understanding goes a long way</p>
            <h1>Understand a little.<br />Say something new.</h1>
            <p className="landing-lede">Learn a useful pattern. Make a sentence of your own. Come back and use it again, with help whenever you need it.</p>
            <div className="landing-actions">
              <SlideTextButton text="Choose your language" href={user ? '/dashboard' : '/languages'} className="welcome-primary" />
              <Button size="lg" variant="ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>
                See how it works
              </Button>
            </div>
            <p className="landing-note">Free lessons · English explanations · At your pace</p>
          </div>

          <figure className="hero-welcome">
            <MascotMoment state="neutral" className="landing-mascot" alt="The LingoMitra fox" />
            <figcaption><span className="welcome-rule" aria-hidden="true" />A little help when you need it.<br />Space to think when you don’t.</figcaption>
          </figure>
        </div>
      </section>

      <section id="how-it-works" className="method-section">
        <div className="landing-shell">
          <h2 className="sr-only">How learning works</h2>
          <ol className="method-sequence">
            <li><span aria-hidden="true">01</span><h3>Understand one idea</h3><p>Notice how a useful pattern works, with clear examples.</p></li>
            <li><span aria-hidden="true">02</span><h3>Make it your own</h3><p>Put the pieces together. Ask for help whenever you need it.</p></li>
            <li><span aria-hidden="true">03</span><h3>Use it again</h3><p>Return to the pattern in a different situation.</p></li>
          </ol>
        </div>
      </section>

    </main>
  );
}
