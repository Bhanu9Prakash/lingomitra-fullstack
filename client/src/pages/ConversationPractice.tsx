import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  BriefcaseBusiness,
  HeartPulse,
  House,
  MessageCircle,
  MessageSquareText,
  Mic,
  Play,
  Plane,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { useLocation, useSearch } from "wouter";
import { ConversationSession as ConversationSessionView } from "./ConversationSession";

interface ConversationSession {
  id: number;
  languageCode: string;
  topic: string;
  difficultyLevel: string;
  scenario: string;
  messages: Array<{ role: string; content: string }>;
  duration: number;
  status: string;
  feedback?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Language {
  id: number;
  code: string;
  name: string;
  flagCode: string;
  speakers: number;
  isAvailable: boolean;
}

const conversationTopics = [
  { id: "restaurant", name: "Restaurant", Icon: Utensils, description: "Order with a preference and ask one useful follow-up." },
  { id: "travel", name: "Travel", Icon: Plane, description: "Ask for help while navigating a new place." },
  { id: "business", name: "Work", Icon: BriefcaseBusiness, description: "Introduce an idea or ask a clear question." },
  { id: "shopping", name: "Shopping", Icon: ShoppingBag, description: "Compare options and make a practical choice." },
  { id: "daily", name: "Daily life", Icon: House, description: "Have a simple, natural exchange with a neighbour." },
  { id: "medical", name: "Medical visit", Icon: HeartPulse, description: "Describe a need and ask for the next step." },
];

const difficultyLevels = [
  { value: "beginner", label: "Beginner", description: "Short phrases with time to pause." },
  { value: "intermediate", label: "Intermediate", description: "Link ideas and respond to follow-ups." },
  { value: "advanced", label: "Advanced", description: "Adapt your phrasing to a changing situation." },
];

export default function ConversationPractice() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { data: capability } = useQuery<{chat:boolean}>({queryKey:["/api/capabilities"],queryFn:getQueryFn()});
  const { toast } = useSimpleToast();
  const queryClient = useQueryClient();
  const parameters = useMemo(() => new URLSearchParams(search), [search]);
  const languageFromUrl = parameters.get("language") || "";
  const activeSessionId = Number(parameters.get("session")) || null;
  const [selectedLanguage, setSelectedLanguage] = useState(languageFromUrl);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");

  useEffect(() => {
    setSelectedLanguage(languageFromUrl);
  }, [languageFromUrl]);

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });

  const { data: sessionsData, refetch: refetchSessions } = useQuery<{ sessions: ConversationSession[] }>({
    queryKey: [`/api/conversation/sessions?languageCode=${encodeURIComponent(selectedLanguage)}`],
    queryFn: getQueryFn(),
    enabled: Boolean(selectedLanguage),
  });

  const { data: activeSessionData, isLoading: isLoadingSession } = useQuery<{ session: ConversationSession }>({
    queryKey: [`/api/conversation/sessions/${activeSessionId}`],
    queryFn: getQueryFn(),
    enabled: Boolean(activeSessionId),
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/conversation/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          languageCode: selectedLanguage,
          topic: selectedTopic,
          difficultyLevel: selectedDifficulty,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "We could not start that practice.");
      }
      return response.json() as Promise<{ session: ConversationSession }>;
    },
    onSuccess: ({ session }) => {
      toast({ title: "Conversation ready", description: "Start with one sentence. You can speak or type." });
      refetchSessions();
      navigate(`/conversation?language=${encodeURIComponent(session.languageCode)}&session=${session.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Could not start practice", description: error.message, variant: "destructive" });
    },
  });

  const selectedLanguageData = languages.find((language) => language.code === selectedLanguage);

  if (activeSessionId && isLoadingSession) {
    return (
      <main className="studio-page flex min-h-[55vh] items-center justify-center" aria-live="polite">
        <p className="text-muted-foreground">Opening your conversation practice…</p>
      </main>
    );
  }

  if (activeSessionData?.session) {
    return (
      <ConversationSessionView
        session={activeSessionData.session}
        onBack={() => navigate(`/conversation?language=${encodeURIComponent(activeSessionData.session.languageCode)}`)}
        onComplete={() => {
          queryClient.invalidateQueries({ predicate: query => String(query.queryKey[0]).startsWith('/api/conversation/sessions') });
          navigate(`/conversation?language=${encodeURIComponent(activeSessionData.session.languageCode)}&completed=${activeSessionData.session.id}`);
        }}
      />
    );
  }

  return (
    <main className="studio-page">
      <section className="studio-shell space-y-8">
        <header className="studio-heading">
          <Button
            variant="ghost"
            className="mb-3 -ml-3"
            onClick={() => navigate(selectedLanguage ? `/language/${selectedLanguage}` : "/languages")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to learning
          </Button>
          <p className="eyebrow">Conversation practice</p>
          <h1>Build your next sentence in context.</h1>
          <p>Choose a situation, plan what you want to express, then speak or type it. This is optional AI practice, with no mastery or pronunciation score.</p>
          <p><Button variant="outline" onClick={()=>navigate(selectedLanguage==='de'?'/learn/de-starter-01':selectedLanguage?`/language/${selectedLanguage}`:'/languages')}>Practice with authored lessons and hints</Button></p>
        </header>

        <section className="studio-panel" aria-labelledby="language-choice">
          <h2 id="language-choice" className="studio-section-title">1. Choose a language</h2>
          <RadioGroup className="conversation-languages" value={selectedLanguage} onValueChange={setSelectedLanguage} aria-labelledby="language-choice">
            {languages.map((language) => (
              <Label
                key={language.code}
                htmlFor={`conversation-language-${language.code}`}
                className={`choice-chip ${selectedLanguage === language.code ? "is-selected" : ""}`}
              >
                <RadioGroupItem id={`conversation-language-${language.code}`} value={language.code}/>
                <span>{language.name}</span>
              </Label>
            ))}
          </RadioGroup>
        </section>

        {selectedLanguage && (
          <section className="studio-panel" aria-labelledby="topic-choice">
            <h2 id="topic-choice" className="studio-section-title">2. Choose a situation</h2>
            <RadioGroup className="conversation-topic-grid" value={selectedTopic} onValueChange={setSelectedTopic} aria-labelledby="topic-choice">
              {conversationTopics.map(({ id, name, Icon, description }) => (
                <Label
                  key={id}
                  htmlFor={`conversation-topic-${id}`}
                  className={`conversation-topic ${selectedTopic === id ? "is-selected" : ""}`}
                >
                  <RadioGroupItem id={`conversation-topic-${id}`} value={id}/>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{name}</span>
                  <small>{description}</small>
                </Label>
              ))}
            </RadioGroup>
          </section>
        )}

        {selectedTopic && (
          <section className="studio-panel" aria-labelledby="difficulty-choice">
            <h2 id="difficulty-choice" className="studio-section-title">3. Set the challenge</h2>
            <RadioGroup className="difficulty-options" value={selectedDifficulty} onValueChange={setSelectedDifficulty} aria-labelledby="difficulty-choice">
              {difficultyLevels.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={`conversation-difficulty-${level.value}`}
                  className={`difficulty-option ${selectedDifficulty === level.value ? "is-selected" : ""}`}
                >
                  <RadioGroupItem id={`conversation-difficulty-${level.value}`} value={level.value}/>
                  <strong>{level.label}</strong>
                  <span>{level.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </section>
        )}

        {selectedLanguage && selectedTopic && (
          <section className="studio-callout">
            <div>
              <p className="eyebrow">Ready when you are</p>
              <h2>{selectedLanguageData?.name} · {conversationTopics.find((topic) => topic.id === selectedTopic)?.name}</h2>
              <p>Say your first sentence aloud before you press send. Typed practice is always available.</p>
            </div>
            {capability && !capability.chat && <p role="status" className="mb-4 text-sm text-muted-foreground">AI conversation practice is awaiting setup. You can continue learning and reviewing lessons.</p>}
            <Button size="lg" onClick={() => createSessionMutation.mutate()} disabled={createSessionMutation.isPending || !capability?.chat}>
              <MessageCircle className="mr-2 h-5 w-5" />
              {createSessionMutation.isPending ? "Opening practice…" : "Start practice"}
            </Button>
          </section>
        )}

        <section className="method-strip" aria-label="How conversation practice works">
          <div><MessageSquareText aria-hidden="true" /><strong>Choose one context</strong><span>A clear context makes your first sentence easier to build.</span></div>
          <div><Mic aria-hidden="true" /><strong>Pause, then express</strong><span>Speak or type. You can retry without losing the thread.</span></div>
          <div><Sparkles aria-hidden="true" /><strong>Reflect on a process</strong><span>Finish with one thing that worked and one idea to revisit.</span></div>
        </section>

        {sessionsData?.sessions?.length ? (
          <section className="studio-panel" aria-labelledby="recent-practice">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Continue or revisit</p>
                <h2 id="recent-practice" className="studio-section-title">Recent practice</h2>
              </div>
              <Badge variant="outline">{sessionsData.sessions.length} saved</Badge>
            </div>
            <div className="recent-session-list">
              {sessionsData.sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="recent-session">
                  <div>
                    <strong className="capitalize">{session.topic}</strong>
                    <span>{session.difficultyLevel} · {session.completedAt ? "Reflection saved" : "In progress"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/conversation?language=${encodeURIComponent(session.languageCode)}&session=${session.id}`)}>
                    {session.completedAt ? <RotateCcw className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                    {session.completedAt ? "View" : "Resume"}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
