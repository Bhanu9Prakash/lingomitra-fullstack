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
    <div className="container mx-auto px-4 pt-6 pb-16 max-w-4xl mb-32">
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">About LingoMitra</h1>
          <p className="text-xl mb-6">
            <span className="font-semibold">LingoMitra helps you build useful sentences.</span>
            <br />Understand a small pattern, practice it with support, and retrieve it later. Understanding and memory work together through practice.
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
                We want a beginner to understand enough to produce a new sentence. The opening lessons in all seven languages pair original explanations with bounded sentence checks. The existing courses remain available as notes and self-practice while we improve them incrementally.
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
                role="link" tabIndex={0} onKeyDown={event => { if(event.key==='Enter')navigate(`/language/${language.code}`); }} onClick={() => navigate(`/language/${language.code}`)}
              >
                <CardContent className="p-5 flex items-center space-x-4">
                  <div className="w-14 h-14 relative flex-shrink-0">
                    <FlagIcon code={language.flagCode} size={56} />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{language.name}</h3>
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
                <p>Each language’s starter introduces one small idea at a time. Broader course notes can be studied in smaller portions.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Real-time chat</h3>
                <p>Optional AI coaching can discuss an attempt. Authored lesson checks and saved learning work without an AI connection.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-bold mb-2">Speak or type</h3>
                <p>Type a sentence or practice aloud privately. Optional recorded messages are transcribed for you to check; this is not a pronunciation score.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">5</span>
                </div>
                <h3 className="font-bold mb-2">See what you can do</h3>
                <p>New starter records distinguish help, independent combinations and later retrieval. Course completion and activity calendars remain separate.</p>
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
                  Understanding with practice
                </h3>
                <p>Meet a useful meaning and form together, try a new combination, and request a cue or complete answer whenever you need it.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  Personalised chat
                </h3>
                <p>Chat history helps the optional tutor continue a discussion. It is not a validated model of everything you know.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  True mobility
                </h3>
                <p>Add a shortcut from Settings when your device supports installation. Internet is required to load lessons and sync your learning.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/60">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2 flex items-center">
                  <Badge variant="outline" className="mr-2 bg-primary/10">Feature</Badge>
                  Free and unlocked
                </h3>
                <p>Every lesson is available to every learner. Sign in with ChatGPT to save your progress and continue across devices.</p>
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
                Make patient language practice freely available, with support that gradually becomes less necessary.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join the journey</h2>
          <p className="max-w-2xl mx-auto mb-6">
            Start with a useful request, then build new combinations. A first sentence is a beginning; fluency needs sustained exposure, practice and real communication.
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
              onClick={() => navigate('/auth?returnTo=%2Fdashboard')}
            >
              Continue with ChatGPT
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
