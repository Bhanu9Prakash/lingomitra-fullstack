import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { generateGeminiResponse } from '../services/genai';
import { type Message, type ScratchPad, type User } from '@shared/schema';

const router = Router();

// Initialize a default ScratchPad
const getDefaultScratchPad = (): ScratchPad => ({
  knownVocabulary: [],
  knownStructures: [],
  struggles: [],
  nextFocus: null
});

/**
 * Clean AI responses of any ScratchPad content and markdown artifacts
 */
const cleanResponse = (text: string): string => {
  let cleaned = text;
  
  // Remove [SCRATCHPAD] markers and their content
  cleaned = cleaned.replace(/\[SCRATCHPAD\][\s\S]*?```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/\[SCRATCHPAD\]/g, '');
  
  // Remove empty code blocks
  cleaned = cleaned.replace(/```[\s\n]*```/g, '');
  cleaned = cleaned.replace(/```[a-z]*[\s\n]*```/g, '');
  
  // Remove trailing/leading backticks
  cleaned = cleaned.replace(/```\s*$/g, '');
  cleaned = cleaned.replace(/^\s*```/g, '');
  
  // Remove alternative triple backtick styles
  cleaned = cleaned.replace(/`\s*`\s*`/g, '');
  
  // Remove standalone backtick pairs
  cleaned = cleaned.replace(/([^\w`])`{1,2}([^\w`])/g, '$1$2');
  
  // Remove trailing words that could be leftover language identifiers from markdown
  cleaned = cleaned.replace(/\s+(json|javascript|js|ts|typescript|python|java|cpp|csharp|ruby|go|bash|shell)$/gi, '');
  
  // Remove common markdown artifacts like underscores and asterisks that might be left at the end
  cleaned = cleaned.replace(/[\*\_\`]+\s*$/g, '');
  
  // Trim any excess whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

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
    
    // Get authenticated user from session
    const user = req.user as User;
    
    // Check if a chat session already exists for this user and lesson
    let chatSession = await storage.getChatSessionForUserAndLesson(user.id, lessonId);
    
    // If no chat session exists, create one
    if (!chatSession) {
      chatSession = await storage.createChatSession({
        userId: user.id,
        lessonId: lessonId,
        scratchPad: getDefaultScratchPad()
      });
    }
    
    // Get existing chat messages if any
    const existingMessages = await storage.getChatMessagesForSession(chatSession.id);
    
    // If chat history exists, return it
    if (existingMessages.length > 0) {
      return res.json({
        existingSession: true,
        messages: existingMessages,
        scratchPad: chatSession.scratchPad
      });
    }
    
    // If no chat history, generate an initial greeting
    const initialPrompt = `As LingoMitra, introduce yourself and this lesson (${lesson.title}) to the student. Be very brief (50-100 words maximum), welcoming, and mention just 1 key thing they'll learn first. 
    
IMPORTANT: 
1. Keep your response extremely short and focused. 
2. Start by teaching only the absolute basics. 
3. Always introduce new vocabulary or concepts before asking students to use them. 
4. Begin with a single teaching point, explain it clearly in 2-3 sentences max.
5. ALWAYS end your message with a clear, simple question or prompt for the student to respond to.
6. NEVER add language identifiers like "json", "javascript", etc. at the end of your message.
7. Use a friendly, encouraging tone that makes learning fun.
8. Make sure your ending question is specific and requires only a short response from the student.
9. NEVER ask students to pronounce or "sound out" words - this is a text-based chat.
10. When teaching pronunciation, show the written form with pronunciation hints, but ask students to type responses rather than pronounce words.
11. Focus on text-based activities like typing words, identifying patterns, or answering questions about meaning/usage.`;
    
    // Get the initial response
    let response = await generateGeminiResponse(lesson, initialPrompt);
    
    // Apply the cleaning function
    response = cleanResponse(response);
    
    // Final cleanup - remove any lingering indicators or markdown language hints
    response = response
      .replace(/\b(json|markdown|javascript|typescript|js|ts)\b\s*$/i, '') // Remove language names at the end
      .replace(/```\s*$/g, '') // Remove any triple backticks that might have been missed
      .trim();
    
    // Save assistant message to database
    await storage.addChatMessage({
      sessionId: chatSession.id,
      role: 'assistant',
      content: response,
      createdAt: new Date()
    });
    
    // Return the response and initial scratchPad
    return res.json({ 
      existingSession: false,
      messages: [{ role: 'assistant', content: response }],
      scratchPad: chatSession.scratchPad
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
    const { lessonId, message, scratchPad } = req.body;
    
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
    
    // Get authenticated user
    const user = req.user as User;
    
    // Get or create chat session
    let chatSession = await storage.getChatSessionForUserAndLesson(user.id, lessonId);
    
    if (!chatSession) {
      chatSession = await storage.createChatSession({
        userId: user.id,
        lessonId: lessonId,
        scratchPad: scratchPad || getDefaultScratchPad()
      });
    }
    
    // Get chat history
    const chatHistory = await storage.getChatMessagesForSession(chatSession.id);
    
    // Save user message to database
    await storage.addChatMessage({
      sessionId: chatSession.id,
      role: 'user',
      content: message,
      createdAt: new Date()
    });
    
    // Format the conversation history for the AI
    const conversationHistory = chatHistory
      .map(msg => `${msg.role === 'user' ? 'Student' : 'LingoMitra'}: ${msg.content}`)
      .join('\n\n');
    
    // Create a combined prompt with conversation history and ScratchPad
    const fullPrompt = `
Here's the conversation so far:
${conversationHistory}

Current ScratchPad state:
${JSON.stringify(chatSession.scratchPad || getDefaultScratchPad(), null, 2)}

Student's latest message: ${message}

Based on the conversation history and ScratchPad, please respond according to the Thinking Method guidelines. 

IMPORTANT GUIDELINES:
1. Keep your response extremely short and focused (50-150 words maximum).
2. Focus on only ONE concept at a time.
3. Use simple language with 2-3 short paragraphs at most.
4. Remember to teach before testing. Always introduce and clearly explain any new vocabulary, grammar, or concepts before asking the student to use them.
5. If the student's message indicates confusion, take a step back and provide clearer, simpler explanations.
6. Break down complex explanations into multiple short messages rather than one long explanation.
7. NEVER add language identifiers like "json", "javascript", etc. at the end of your message.
8. ALWAYS be respectful and supportive even if the student is confused or provides an incorrect answer.
9. ALWAYS end your message with a clear question or prompt for the student to respond to. This is critical for guiding their learning journey.
10. Make your questions progressively build on previous knowledge and guide the student to the next logical concept.
11. NEVER ask students to pronounce or "sound out" words - this is a text-based chat, so focus on text-based activities like typing words, identifying patterns, or answering questions about meaning/usage.
12. When teaching language pronunciation or sounds, provide the information but don't ask students to practice speaking - instead ask them to identify patterns or provide written answers.

Include an updated ScratchPad as a JSON object at the end of your response, prefixed with [SCRATCHPAD] and surrounded by triple backticks.
`;
    
    // Generate response using the Gemini API
    let fullResponse = await generateGeminiResponse(lesson, fullPrompt);
    
    // Extract the updated ScratchPad if it exists
    let updatedScratchPad = chatSession.scratchPad || getDefaultScratchPad();
    let responseText = fullResponse;
    
    // Check if the response contains a ScratchPad section
    const scratchPadMatch = fullResponse.match(/\[SCRATCHPAD\]\s*```([\s\S]*?)```/);
    if (scratchPadMatch && scratchPadMatch[1]) {
      try {
        // Parse the JSON ScratchPad
        updatedScratchPad = JSON.parse(scratchPadMatch[1].trim());
        
        // Update scratchPad in database
        await storage.updateChatSessionScratchPad(chatSession.id, updatedScratchPad);
        
        // Remove the ScratchPad section from the response
        responseText = fullResponse.replace(/\[SCRATCHPAD\]\s*```[\s\S]*?```/, '').trim();
      } catch (e) {
        console.error('Error parsing ScratchPad:', e);
        // If parsing fails, keep the original ScratchPad
      }
    }
    
    // Apply the cleaning function to remove ScratchPad content and markdown artifacts
    responseText = cleanResponse(responseText);
    
    // Attempt to detect and remove any lingering JSON that looks like a ScratchPad
    const removeScratchPadJSON = (text: string): string => {
      // Only proceed if there are keywords suggesting ScratchPad content
      if (!text.includes('"knownVocabulary"') && 
          !text.includes('"knownStructures"') && 
          !text.includes('"struggles"') && 
          !text.includes('"nextFocus"')) {
        return text;
      }
      
      // Find all potential JSON objects in the text
      let result = text;
      let jsonStartPos = result.indexOf('{');
      
      while (jsonStartPos !== -1) {
        // Find the matching closing brace
        let depth = 0;
        let jsonEndPos = -1;
        
        for (let i = jsonStartPos; i < result.length; i++) {
          if (result[i] === '{') {
            depth++;
          } else if (result[i] === '}') {
            depth--;
            if (depth === 0) {
              jsonEndPos = i + 1;
              break;
            }
          }
        }
        
        if (jsonEndPos !== -1) {
          const jsonPart = result.substring(jsonStartPos, jsonEndPos);
          
          // Only remove if it looks like a ScratchPad (has at least 3 of the 4 fields)
          let scratchPadFieldCount = 0;
          if (jsonPart.includes('"knownVocabulary"')) scratchPadFieldCount++;
          if (jsonPart.includes('"knownStructures"')) scratchPadFieldCount++;
          if (jsonPart.includes('"struggles"')) scratchPadFieldCount++;
          if (jsonPart.includes('"nextFocus"')) scratchPadFieldCount++;
          
          if (scratchPadFieldCount >= 3) {
            // Remove the JSON part
            result = result.substring(0, jsonStartPos) + result.substring(jsonEndPos);
            // Continue searching from the current position
            jsonStartPos = result.indexOf('{', jsonStartPos);
          } else {
            // Move to the next JSON object, if any
            jsonStartPos = result.indexOf('{', jsonStartPos + 1);
          }
        } else {
          // No matching closing brace, exit the loop
          break;
        }
      }
      
      return result.trim();
    };
    
    // Apply the JSON cleaning
    responseText = removeScratchPadJSON(responseText);
    
    // Final cleanup - remove any lingering indicators or markdown language hints
    responseText = responseText
      .replace(/\b(json|markdown|javascript|typescript|js|ts)\b\s*$/i, '') // Remove language names at the end
      .replace(/```\s*$/g, '') // Remove any triple backticks that might have been missed
      .trim();
    
    // Save assistant message to database
    await storage.addChatMessage({
      sessionId: chatSession.id,
      role: 'assistant',
      content: responseText,
      createdAt: new Date()
    });
    
    // Get updated chat history
    const updatedChatHistory = await storage.getChatMessagesForSession(chatSession.id);
    
    return res.json({ 
      messages: updatedChatHistory,
      scratchPad: updatedScratchPad
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate response. Please try again later.' 
    });
  }
});

/**
 * GET /api/chat/sessions
 * Get a list of all chat sessions for the authenticated user
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const sessions = await storage.getChatSessionsForUser(user.id);
    
    // For each session, get the associated lesson title
    const sessionsWithLessonInfo = await Promise.all(
      sessions.map(async (session) => {
        const lesson = await storage.getLessonById(session.lessonId);
        return {
          id: session.id,
          lessonId: session.lessonId,
          lessonTitle: lesson ? lesson.title : 'Unknown Lesson',
          updatedAt: session.updatedAt
        };
      })
    );
    
    return res.json(sessionsWithLessonInfo);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

/**
 * GET /api/chat/session/:id
 * Get details of a specific chat session including messages
 */
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    // Get the chat session
    const chatSession = await storage.getChatSession(sessionId);
    
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Ensure the session belongs to the authenticated user
    const user = req.user as User;
    if (chatSession.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get the lesson details
    const lesson = await storage.getLessonById(chatSession.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // Get the chat messages
    const messages = await storage.getChatMessagesForSession(sessionId);
    
    return res.json({
      session: chatSession,
      lesson: {
        id: lesson.lessonId,
        title: lesson.title,
        languageCode: lesson.languageCode
      },
      messages
    });
  } catch (error) {
    console.error('Error getting chat session details:', error);
    return res.status(500).json({ error: 'Failed to fetch chat session details' });
  }
});

export default router;