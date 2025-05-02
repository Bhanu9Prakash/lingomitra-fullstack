import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import FlagIcon from './FlagIcon';
import { Language, UserProgress, Lesson } from '@shared/schema';
import { calculateTotalProgressForLanguage } from '@/lib/progress';

interface LanguageProgressCardsProps {
  languages: Language[];
  progressData: { [code: string]: UserProgress[] };
  lessonData: { [code: string]: Lesson[] };
}

export default function LanguageProgressCards({ languages, progressData, lessonData }: LanguageProgressCardsProps) {
  // Filter languages to only include those with progress
  const activeLangs = languages.filter(lang => progressData[lang.code]?.length > 0);

  // Calculate overall progress across all languages
  const calculateOverallProgress = () => {
    if (activeLangs.length === 0) return 0;
    
    let totalProgress = 0;
    
    activeLangs.forEach(lang => {
      const progress = progressData[lang.code] || [];
      const lessons = lessonData[lang.code] || [];
      
      if (progress.length > 0 && lessons.length > 0) {
        totalProgress += calculateTotalProgressForLanguage(progress, lessons);
      }
    });
    
    return Math.round(totalProgress / activeLangs.length);
  };
  
  // Determine language level based on average progress
  const getLanguageLevel = () => {
    const progress = calculateOverallProgress();
    
    if (progress < 20) return 'Starting your journey!';
    if (progress < 40) return 'Building foundations!';
    if (progress < 60) return 'Halfway to B1!';
    if (progress < 80) return 'Getting advanced!';
    return 'Nearly fluent!';
  };
  
  return (
    <div className="space-y-6">
      {activeLangs.length > 0 ? (
        <>
          <Card className="border-0 shadow-lg bg-gray-900 dark:bg-gray-900 light:bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8">
                <div className="relative">
                  {/* Circular progress indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                    {activeLangs.slice(0, 5).map((language, index) => {
                      const progress = progressData[language.code] || [];
                      const lessons = lessonData[language.code] || [];
                      const percentComplete = calculateTotalProgressForLanguage(progress, lessons);
                      
                      // Position the circles in a way that leaves room in the middle
                      const gridPositions = [
                        'col-start-1 row-start-1', // top left
                        'col-start-2 row-start-1', // top right
                        'col-start-1 row-start-2', // bottom left
                        'col-start-2 row-start-2', // bottom right
                        'col-start-2 row-start-3', // extra below
                      ];
                      
                      const position = gridPositions[index] || '';
                      
                      return (
                        <div 
                          key={language.code} 
                          className={`${position} relative w-28 h-28`}
                        >
                          {/* Background circle */}
                          <div className="absolute inset-0 rounded-full bg-gray-800 dark:bg-gray-800 light:bg-gray-200 opacity-60"></div>
                          
                          {/* Progress circle - SVG approach */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              strokeWidth="10"
                              stroke="currentColor" 
                              className="text-gray-800 dark:text-gray-800 light:text-gray-300 opacity-60"
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              strokeWidth="10"
                              stroke="currentColor" 
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentComplete / 100)}`}
                              className="text-primary transition-all duration-1000 ease-in-out"
                            />
                          </svg>
                          
                          {/* Flag in the middle */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 dark:bg-gray-800 light:bg-gray-100 shadow-md">
                              <FlagIcon code={language.flagCode} size={48} className="scale-125" />
                            </div>
                            <div className="mt-10 flex flex-col items-center">
                              <p className="text-[10px] font-medium">{language.name}</p>
                              <p className="text-xs font-bold text-primary">{Math.round(percentComplete)}%</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Mascot in the middle */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                    <img src="/progress.svg" alt="Fox mascot" className="w-full h-full object-contain" />
                  </div>
                  
                  {/* Overall progress message */}
                  <div className="mt-6 text-center">
                    <div className="inline-block bg-gray-800 dark:bg-gray-800 light:bg-gray-100 px-6 py-2 rounded-full shadow-md border dark:border-gray-700 light:border-gray-300">
                      <p className="text-lg font-medium">{getLanguageLevel()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress bars for each language */}
                <div className="mt-6 space-y-4">
                  {activeLangs.map(language => {
                    const progress = progressData[language.code] || [];
                    const lessons = lessonData[language.code] || [];
                    const percentComplete = calculateTotalProgressForLanguage(progress, lessons);
                    const completedLessons = progress.filter(p => p.completed).length;
                    const totalLessons = lessons.length;
                    
                    return (
                      <div key={language.code} className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 dark:bg-gray-800 light:bg-gray-100 shadow-md">
                          <FlagIcon code={language.flagCode} size={32} className="scale-125" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-lg font-semibold">{language.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {completedLessons}/{totalLessons} lessons completed
                            </span>
                          </div>
                          <Progress 
                            value={percentComplete} 
                            className="h-4 bg-gray-800 dark:bg-gray-800 light:bg-gray-200"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-0 shadow-lg bg-gray-900 dark:bg-gray-900 light:bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <img src="/progress.svg" alt="Fox mascot" className="w-32 h-32 mx-auto mb-4 opacity-60" />
            <p className="text-muted-foreground">You haven't started learning any languages yet.</p>
            <p className="text-muted-foreground">Complete lessons to see your progress here!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}