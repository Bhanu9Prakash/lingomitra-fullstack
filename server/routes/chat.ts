import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { generateGeminiResponse } from '../services/genai';
import { DEFAULT_ERROR_MESSAGE } from '../../client/src/lib/constants';

const router = Router();

// Request validation schema
const chatMessageSchema = z.object({
  lessonId: z.string(),
  message: z.string().min(1).max(500),
});

/**
 * POST /api/chat
 * Generate a chat response based on lesson content and user message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request
    const result = chatMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: result.error.format() 
      });
    }

    const { lessonId, message } = result.data;

    // Get the lesson content
    const lesson = await storage.getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Generate response using Gemini AI
    const response = await generateGeminiResponse(lesson, message);
    
    // Return the chat response to the client
    return res.json({ response });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE 
    });
  }
});

export default router;