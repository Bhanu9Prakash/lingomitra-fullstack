/**
 * Utility functions for tracking lesson progress using the server-side API
 */
import { UserProgress } from '@shared/schema';
import { apiRequest } from './queryClient';
import { queryClient } from './queryClient';

// Fallback to localStorage if user is not logged in
const COMPLETED_LESSONS_KEY = 'lingomitra_completed_lessons';

/**
 * Get all completed lesson IDs 
 * - From API if user is logged in
 * - From localStorage if not logged in
 */
export async function getCompletedLessons(languageCode?: string): Promise<string[]> {
  try {
    // Try to get user info to check if logged in
    const userResponse = await fetch('/api/user');
    
    if (userResponse.ok) {
      // User is logged in, get from API
      const endpoint = languageCode 
        ? `/api/progress/language/${languageCode}`
        : null;
        
      if (endpoint) {
        const response = await fetch(endpoint);
        if (response.ok) {
          const progressData: UserProgress[] = await response.json();
          return progressData
            .filter(progress => progress.completed)
            .map(progress => progress.lessonId);
        }
      }
    } else {
      // User not logged in, get from localStorage
      const stored = localStorage.getItem(COMPLETED_LESSONS_KEY);
      if (stored) {
        const allLessons = JSON.parse(stored) as string[];
        return languageCode 
          ? allLessons.filter(id => id.startsWith(`${languageCode}-`))
          : allLessons;
      }
    }
  } catch (error) {
    console.error('Failed to load completed lessons:', error);
  }
  return [];
}

/**
 * Check if a specific lesson is completed
 */
export async function isLessonCompleted(lessonId: string): Promise<boolean> {
  try {
    // Try to get user info to check if logged in
    const userResponse = await fetch('/api/user');
    
    if (userResponse.ok) {
      // User is logged in, get from API
      const response = await fetch(`/api/progress/lesson/${lessonId}`);
      
      if (response.ok) {
        const progressData: UserProgress = await response.json();
        return progressData.completed;
      } else if (response.status === 404) {
        // Progress not found - not completed
        return false;
      }
    } else {
      // User not logged in, get from localStorage
      const completedLessons = await getLocalCompletedLessons();
      return completedLessons.includes(lessonId);
    }
  } catch (error) {
    console.error('Failed to check if lesson is completed:', error);
  }
  
  return false;
}

/**
 * Mark a lesson as completed
 */
export async function markLessonAsCompleted(lessonId: string): Promise<void> {
  try {
    // Try to get user info to check if logged in
    const userResponse = await fetch('/api/user');
    
    if (userResponse.ok) {
      // User is logged in, use API
      const response = await fetch(`/api/progress/lesson/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Invalidate queries for this lesson and language
        const langCode = lessonId.split('-')[0];
        queryClient.invalidateQueries({ queryKey: [`/api/progress/lesson/${lessonId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/progress/language/${langCode}`] });
      } else {
        console.error('Failed to mark lesson as complete', await response.text());
      }
    } else {
      // User not logged in, use localStorage
      const completedLessons = await getLocalCompletedLessons();
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completedLessons));
      }
    }
  } catch (error) {
    console.error('Failed to mark lesson as completed:', error);
  }
}

/**
 * Update lesson progress (time spent, progress percentage, etc.)
 */
export async function updateLessonProgress(
  lessonId: string, 
  progress: number, 
  timeSpent: number
): Promise<void> {
  try {
    // Try to get user info to check if logged in
    const userResponse = await fetch('/api/user');
    
    if (userResponse.ok) {
      // User is logged in, use API
      const response = await fetch(`/api/progress/lesson/${lessonId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress, timeSpent })
      });
      
      if (!response.ok) {
        console.error('Failed to update lesson progress', await response.text());
      }
    }
    // If user not logged in, we don't track detailed progress
  } catch (error) {
    console.error('Failed to update lesson progress:', error);
  }
}

/**
 * Get local completed lessons (for fallback when not logged in)
 */
function getLocalCompletedLessons(): string[] {
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
 * Remove a lesson from completed list
 */
export async function markLessonAsIncomplete(lessonId: string): Promise<void> {
  try {
    // Only for localStorage fallback - API doesn't support this
    const userResponse = await fetch('/api/user');
    
    if (!userResponse.ok) {
      // User not logged in, use localStorage
      let completedLessons = getLocalCompletedLessons();
      completedLessons = completedLessons.filter(id => id !== lessonId);
      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completedLessons));
    }
  } catch (error) {
    console.error('Failed to update lesson progress:', error);
  }
}

/**
 * Reset all progress data (clears all completed lessons)
 * Only for localStorage - API doesn't support this
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
export async function getLanguageProgress(languageCode: string, totalLessons: number): Promise<number> {
  if (totalLessons === 0) return 0;
  
  try {
    const completedLessons = await getCompletedLessons(languageCode);
    return Math.round((completedLessons.length / totalLessons) * 100);
  } catch (error) {
    console.error('Failed to calculate language progress:', error);
    return 0;
  }
}