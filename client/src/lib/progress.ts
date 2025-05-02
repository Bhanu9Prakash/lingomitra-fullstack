import { UserProgress, Lesson } from '@shared/schema';

/**
 * Calculate the percentage of completed lessons for a specific language
 */
export function calculateTotalProgressForLanguage(
  progressRecords: UserProgress[],
  lessons: Lesson[]
): number {
  if (!lessons.length) return 0;
  
  // Count completed lessons
  const completedLessons = progressRecords.filter(record => record.completed).length;
  
  // Calculate percentage
  return Math.round((completedLessons / lessons.length) * 100);
}

/**
 * Calculate the accuracy score (percentage of correct answers) for a specific lesson
 * Uses the score field from the database
 */
export function calculateLessonAccuracy(progressRecord: UserProgress | undefined): number {
  if (!progressRecord || !progressRecord.score) {
    return 0;
  }
  
  return Math.round(progressRecord.score * 100);
}

/**
 * Format time spent in minutes into a human-readable string
 */
export function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}