import React, { useEffect, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { useSimpleToast } from '../hooks/use-simple-toast';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Loader2, Award, Check, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import FlagIcon from '../components/FlagIcon';
import { formatDistanceToNow } from 'date-fns';
import { Language, UserProgress, Lesson } from '@shared/schema';
import { calculateTotalProgressForLanguage, formatTimeSpent } from '@/lib/progress';
import StreakCalendar from '../components/StreakCalendar';
import LanguageProgressCards from '../components/LanguageProgressCards';

/**
 * Profile page that displays user progress across all languages
 */
export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const toast = useSimpleToast();
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch all available languages
  const { data: languages = [], isLoading: languagesLoading } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
    enabled: !!user,
    queryFn: () => 
      fetch('/api/languages')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch languages');
          return res.json() as Promise<Language[]>;
        })
  });

  // For each language, fetch progress using useQueries
  const progressQueries = useQueries({
    queries: languages.map((language: Language) => ({
      queryKey: ['progress', language.code],
      enabled: !!user,
      retry: 2,
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: true,
      queryFn: () => 
        fetch(`/api/progress/language/${language.code}`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch progress for ${language.name}`);
            return res.json() as Promise<UserProgress[]>;
          })
    }))
  });

  // For each language, fetch lessons using useQueries
  const lessonQueries = useQueries({
    queries: languages.map((language: Language) => ({
      queryKey: ['lessons', language.code],
      enabled: !!user,
      retry: 2,
      staleTime: 60000, // 1 minute
      queryFn: () => 
        fetch(`/api/languages/${language.code}/lessons`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch lessons for ${language.name}`);
            return res.json() as Promise<Lesson[]>;
          })
    }))
  });

  const isLoading = authLoading || languagesLoading || 
    progressQueries.some(query => query.isLoading) ||
    lessonQueries.some(query => query.isLoading);

  // Prepare data for the overview chart
  const prepareChartData = () => {
    if (!languages || !progressQueries || !lessonQueries) return [];
    
    if (progressQueries.some(query => query.isLoading) || lessonQueries.some(query => query.isLoading)) {
      return [];
    }
    
    const result = [];
    
    for (let i = 0; i < languages.length; i++) {
      const language = languages[i];
      const progressQuery = progressQueries[i];
      const lessonQuery = lessonQueries[i];
      
      if (!progressQuery?.data || !lessonQuery?.data || 
          !Array.isArray(progressQuery.data) || !Array.isArray(lessonQuery.data)) {
        continue;
      }
      
      const progressData = progressQuery.data;
      const lessons = lessonQuery.data;
      
      // Skip if no progress
      if (progressData.length === 0) continue;
      
      // Calculate percentage completed
      const percentComplete = calculateTotalProgressForLanguage(progressData, lessons);
      
      // Only add if there's some progress
      if (percentComplete > 0) {
        result.push({
          name: language.name,
          code: language.code,
          progress: percentComplete,
        });
      }
    }
    
    return result;
  };

  // Get languages with progress data
  const getActiveLanguages = () => {
    if (!languages || !progressQueries) return [];
    
    const result = [];
    
    for (let i = 0; i < languages.length; i++) {
      const language = languages[i];
      const progressQuery = progressQueries[i];
      
      if (progressQuery && 
          progressQuery.data && 
          Array.isArray(progressQuery.data) && 
          progressQuery.data.length > 0) {
        result.push(language);
      }
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] mt-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading your profile data...</span>
      </div>
    );
  }

  const chartData = prepareChartData();
  const activeLanguages = getActiveLanguages();
  
  // Debug information
  console.log("Profile page data:", { 
    user,
    languages: languages.map(l => l.code), 
    progressData: progressQueries.map((q, i) => ({ 
      language: languages[i]?.code,
      data: q.data,
      isLoading: q.isLoading,
      isError: q.isError,
      error: q.error
    })),
    activeLanguages: activeLanguages.map(l => l.code)
  });

  // Custom BarChart tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{value: number; payload: {name: string}}>;
  }
  
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-background shadow-md border p-2 rounded-md">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p><span className="text-primary font-semibold">{payload[0].value}%</span> completed</p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="container mx-auto py-12 max-w-5xl page-container">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Your Language Learning Profile</h1>
      
      {activeLanguages.length === 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>No Progress Yet</CardTitle>
            <CardDescription>
              You haven't started learning any languages yet. Begin your language journey by selecting a language and completing lessons.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')}>
              Start Learning
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          {/* Learning Streak */}
          {(() => {
            // Create a map of all lesson data by language code
            const lessonDataByLanguage: { [code: string]: any[] } = {};
            const languageNamesMap: { [code: string]: string } = {};
            
            // Populate the maps
            languages.forEach((language: Language, index: number) => {
              if (lessonQueries[index]?.data) {
                lessonDataByLanguage[language.code] = lessonQueries[index].data || [];
              }
              languageNamesMap[language.code] = language.name;
            });
            
            // Collect all progress data and ensure date properties are strings
            const allProgressData = progressQueries
              .filter(query => query.data && Array.isArray(query.data))
              .flatMap(query => {
                if (!query.data) return [];
                return query.data.map(progress => ({
                  ...progress,
                  // Convert Date objects to strings to match UserProgress type
                  lastAccessedAt: typeof progress.lastAccessedAt === 'object' 
                    ? progress.lastAccessedAt.toISOString() 
                    : progress.lastAccessedAt,
                  completedAt: progress.completedAt && typeof progress.completedAt === 'object'
                    ? progress.completedAt.toISOString()
                    : progress.completedAt,
                }));
              });
            
            return (
              <StreakCalendar 
                progressData={allProgressData} 
                lessonData={lessonDataByLanguage}
                languageNames={languageNamesMap}
              />
            );
          })()}

          {/* Language Progress Cards */}
          {(() => {
            // Create maps for passing data to the component
            const progressByLanguage: { [code: string]: UserProgress[] } = {};
            const lessonsByLanguage: { [code: string]: Lesson[] } = {};
            
            // Populate the maps
            languages.forEach((language: Language, index: number) => {
              if (progressQueries[index]?.data) {
                // Transform progress data and convert Date objects to strings
                progressByLanguage[language.code] = (progressQueries[index].data || []).map(progress => ({
                  ...progress,
                  lastAccessedAt: typeof progress.lastAccessedAt === 'object' 
                    ? progress.lastAccessedAt.toISOString() 
                    : progress.lastAccessedAt,
                  completedAt: progress.completedAt && typeof progress.completedAt === 'object'
                    ? progress.completedAt.toISOString()
                    : progress.completedAt,
                }));
              }
              
              if (lessonQueries[index]?.data) {
                lessonsByLanguage[language.code] = lessonQueries[index].data || [];
              }
            });
            
            return (
              <div className="mb-8">
                <LanguageProgressCards 
                  languages={languages}
                  progressData={progressByLanguage}
                  lessonData={lessonsByLanguage}
                />
              </div>
            );
          })()}

          {/* Detailed Progress by Language */}
          <h2 className="text-2xl font-bold mb-4">Detailed Progress</h2>
          <Accordion 
            type="single" 
            collapsible 
            value={expandedLanguage || undefined}
            onValueChange={(value) => setExpandedLanguage(value)}
            className="mb-8"
          >
            {activeLanguages.map((language: Language) => {
              // Find the correct language index in the original arrays
              const languageIndex = languages.findIndex(lang => lang.code === language.code);
              // Transform progress data and convert Date objects to strings
              const progressData = languageIndex >= 0 ? (progressQueries[languageIndex]?.data || []).map(progress => ({
                ...progress,
                lastAccessedAt: typeof progress.lastAccessedAt === 'object' 
                  ? progress.lastAccessedAt.toISOString() 
                  : progress.lastAccessedAt,
                completedAt: progress.completedAt && typeof progress.completedAt === 'object'
                  ? progress.completedAt.toISOString()
                  : progress.completedAt,
              })) : [];
              const lessons = languageIndex >= 0 ? (lessonQueries[languageIndex]?.data || []) : [];
              
              // Skip if no progress
              if (progressData.length === 0) return null;
              
              const totalLessons = lessons.length;
              const completedLessons = progressData.filter((p: any) => p.completed).length;
              const percentComplete = calculateTotalProgressForLanguage(progressData, lessons);
              
              // Find the most recent activity
              const mostRecent = progressData.reduce((latest: any | null, current: any) => {
                const currentDate = new Date(current.lastAccessedAt);
                const latestDate = latest ? new Date(latest.lastAccessedAt) : new Date(0);
                return currentDate > latestDate ? current : latest;
              }, null);
              
              // Calculate total time spent
              const totalTimeSpent = progressData.reduce((sum: number, current: any) => {
                return sum + (current.timeSpent || 0);
              }, 0);
              
              return (
                <AccordionItem value={language.code} key={language.code}>
                  <AccordionTrigger className="px-4 py-2 hover:bg-accent/50 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 dark:bg-gray-800 light:bg-gray-200 shadow-md border dark:border-gray-700 light:border-gray-300">
                        <FlagIcon code={language.flagCode} size={24} className="scale-100" />
                      </div>
                      <span className="font-semibold">{language.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({completedLessons}/{totalLessons} lessons completed)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="border dark:border-gray-800 light:border-gray-300 shadow-sm">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-accent/30 dark:bg-accent/30 light:bg-gray-100 p-4 rounded-lg flex items-center gap-3 shadow-sm border dark:border-gray-700 light:border-gray-300">
                            <Award className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 light:text-gray-600">Completed Lessons</p>
                              <p className="text-xl font-bold">{completedLessons} / {totalLessons}</p>
                            </div>
                          </div>
                          
                          <div className="bg-accent/30 dark:bg-accent/30 light:bg-gray-100 p-4 rounded-lg flex items-center gap-3 shadow-sm border dark:border-gray-700 light:border-gray-300">
                            <Clock className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 light:text-gray-600">Total Time Spent</p>
                              <p className="text-xl font-bold">
                                {totalTimeSpent < 60 
                                  ? `${totalTimeSpent} min` 
                                  : `${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-accent/30 dark:bg-accent/30 light:bg-gray-100 p-4 rounded-lg flex items-center gap-3 shadow-sm border dark:border-gray-700 light:border-gray-300">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground dark:text-gray-400 light:text-gray-600">Last Activity</p>
                              <p className="text-xl font-bold">
                                {mostRecent 
                                  ? formatDistanceToNow(new Date(mostRecent.lastAccessedAt), { addSuffix: true }) 
                                  : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-6">
                          <div className="flex justify-between">
                            <span className="text-sm">Overall Progress</span>
                            <span className="text-sm font-medium">{percentComplete}%</span>
                          </div>
                          <Progress value={percentComplete} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Lesson Breakdown</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {lessons.map((lesson: Lesson) => {
                              const progress = progressData.find((p: any) => p.lessonId === lesson.lessonId);
                              const isCompleted = progress?.completed || false;
                              const timeSpent = progress?.timeSpent || 0;
                              
                              return (
                                <div 
                                  key={lesson.lessonId} 
                                  className={`p-3 rounded-md border flex justify-between items-center shadow-sm
                                    ${isCompleted 
                                      ? 'bg-primary/10 dark:bg-primary/10 light:bg-primary/5 border-primary/20 dark:border-primary/20 light:border-primary/30' 
                                      : 'bg-accent/10 dark:bg-accent/10 light:bg-gray-50 border-accent/20 dark:border-accent/20 light:border-gray-300'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                      <Check className="h-5 w-5 text-primary" />
                                    ) : (
                                      <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                                    )}
                                    <span className={isCompleted ? "font-medium" : "text-muted-foreground"}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  {progress && (
                                    <div className="text-xs text-muted-foreground">
                                      {timeSpent > 0 ? `${timeSpent} min spent` : 'Started'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 border-t dark:border-gray-800 light:border-gray-200 flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/languages/${language.code}`)}
                        >
                          Continue Learning
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate('/settings')}
                          className="text-muted-foreground"
                        >
                          Manage Settings
                        </Button>
                      </CardFooter>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </div>
  );
}