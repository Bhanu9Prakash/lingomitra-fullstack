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

/**
 * Mark a lesson as completed in the database
 */
export async function markLessonAsCompleted(lessonId: string): Promise<void> {
  try {
    const response = await fetch(`/api/progress/${lessonId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark lesson as completed');
    }
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
}

/**
 * Update progress for a lesson
 */
export async function updateLessonProgress(lessonId: string, data: { 
  timeSpent?: number;
  score?: number;
  completed?: boolean;
}): Promise<void> {
  try {
    const response = await fetch(`/api/progress/${lessonId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update lesson progress');
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

/**
 * Check if a lesson is completed
 */
export function isLessonCompleted(progressRecords: UserProgress[], lessonId: string): boolean {
  const record = progressRecords.find(p => p.lessonId === lessonId);
  return record ? record.completed : false;
}

/**
 * Get an array of completed lesson IDs
 */
export function getCompletedLessons(progressRecords: UserProgress[]): string[] {
  return progressRecords
    .filter(record => record.completed)
    .map(record => record.lessonId);
}