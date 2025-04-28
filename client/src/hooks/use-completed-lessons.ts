import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lingomitra_completed_lessons';

export function useCompletedLessons() {
  // Initialize state from localStorage if available
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse completed lessons from localStorage:', error);
      return [];
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
    } catch (error) {
      console.error('Failed to store completed lessons to localStorage:', error);
    }
  }, [completedLessons]);

  // Mark a lesson as completed
  const markLessonCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  // Mark a lesson as not completed (for testing or resets)
  const markLessonNotCompleted = (lessonId: string) => {
    setCompletedLessons(completedLessons.filter(id => id !== lessonId));
  };

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  // Reset all completed lessons
  const resetCompletedLessons = () => {
    setCompletedLessons([]);
  };

  return {
    completedLessons,
    markLessonCompleted,
    markLessonNotCompleted,
    isLessonCompleted,
    resetCompletedLessons
  };
}