import { Router, Request, Response } from 'express';
import { ttsService } from '../tts-service.js';

const router = Router();

/**
 * POST /api/tts/generate
 * Generate speech audio from text using Gemini TTS
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { text, languageCode } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string' 
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text cannot be empty' 
      });
    }

    const result = await ttsService.generateSpeech({
      text: text.trim(),
      languageCode: languageCode || 'en'
    });

    if (!result.success) {
      return res.status(500).json({ 
        error: result.error || 'Failed to generate speech' 
      });
    }

    // Return the audio data as base64
    res.json({
      audioData: result.audioData,
      success: true
    });

  } catch (error) {
    console.error('TTS endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error while generating speech' 
    });
  }
});

export default router;