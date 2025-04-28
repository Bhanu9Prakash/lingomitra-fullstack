import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { generateGeminiResponse } from '../services/genai';

const router = Router();

/**
 * POST /api/chat
 * Generate a chat response based on lesson content and user message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { lessonId, message } = req.body;
    
    if (!lessonId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide lessonId and message.' 
      });
    }
    
    // Get the lesson content from storage
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ 
        error: `Lesson not found with ID: ${lessonId}` 
      });
    }
    
    // Generate response using the Gemini API
    const response = await generateGeminiResponse(lesson, message);
    
    return res.json({ response });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate response. Please try again later.' 
    });
  }
});

export default router;