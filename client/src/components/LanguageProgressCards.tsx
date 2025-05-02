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
    
    if (progress < 10) return 'Starting your journey!';
    if (progress < 25) return 'Building foundations!';
    if (progress < 50) return 'Making good progress!';
    if (progress < 75) return 'Becoming multilingual!';
    if (progress < 90) return 'Nearly fluent!';
    return 'Multilingual Master!';
  };
  
  return (
    <div className="space-y-6">
      {activeLangs.length > 0 ? (
        <>
          <Card className="border border-gray-300 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8">
                <div className="relative">
                  {/* Circular progress indicators using relative positioning for better layout */}
                  <div className="relative h-64 sm:h-72 md:h-80 w-full max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
                    {/* Mascot in the center */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 z-10">
                      <img src="/progress.svg" alt="Fox mascot" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    
                    {activeLangs.slice(0, 6).map((language, index) => {
                      const progress = progressData[language.code] || [];
                      const lessons = lessonData[language.code] || [];
                      const percentComplete = calculateTotalProgressForLanguage(progress, lessons);
                      
                      // Determine if this is a single language case
                      const languages = activeLangs.slice(0, 6);
                      const isSolo = languages.length === 1;
                      const angleStep = (2 * Math.PI) / languages.length;
                      const angle = index * angleStep;
                      
                      // Radius percentage from center (smaller for more compact layout)
                      const radiusPct = 38;
                      
                      // Calculate position - x and y coordinates
                      // For single language, center it instead of positioning around the circle
                      const left = isSolo
                        ? 50
                        : 50 + radiusPct * Math.cos(angle - Math.PI/2);
                        
                      const top = isSolo
                        ? 50
                        : 50 + radiusPct * Math.sin(angle - Math.PI/2);
                      
                      // Size of the progress circle - larger for single language
                      const size = isSolo ? 70 : 20;
                      
                      return (
                        <div 
                          key={language.code} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 aspect-square"
                          style={{ 
                            left: `${left}%`, 
                            top: `${top}%`,
                            width: `${size}%`,
                            // Height is controlled by aspect-square
                          }}
                        >
                          {/* Background circle */}
                          <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-800 opacity-60 dark:opacity-90 shadow-inner"></div>
                          
                          {/* Progress circle - SVG approach */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              strokeWidth="10"
                              stroke="currentColor" 
                              className="text-gray-300 dark:text-gray-600 opacity-40"
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              strokeWidth="11"
                              stroke="currentColor" 
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentComplete / 100)}`}
                              className="text-primary transition-all duration-1000 ease-in-out"
                            />
                          </svg>
                          
                          {/* Flag in the middle */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={`${isSolo ? 'w-14 h-14' : 'w-8 h-8'} rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700`}>
                              <FlagIcon 
                                code={language.flagCode} 
                                size={isSolo ? 48 : 24} 
                                className="scale-100" 
                              />
                            </div>
                            <div className="mt-1 text-center">
                              <p className={`${isSolo ? 'text-xs' : 'text-[10px]'} font-medium text-center leading-tight text-gray-800 dark:text-white`}>{language.name}</p>
                              <p className={`${isSolo ? 'text-sm' : 'text-[10px]'} font-bold text-primary leading-tight`}>
                                {Math.round(percentComplete)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Overall progress message */}
                  <div className="mt-8 pt-8 text-center">
                    <div className="inline-block bg-gray-200 dark:bg-gray-800 px-6 py-3 rounded-full shadow-md border border-gray-300 dark:border-gray-700">
                      <p className="text-lg font-medium text-gray-800 dark:text-white">
                        {calculateOverallProgress() === 0 
                          ? "Starting your journey!" 
                          : getLanguageLevel()}
                      </p>
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
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-700">
                          <FlagIcon code={language.flagCode} size={24} className="scale-100" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-lg font-semibold text-gray-800 dark:text-white">{language.name}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {completedLessons}/{totalLessons} lessons completed
                            </span>
                          </div>
                          <Progress 
                            value={percentComplete} 
                            className="h-4 bg-gray-300 dark:bg-gray-800 border border-gray-400 dark:border-transparent"
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
        <Card className="border border-gray-300 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <img src="/progress.svg" alt="Fox mascot" className="w-32 h-32 mx-auto mb-4 opacity-60" />
            <p className="text-gray-600 dark:text-gray-400">You haven't started learning any languages yet.</p>
            <p className="text-gray-600 dark:text-gray-400">Complete lessons to see your progress here!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}