import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Language, Lesson } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, MessageCircle, Users, Globe, ChevronRight, Clock, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import FlagIcon from "@/components/FlagIcon";

export default function LanguageDetail() {
  const [match, params] = useRoute("/language/:code");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  const languageCode = params?.code;

  // Fetch language data
  const { data: language, isLoading: languageLoading } = useQuery<Language>({
    queryKey: [`/api/languages/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: !!languageCode,
  });

  // Fetch lessons for progress calculation
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/languages/${languageCode}/lessons`],
    queryFn: getQueryFn(),
    enabled: !!languageCode,
  });

  // Fetch user progress if authenticated
  const { data: progress } = useQuery({
    queryKey: [`/api/progress/language/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: !!languageCode && !!user,
  });

  if (!match || !languageCode) {
    return <div>Language not found</div>;
  }

  if (languageLoading || lessonsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!language) {
    return <div>Language not found</div>;
  }

  // Calculate progress
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p: any) => p.completed)?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleStartLessons = () => {
    navigate(`/${languageCode}/lesson/1`);
  };

  const handleContinueLearning = () => {
    // Find the next incomplete lesson or go to lesson 1
    if (progress && progress.length > 0) {
      const incompleteLesson = progress.find((p: any) => !p.completed);
      if (incompleteLesson) {
        const lessonNumber = incompleteLesson.lessonId.split('-lesson')[1];
        navigate(`/${languageCode}/lesson/${lessonNumber}`);
        return;
      }
    }
    navigate(`/${languageCode}/lesson/1`);
  };

  const handleConversationPractice = () => {
    navigate(`/conversation?language=${languageCode}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Language Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16">
            <FlagIcon code={language.flagCode} size={64} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">{language.name}</h1>
            <p className="text-lg text-muted-foreground">
              Start your {language.name} learning journey
            </p>
          </div>
        </div>

        {/* Progress Bar (if user has progress) */}
        {user && totalLessons > 0 && (
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons} lessons completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Learning Options Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Main Lessons Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={user ? handleContinueLearning : handleStartLessons}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Interactive Lessons</CardTitle>
                <CardDescription>
                  Structured learning path with {totalLessons} lessons
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{Math.ceil(totalLessons * 15)} minutes total</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Progressive difficulty</span>
              </div>
              <Button className="w-full" size="lg">
                {user && completedLessons > 0 ? 'Continue Learning' : 'Start Learning'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Practice Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleConversationPractice}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Conversation Practice</CardTitle>
                <CardDescription>
                  Practice real-world scenarios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                • Restaurant conversations<br/>
                • Travel scenarios<br/>
                • Business meetings<br/>
                • Daily interactions
              </div>
              <Button className="w-full" size="lg">
                Start Practicing
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Insights Card (Coming Soon) */}
        <Card className="relative overflow-hidden opacity-75">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Cultural Insights</CardTitle>
                <CardDescription>
                  Learn culture and context
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                • Cultural traditions<br/>
                • Social etiquette<br/>
                • Historical context<br/>
                • Modern customs
              </div>
              <Button className="w-full" size="lg" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
          <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Soon
          </div>
        </Card>

        {/* Community Features Card (Coming Soon) */}
        <Card className="relative overflow-hidden opacity-75">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Community Hub</CardTitle>
                <CardDescription>
                  Connect with other learners
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                • Language exchange<br/>
                • Study groups<br/>
                • Discussion forums<br/>
                • Native speaker chat
              </div>
              <Button className="w-full" size="lg" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Soon
          </div>
        </Card>

      </div>

      {/* Back to Languages Button */}
      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate('/languages')}>
          ← Back to All Languages
        </Button>
      </div>
    </div>
  );
}