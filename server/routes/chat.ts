import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { generateGeminiResponse } from '../services/genai';

const router = Router();

// Define the ScratchPad interface
interface ScratchPad {
  knownVocabulary: string[];
  knownStructures: string[];
  struggles: string[];
  nextFocus: string | null;
}

// Define the Message interface
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Initialize a default ScratchPad
const getDefaultScratchPad = (): ScratchPad => ({
  knownVocabulary: [],
  knownStructures: [],
  struggles: [],
  nextFocus: null
});

/**
 * POST /api/chat/init
 * Initialize a chat session with a greeting based on the lesson
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({ 
        error: 'Missing required field: lessonId' 
      });
    }
    
    // Get the lesson content from storage
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ 
        error: `Lesson not found with ID: ${lessonId}` 
      });
    }
    
    // Generate an initial greeting using the Gemini API
    const initialPrompt = `As LingoMitra, introduce yourself and this lesson (${lesson.title}) to the student. Be very brief (50-100 words maximum), welcoming, and mention just 1 key thing they'll learn first. 
    
IMPORTANT: Keep your response extremely short and focused. Start by teaching only the absolute basics. Always introduce new vocabulary or concepts before asking students to use them. Begin with a single teaching point, explain it clearly in 2-3 sentences max, and only then ask a simple practice question.`;
    
    const response = await generateGeminiResponse(lesson, initialPrompt);
    const scratchPad = getDefaultScratchPad();
    
    return res.json({ 
      response,
      scratchPad
    });
    
  } catch (error) {
    console.error('Error in chat init endpoint:', error);
    
    return res.status(500).json({ 
      error: 'Failed to initialize chat. Please try again later.' 
    });
  }
});

/**
 * POST /api/chat
 * Generate a chat response based on lesson content, conversation history, and user message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { lessonId, conversation, scratchPad } = req.body;
    
    if (!lessonId || !conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide lessonId and conversation history.' 
      });
    }
    
    // Get the lesson content from storage
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ 
        error: `Lesson not found with ID: ${lessonId}` 
      });
    }
    
    // Extract the latest user message
    const latestUserMessage = conversation[conversation.length - 1];
    if (latestUserMessage.role !== 'user') {
      return res.status(400).json({
        error: 'The last message in the conversation must be from the user.'
      });
    }
    
    // Format the conversation history for the AI
    const conversationHistory = conversation
      .slice(0, -1) // exclude the latest message which we're responding to
      .map(msg => `${msg.role === 'user' ? 'Student' : 'LingoMitra'}: ${msg.content}`)
      .join('\n\n');
    
    // Create a combined prompt with conversation history and ScratchPad
    const fullPrompt = `
Here's the conversation so far:
${conversationHistory}

Current ScratchPad state:
${JSON.stringify(scratchPad || getDefaultScratchPad(), null, 2)}

Student's latest message: ${latestUserMessage.content}

Based on the conversation history and ScratchPad, please respond according to the Thinking Method guidelines. 

IMPORTANT GUIDELINES:
1. Keep your response extremely short and focused (50-150 words maximum).
2. Focus on only ONE concept at a time.
3. Use simple language with 2-3 short paragraphs at most.
4. Remember to teach before testing. Always introduce and clearly explain any new vocabulary, grammar, or concepts before asking the student to use them.
5. If the student's message indicates confusion, take a step back and provide clearer, simpler explanations.
6. Break down complex explanations into multiple short messages rather than one long explanation.

Include an updated ScratchPad as a JSON object at the end of your response, prefixed with [SCRATCHPAD] and surrounded by triple backticks.
`;
    
    // Generate response using the Gemini API
    let fullResponse = await generateGeminiResponse(lesson, fullPrompt);
    
    // Extract the updated ScratchPad if it exists
    let updatedScratchPad = scratchPad || getDefaultScratchPad();
    let responseText = fullResponse;
    
    // Check if the response contains a ScratchPad section
    const scratchPadMatch = fullResponse.match(/\[SCRATCHPAD\]\s*```([\s\S]*?)```/);
    if (scratchPadMatch && scratchPadMatch[1]) {
      try {
        // Parse the JSON ScratchPad
        updatedScratchPad = JSON.parse(scratchPadMatch[1].trim());
        
        // Remove the ScratchPad section from the response
        responseText = fullResponse.replace(/\[SCRATCHPAD\]\s*```[\s\S]*?```/, '').trim();
      } catch (e) {
        console.error('Error parsing ScratchPad:', e);
        // If parsing fails, keep the original ScratchPad
      }
    }
    
    // More thorough ScratchPad and JSON cleanup
    
    // Remove any [SCRATCHPAD] text and backticks that might remain
    responseText = responseText.replace(/\[SCRATCHPAD\]\s*```/g, '');
    responseText = responseText.replace(/\[SCRATCHPAD\]/g, '');
    
    // Remove any isolated triple backticks that might remain at the end of the text
    responseText = responseText.replace(/```\s*$/g, '');
    
    // Advanced JSON detection and removal - handle any ScratchPad-like JSON
    // First look for any full JSON objects
    const jsonPattern = /\{[\s\S]*?\}/g;
    let match;
    while ((match = jsonPattern.exec(responseText)) !== null) {
      const potentialJson = match[0];
      // Only remove JSON that looks like a ScratchPad
      if (
        (potentialJson.includes('"knownVocabulary"') || potentialJson.includes('"known_vocabulary"')) && 
        (potentialJson.includes('"knownStructures"') || potentialJson.includes('"known_structures"')) && 
        (potentialJson.includes('"struggles"')) && 
        (potentialJson.includes('"nextFocus"') || potentialJson.includes('"next_focus"'))
      ) {
        responseText = responseText.replace(potentialJson, '');
      }
    }
    
    // Final cleanup - remove any trailing whitespace or unnecessary newlines
    responseText = responseText.trim();
    // Replace multiple consecutive newlines with just two
    responseText = responseText.replace(/\n{3,}/g, '\n\n');
    // Remove any leftover whitespace-only lines
    responseText = responseText.replace(/^\s*[\r\n]/gm, '');
    
    // Remove any empty or whitespace-only paragraphs
    responseText = responseText.replace(/<p>\s*<\/p>/g, '');
    
    return res.json({ 
      response: responseText,
      scratchPad: updatedScratchPad
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate response. Please try again later.' 
    });
  }
});

export default router;