import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trophy, Mic, ArrowLeft } from "lucide-react";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { useLocation } from "wouter";

interface ConversationSession {
  id: number;
  languageCode: string;
  topic: string;
  difficultyLevel: string;
  status: string;
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
  { 
    id: 'restaurant', 
    name: 'Restaurant & Dining', 
    icon: '🍽️', 
    description: 'Order food, make reservations, discuss menu items',
    scenarios: ['Ordering at a restaurant', 'Making a reservation', 'Complaining about food', 'Asking for the bill']
  },
  { 
    id: 'travel', 
    name: 'Travel & Tourism', 
    icon: '✈️', 
    description: 'Book tickets, ask directions, hotel interactions',
    scenarios: ['Booking flights', 'Hotel check-in', 'Asking for directions', 'Immigration questions']
  },
  { 
    id: 'business', 
    name: 'Business & Work', 
    icon: '💼', 
    description: 'Meetings, negotiations, workplace conversations',
    scenarios: ['Job interviews', 'Business meetings', 'Email discussions', 'Presentations']
  },
  { 
    id: 'shopping', 
    name: 'Shopping & Services', 
    icon: '🛍️', 
    description: 'Buying items, comparing prices, customer service',
    scenarios: ['Buying clothes', 'Returning items', 'Price negotiations', 'Bank services']
  },
  { 
    id: 'daily', 
    name: 'Daily Life', 
    icon: '🏠', 
    description: 'Casual conversations, weather, family topics',
    scenarios: ['Weather talk', 'Family discussions', 'Weekend plans', 'Hobbies']
  },
  { 
    id: 'medical', 
    name: 'Medical & Health', 
    icon: '🏥', 
    description: 'Doctor visits, symptoms, health discussions',
    scenarios: ['Doctor appointments', 'Pharmacy visits', 'Health symptoms', 'Emergency situations']
  },
];

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500', description: 'Simple phrases and basic vocabulary' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-500', description: 'Complex sentences and varied vocabulary' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-500', description: 'Fluent conversation with idioms and nuances' },
];

export default function ConversationPractice() {
  const [location, navigate] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("beginner");
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const { toast } = useSimpleToast();
  const queryClient = useQueryClient();

  // Extract language from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const languageParam = urlParams.get('language');
    if (languageParam) {
      setSelectedLanguage(languageParam);
    }
  }, [location]);

  // Fetch available languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  // Fetch user's conversation sessions
  const { data: sessionsData, refetch: refetchSessions } = useQuery<{ sessions: ConversationSession[] }>({
    queryKey: ["/api/conversation/sessions", selectedLanguage],
    enabled: !!selectedLanguage,
  });

  // Create new conversation session
  const createSessionMutation = useMutation({
    mutationFn: async (data: { languageCode: string; topic: string; difficultyLevel: string }) => {
      const response = await fetch("/api/conversation/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create conversation session");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setActiveSession(data.session);
      toast({
        title: "Conversation Started!",
        description: `Your ${selectedTopic} conversation is ready.`,
      });
      refetchSessions();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartConversation = () => {
    if (!selectedLanguage || !selectedTopic) return;
    
    createSessionMutation.mutate({
      languageCode: selectedLanguage,
      topic: selectedTopic,
      difficultyLevel: selectedDifficulty,
    });
  };

  const selectedLanguageData = languages?.find(l => l.code === selectedLanguage);
  const selectedTopicData = conversationTopics.find(t => t.id === selectedTopic);
  const selectedDifficultyData = difficultyLevels.find(d => d.value === selectedDifficulty);

  const handleBackNavigation = () => {
    if (selectedLanguage) {
      navigate(`/language/${selectedLanguage}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={handleBackNavigation} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {selectedLanguageData && (
            <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-lg">
              <span className={`fi fi-${selectedLanguageData.flagCode.toLowerCase()} text-xl`}></span>
              <div>
                <div className="font-semibold">{selectedLanguageData.name}</div>
                <div className="text-sm text-muted-foreground">Conversation Practice</div>
              </div>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">Choose Your Conversation</h1>
        <p className="text-muted-foreground">
          Practice real-world scenarios with AI-powered conversations
        </p>
      </div>

      {/* Topic Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Conversation Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversationTopics.map((topic) => (
            <Card 
              key={topic.id} 
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                selectedTopic === topic.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedTopic(topic.id)}
            >
              <CardContent className="p-6">
                <div className="text-3xl mb-3">{topic.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{topic.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                <div className="space-y-1">
                  {topic.scenarios.slice(0, 2).map((scenario, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                      {scenario}
                    </div>
                  ))}
                  {topic.scenarios.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{topic.scenarios.length - 2} more scenarios
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      {selectedTopic && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Difficulty Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyLevels.map((difficulty) => (
              <Card 
                key={difficulty.value}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedDifficulty === difficulty.value ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedDifficulty(difficulty.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-4 h-4 rounded-full ${difficulty.color} mx-auto mb-2`}></div>
                  <h3 className="font-semibold mb-1">{difficulty.label}</h3>
                  <p className="text-sm text-muted-foreground">{difficulty.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      {selectedTopic && selectedDifficulty && (
        <div className="mb-8 text-center">
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <span>{selectedTopicData?.name}</span>
                <span>•</span>
                <span>{selectedDifficultyData?.label}</span>
                <span>•</span>
                <span>{selectedLanguageData?.name}</span>
              </div>
            </div>
            <Button 
              onClick={handleStartConversation}
              disabled={!selectedLanguage || !selectedTopic || createSessionMutation.isPending}
              size="lg"
              className="px-8"
            >
              {createSessionMutation.isPending ? "Starting..." : "Start Conversation"}
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      )}

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How Conversation Practice Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Choose Your Scenario</h3>
              <p className="text-sm text-muted-foreground">
                Select from realistic conversation scenarios based on your interests and needs
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Practice Speaking</h3>
              <p className="text-sm text-muted-foreground">
                Engage in natural conversations using voice input or text responses
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Get Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed feedback on pronunciation, grammar, and conversation skills
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {sessionsData?.sessions && sessionsData.sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Practice Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionsData.sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{session.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.difficultyLevel} level
                      {session.completedAt && session.score && (
                        <span className="ml-2">• Score: {session.score}/100</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.completedAt ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}