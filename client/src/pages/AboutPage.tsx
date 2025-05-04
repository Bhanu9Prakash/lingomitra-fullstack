import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Language } from '@shared/schema';
import FlagIcon from '@/components/FlagIcon';
import { getQueryFn } from '@/lib/queryClient';

export default function AboutPage() {
  const [, navigate] = useLocation();
  
  // Fetch available languages
  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
    queryFn: getQueryFn()
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mb-20">
      <div className="space-y-6">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">About LingoMitra</h1>
          <p className="text-xl mb-6">
            <span className="font-semibold">LingoMitra is your AI-powered language wing-mate.</span>
            <br />We blend human-style coaching with the speed and scale of large language models so you can <em>think</em> in a new language rather than memorising disconnected phrases.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/languages')}
            className="mt-4"
          >
            Start Learning Now
          </Button>
        </section>

        <Separator />

        <section>
          <h2 className="text-2xl font-bold mb-4">Why we built it</h2>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-lg">
                Most apps talk <em>at</em> learners; we wanted one that talks <em>with</em> them. By turning every lesson into a chat-based, Socratic exchange, LingoMitra recreates the feeling of a patient tutor across the table without rigid schedules or high hourly fees.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Available Languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {languages?.map((language) => (
              <Card 
                key={language.code}
                className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer border-0 bg-background/60"
                onClick={() => navigate(`/language/${language.code}`)}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <FlagIcon code={language.flagCode} size={40} />
                  </div>
                  <div>
                    <h3 className="font-medium">{language.name}</h3>
                    <p className="text-sm text-muted-foreground">{language.code.toUpperCase()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Choose a language</h3>
                <p>German, Spanish, French, Hindi, Kannada, Japanese, Chinese, with more on the way.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">Bite-sized lesson</h3>
                <p>Each session targets a single core idea, explained in plain language and reinforced through mini-drills.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Real-time chat</h3>
                <p>Our AI tutor reviews your answers on the fly and tailors the next prompt to your exact needs.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-bold mb-2">Speak or type</h3>
                <p>Practise out loud via microphone or just type; either way, instant feedback keeps you moving.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">5</span>
                </div>
                <h3 className="font-bold mb-2">Track your streak</h3>
                <p>A streak calendar, per-language progress bars, and badges turn discipline into a game.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-2xl font-bold mb-4">What sets LingoMitra apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  Thinking-first pedagogy
                </h3>
                <p>We teach ideas before forms. You try first, the tutor guides your self-correction.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  Personalised chat
                </h3>
                <p>A private ScratchPad remembers your vocab comfort zone and weak spots, so every reply feels made for you.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  True mobility
                </h3>
                <p>Install as a PWA, cache favourite lessons, and keep learning even when offline.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  Fair upgrade path
                </h3>
                <p>First two lessons in every language stay free forever; deeper content unlocks with a modest Premium tier. No ads, no data resale.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="text-2xl font-bold mb-4">Our mission</h2>
          <Card className="border-0 bg-primary/10">
            <CardContent className="pt-6">
              <p className="text-lg text-center italic">
                Make expert-level language coaching as convenient as texting a friend and as affordable as a daily cup of coffee.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join the journey</h2>
          <p className="max-w-2xl mx-auto mb-6">
            Whether you are deciphering anime dialogue, prepping for a German visa interview, or chatting with grandparents in Kannada, LingoMitra turns every spare five minutes into a micro-immersion session. Create an account, open a lesson, and start thinking in a new tongue today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/languages')}
            >
              Explore Languages
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}