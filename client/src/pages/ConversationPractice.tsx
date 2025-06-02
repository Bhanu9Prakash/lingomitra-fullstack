import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, Play, Square, MessageCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConversationSession } from "./ConversationSession";

interface ConversationTopic {
  id: string;
  name: string;
  scenarios: number;
}

interface ConversationSession {
  id: number;
  languageCode: string;
  topic: string;
  difficultyLevel: string;
  scenario: string;
  messages: Array<{ role: string; content: string }>;
  feedback?: string;
  score?: number;
  duration: number;
  status: string;
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

export default function ConversationPractice() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("beginner");
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  // Fetch available conversation topics
  const { data: topicsData } = useQuery<{ topics: ConversationTopic[] }>({
    queryKey: ["/api/conversation/topics"],
  });

  // Fetch user's conversation sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery<{ sessions: ConversationSession[] }>({
    queryKey: ["/api/conversation/sessions", selectedLanguage],
    enabled: !!selectedLanguage,
  });

  // Create new conversation session
  const createSessionMutation = useMutation({
    mutationFn: async (data: { languageCode: string; topic: string; difficultyLevel: string }) => {
      return apiRequest("/api/conversation/sessions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setActiveSession(data.session);
      refetchSessions();
      toast({
        title: "Conversation Started",
        description: "Your conversation practice session has begun!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation session",
        variant: "destructive",
      });
    },
  });

  const handleStartConversation = () => {
    if (!selectedLanguage || !selectedTopic) {
      toast({
        title: "Missing Information",
        description: "Please select a language and topic",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      languageCode: selectedLanguage,
      topic: selectedTopic,
      difficultyLevel: selectedDifficulty,
    });
  };

  const handleSessionComplete = () => {
    setActiveSession(null);
    refetchSessions();
  };

  const handleResumeSession = (session: ConversationSession) => {
    setActiveSession(session);
  };

  const difficultyLevels = [
    { value: "beginner", label: "Beginner", description: "Simple vocabulary and phrases" },
    { value: "intermediate", label: "Intermediate", description: "More complex conversations" },
    { value: "advanced", label: "Advanced", description: "Natural, fluent conversations" },
  ];

  if (activeSession) {
    return (
      <ConversationSession
        session={activeSession}
        onComplete={handleSessionComplete}
        onBack={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversation Practice</h1>
        <p className="text-muted-foreground">
          Practice real-world conversations with AI in your target language
        </p>
      </div>

      {/* Session Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center gap-2">
                        <span className={`fi fi-${language.flagCode.toLowerCase()}`}></span>
                        {language.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topicsData?.topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{topic.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {topic.scenarios} scenarios
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleStartConversation}
            disabled={!selectedLanguage || !selectedTopic || createSessionMutation.isPending}
            className="w-full md:w-auto"
          >
            {createSessionMutation.isPending ? "Starting..." : "Start Conversation"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {selectedLanguage && sessionsData?.sessions && sessionsData.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessionsData.sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => session.status === 'active' ? handleResumeSession(session) : undefined}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.topic}
                      </Badge>
                      <Badge variant="outline">{session.difficultyLevel}</Badge>
                      {session.status === 'completed' && session.score && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {session.score}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{session.scenario}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.messages.length} messages • {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    {session.feedback && (
                      <p className="text-sm mt-2 text-green-600">{session.feedback}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === 'active' && (
                      <Button variant="outline" size="sm">
                        Resume
                      </Button>
                    )}
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      {(!selectedLanguage || !topicsData?.topics) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Choose Your Topic</h3>
                <p className="text-sm text-muted-foreground">
                  Select from restaurant, travel, business, shopping, or daily conversation scenarios
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Speak or Type</h3>
                <p className="text-sm text-muted-foreground">
                  Communicate using voice input or text, just like a real conversation
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Get Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Receive AI-powered feedback and scoring to track your progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}