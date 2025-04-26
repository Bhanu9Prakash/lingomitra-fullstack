import fs from 'fs/promises';
import path from 'path';
import { InsertLesson } from '@shared/schema';

// Function to read a lesson file and convert it to a lesson object
export async function readLessonFile(
  languageCode: string,
  filePath: string,
  orderIndex: number
): Promise<InsertLesson> {
  try {
    // Read the markdown file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract the filename without extension
    const fileName = path.basename(filePath, '.md');
    
    // Create lesson ID based on language code and file name
    const lessonId = `${languageCode}-${fileName}`;
    
    // Extract title from the first line (assuming it starts with # )
    let title = 'Untitled Lesson';
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim();
    }
    
    // Create and return a lesson object
    return {
      lessonId,
      languageCode,
      title,
      content,
      orderIndex
    };
  } catch (error) {
    console.error(`Error reading lesson file ${filePath}:`, error);
    throw error;
  }
}

// Function to read all lesson files from a language directory
export async function readLessonsFromDirectory(
  coursesDir: string,
  dirName: string,
  languageCode: string
): Promise<InsertLesson[]> {
  try {
    const languageDir = path.join(coursesDir, dirName);
    
    // Check if the language directory exists
    try {
      await fs.access(languageDir);
    } catch (error) {
      console.warn(`Language directory not found for ${dirName} (${languageCode})`);
      return [];
    }
    
    // Get all markdown files from the language directory
    const files = await fs.readdir(languageDir);
    const lessonFiles = files.filter(file => file.endsWith('.md'));
    
    // Sort files to ensure order (assuming they're named like lesson01.md, lesson02.md, etc.)
    lessonFiles.sort();
    
    // Read each lesson file and create lesson objects
    const lessons: InsertLesson[] = [];
    
    for (let i = 0; i < lessonFiles.length; i++) {
      const filePath = path.join(languageDir, lessonFiles[i]);
      const lesson = await readLessonFile(languageCode, filePath, i + 1);
      lessons.push(lesson);
    }
    
    return lessons;
  } catch (error) {
    console.error(`Error reading lessons from directory for ${dirName} (${languageCode}):`, error);
    throw error;
  }
}

// Function to read all lessons for all languages
export async function readAllLessons(coursesDir: string, languageCodes: string[]): Promise<InsertLesson[]> {
  try {
    const allLessons: InsertLesson[] = [];
    
    // Map language codes to directory names
    const languageDirectories: Record<string, string> = {
      'de': 'german',
      'es': 'spanish',
      'fr': 'french',
      'hi': 'hindi',
      'zh': 'chinese',
      'ja': 'japanese'
    };
    
    for (const languageCode of languageCodes) {
      // Get the directory name for this language code
      const dirName = languageDirectories[languageCode];
      if (!dirName) {
        console.warn(`No directory mapping for language code: ${languageCode}`);
        continue;
      }
      
      const languageLessons = await readLessonsFromDirectory(coursesDir, dirName, languageCode);
      allLessons.push(...languageLessons);
    }
    
    return allLessons;
  } catch (error) {
    console.error('Error reading all lessons:', error);
    throw error;
  }
}