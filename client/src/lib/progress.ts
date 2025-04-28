/**
 * Utility functions for tracking lesson progress using localStorage
 */

// Storage key for completed lessons
const COMPLETED_LESSONS_KEY = 'lingomitra_completed_lessons';

/**
 * Get all completed lesson IDs from localStorage
 */
export function getCompletedLessons(): string[] {
  try {
    const stored = localStorage.getItem(COMPLETED_LESSONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load completed lessons from localStorage:', error);
  }
  return [];
}

/**
 * Check if a specific lesson is completed
 */
export function isLessonCompleted(lessonId: string): boolean {
  const completedLessons = getCompletedLessons();
  return completedLessons.includes(lessonId);
}

/**
 * Mark a lesson as completed
 */
export function markLessonAsCompleted(lessonId: string): void {
  try {
    const completedLessons = getCompletedLessons();
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completedLessons));
    }
  } catch (error) {
    console.error('Failed to save lesson progress:', error);
  }
}

/**
 * Remove a lesson from completed list
 */
export function markLessonAsIncomplete(lessonId: string): void {
  try {
    let completedLessons = getCompletedLessons();
    completedLessons = completedLessons.filter(id => id !== lessonId);
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completedLessons));
  } catch (error) {
    console.error('Failed to update lesson progress:', error);
  }
}

/**
 * Reset all progress data (clears all completed lessons)
 */
export function resetProgress(): void {
  try {
    localStorage.removeItem(COMPLETED_LESSONS_KEY);
  } catch (error) {
    console.error('Failed to reset progress:', error);
  }
}

/**
 * Get the percentage of completed lessons for a specific language
 */
export function getLanguageProgress(languageCode: string, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  
  const completedLessons = getCompletedLessons();
  const completedForLanguage = completedLessons.filter(
    lessonId => lessonId.startsWith(`${languageCode}-lesson`)
  );
  
  return Math.round((completedForLanguage.length / totalLessons) * 100);
}