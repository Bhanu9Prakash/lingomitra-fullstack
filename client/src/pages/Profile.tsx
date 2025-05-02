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
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Loader2, Award, Check, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import FlagIcon from '../components/FlagIcon';
import { formatDistanceToNow } from 'date-fns';
import { Language, UserProgress, Lesson } from '@shared/schema';
import { calculateTotalProgressForLanguage, formatTimeSpent } from '@/lib/progress';

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
    <div className="container mx-auto py-12 max-w-5xl mt-6">
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
          {/* Progress Overview Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Learning Progress Overview</CardTitle>
              <CardDescription>
                Your progress across all languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                      />
                      <YAxis 
                        label={{ 
                          value: 'Completion %', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }} 
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="progress" fill="#ff6600" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry: {code: string}, index: number) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={expandedLanguage === entry.code ? '#cc5200' : '#ff6600'}
                            cursor="pointer"
                            onClick={() => setExpandedLanguage(
                              expandedLanguage === entry.code ? null : entry.code
                            )}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-3 text-warning" />
                  <p>No progress data available yet. Complete some lessons to see your progress here.</p>
                </div>
              )}
            </CardContent>
          </Card>

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
              const progressData = languageIndex >= 0 ? (progressQueries[languageIndex]?.data || []) : [];
              const lessons = languageIndex >= 0 ? (lessonQueries[languageIndex]?.data || []) : [];
              
              // Skip if no progress
              if (progressData.length === 0) return null;
              
              const totalLessons = lessons.length;
              const completedLessons = progressData.filter((p: UserProgress) => p.completed).length;
              const percentComplete = calculateTotalProgressForLanguage(progressData, lessons);
              
              // Find the most recent activity
              const mostRecent = progressData.reduce((latest: UserProgress | null, current: UserProgress) => {
                const currentDate = new Date(current.lastAccessedAt);
                const latestDate = latest ? new Date(latest.lastAccessedAt) : new Date(0);
                return currentDate > latestDate ? current : latest;
              }, null as UserProgress | null);
              
              // Calculate total time spent
              const totalTimeSpent = progressData.reduce((sum: number, current: UserProgress) => {
                return sum + (current.timeSpent || 0);
              }, 0);
              
              return (
                <AccordionItem value={language.code} key={language.code}>
                  <AccordionTrigger className="px-4 py-2 hover:bg-accent/50 rounded-md">
                    <div className="flex items-center gap-3">
                      <FlagIcon code={language.flagCode} size={24} />
                      <span className="font-semibold">{language.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({completedLessons}/{totalLessons} lessons completed)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-accent/30 p-4 rounded-lg flex items-center gap-3">
                            <Award className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Completed Lessons</p>
                              <p className="text-xl font-bold">{completedLessons} / {totalLessons}</p>
                            </div>
                          </div>
                          
                          <div className="bg-accent/30 p-4 rounded-lg flex items-center gap-3">
                            <Clock className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Time Spent</p>
                              <p className="text-xl font-bold">
                                {totalTimeSpent < 60 
                                  ? `${totalTimeSpent} min` 
                                  : `${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-accent/30 p-4 rounded-lg flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Last Activity</p>
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
                              const progress = progressData.find((p: UserProgress) => p.lessonId === lesson.lessonId);
                              const isCompleted = progress?.completed || false;
                              const timeSpent = progress?.timeSpent || 0;
                              
                              return (
                                <div 
                                  key={lesson.lessonId} 
                                  className={`p-3 rounded-md border flex justify-between items-center 
                                    ${isCompleted ? 'bg-primary/10 border-primary/20' : 'bg-accent/10 border-accent/20'}`}
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
                      <CardFooter className="px-4 py-3 border-t flex justify-between">
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