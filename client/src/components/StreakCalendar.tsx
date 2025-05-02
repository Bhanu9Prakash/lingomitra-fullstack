import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, eachDayOfInterval, subDays, startOfMonth, endOfMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { Flame, Calendar, Download, CheckCircle2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

interface UserProgress {
  lessonId: string;
  lastAccessedAt: string;
  completed: boolean;
  completedAt: string | null;
}

interface LessonData {
  lessonId: string;
  title: string;
  languageCode: string;
}

interface StreakCalendarProps {
  progressData: UserProgress[];
  lessonData: { [code: string]: LessonData[] };
  languageNames: { [code: string]: string };
}

export default function StreakCalendar({ progressData, lessonData, languageNames }: StreakCalendarProps) {
  const [showMonth, setShowMonth] = useState<Date>(new Date());
  
  // Calculate the dates for the calendar
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(showMonth);
    const end = endOfMonth(showMonth);
    return eachDayOfInterval({ start, end });
  }, [showMonth]);
  
  // Calculate streak information based on progress data
  const { currentStreak, longestStreak, activityDays } = useMemo(() => {
    if (!progressData || progressData.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activityDays: [] };
    }
    
    // Sort progress data by date
    const sortedActivity = [...progressData]
      .filter(progress => progress.completed)
      .sort((a, b) => 
        new Date(a.completedAt || a.lastAccessedAt).getTime() - 
        new Date(b.completedAt || b.lastAccessedAt).getTime()
      );
    
    if (sortedActivity.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activityDays: [] };
    }
    
    // Extract all the days where the user completed lessons
    const activityDays = sortedActivity.map(progress => {
      const date = new Date(progress.completedAt || progress.lastAccessedAt);
      const lessonId = progress.lessonId;
      const languageCode = lessonId.split('-')[0];
      const lesson = lessonData[languageCode]?.find(l => l.lessonId === lessonId);
      
      return {
        date,
        lessonId,
        lessonTitle: lesson?.title || 'Unknown Lesson',
        languageCode,
        languageName: languageNames[languageCode] || 'Unknown Language'
      };
    });
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Get unique dates (a user may complete multiple lessons on the same day)
    const uniqueDates = Array.from(new Set(activityDays.map(day => 
      format(day.date, 'yyyy-MM-dd')
    ))).map(dateStr => parseISO(dateStr));
    
    uniqueDates.sort((a, b) => a.getTime() - b.getTime());
    
    // Check if the user has activity today
    const hasActivityToday = uniqueDates.some(date => isToday(date));
    
    // Calculate the longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = uniqueDates[i-1];
        const currDate = uniqueDates[i];
        
        // Check if dates are consecutive
        const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          // Break in the streak
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
    }
    
    // Update longest streak if the last temp streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    // Calculate current streak
    if (hasActivityToday) {
      // Start counting from today backwards
      currentStreak = 1;
      let checkDate = subDays(new Date(), 1);
      
      while (uniqueDates.some(date => isSameDay(date, checkDate))) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      }
    } else if (uniqueDates.length > 0) {
      // Check if the last activity was yesterday
      const lastActivityDate = uniqueDates[uniqueDates.length - 1];
      const yesterday = subDays(new Date(), 1);
      
      if (isSameDay(lastActivityDate, yesterday)) {
        currentStreak = 1;
        let checkDate = subDays(yesterday, 1);
        
        while (uniqueDates.some(date => isSameDay(date, checkDate))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }
      } else {
        // Streak is broken
        currentStreak = 0;
      }
    }
    
    return { currentStreak, longestStreak, activityDays };
  }, [progressData, lessonData, languageNames]);
  
  // Get activity status for each day in the current month
  const dayStatus = useMemo(() => {
    return daysInMonth.map(day => {
      const dayActivities = activityDays.filter(activity => 
        isSameDay(activity.date, day)
      );
      
      return {
        date: day,
        hasActivity: dayActivities.length > 0,
        isToday: isToday(day),
        activities: dayActivities
      };
    });
  }, [daysInMonth, activityDays]);
  
  // Group days by week for display
  const weeks = useMemo(() => {
    const result = [];
    let week = [];
    
    for (const day of dayStatus) {
      week.push(day);
      
      // Start a new week on Sunday or at the end
      if (week.length === 7 || day === dayStatus[dayStatus.length - 1]) {
        result.push([...week]);
        week = [];
      }
    }
    
    return result;
  }, [dayStatus]);
  
  return (
    <>
      <Card className="mb-8 shadow-lg border-0 bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Learning Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 shadow-md flex-1">
              <div className="bg-orange-600/20 p-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-xl font-bold">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 shadow-md flex-1">
              <div className="bg-primary-foreground/70 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
                <p className="text-xl font-bold">{longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Reward Milestones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <div className="bg-gray-800/50 rounded-lg p-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-600/20 p-1.5 rounded-full">
                      <Flame className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="font-medium text-sm">3-Day Streak</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${currentStreak >= 3 ? 'text-green-500' : 'text-gray-400'}`} />
                    <Badge className={`${currentStreak >= 3 ? 'bg-green-600' : 'bg-slate-700'} text-xs`}>
                      {currentStreak >= 3 ? 'Earned' : 'In progress'}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-600/20 p-1.5 rounded-full">
                      <Flame className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="font-medium text-sm">7-Day Streak</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Lock className={`h-4 w-4 ${currentStreak >= 7 ? 'text-green-500' : 'text-gray-400'}`} />
                    <Badge className={`${currentStreak >= 7 ? 'bg-green-600' : 'bg-slate-700'} text-xs`}>
                      {currentStreak >= 7 ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Activity Calendar</h3>
                <div className="text-sm text-muted-foreground">
                  {format(showMonth, 'MMMM yyyy')}
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 max-w-xl mx-auto">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              
              <TooltipProvider>
                <div className="max-w-xl mx-auto">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                      {week.map((day, dayIndex) => (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div 
                              className={`
                                h-8 w-8 sm:h-9 sm:w-9 md:h-7 md:w-7 lg:h-6 lg:w-6 text-xs rounded-full 
                                flex items-center justify-center cursor-pointer 
                                transition-colors duration-200 shadow-sm
                                ${day.isToday 
                                  ? 'ring-2 ring-orange-500' 
                                  : day.hasActivity 
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-800/80 hover:bg-gray-700/90'
                                }
                                ${day.hasActivity && day.isToday ? 'bg-orange-500 text-white' : ''}
                              `}
                            >
                              {format(day.date, 'd')}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="p-1">
                              <p className="font-medium">{format(day.date, 'EEEE, MMMM d')}</p>
                              {day.hasActivity ? (
                                <>
                                  <p className="text-green-400">Lesson completed:</p>
                                  <ul className="text-xs mt-1">
                                    {day.activities.map((activity, i) => (
                                      <li key={i}>
                                        {activity.languageName}: {activity.lessonTitle}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              ) : (
                                <p className="text-gray-400">No lessons completed</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-2">Reminders & Notifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-lg shadow-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Daily Reminder at 10:00 AM</span>
                </div>
                <Switch />
              </div>
              
              <div className="bg-gray-800/50 rounded-lg shadow-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Email reminder</span>
                </div>
                <Switch />
              </div>
              
              <div className="bg-gray-800/50 rounded-lg shadow-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="text-sm">Mobile push</span>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}