import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { generateGeminiResponse } from '../services/genai';
import { isAuthenticated } from '../auth';

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
    const userId = req.user?.id; // Get the user ID from the authenticated session
    
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
    
    // Check if we have existing chat history for this user and lesson
    let existingHistory;
    let messages: Message[] = [];
    
    if (userId) {
      existingHistory = await storage.getChatHistory(userId, lessonId);
      
      if (existingHistory && existingHistory.messages && Array.isArray(existingHistory.messages) && existingHistory.messages.length > 0) {
        // Use the existing chat history
        messages = existingHistory.messages as Message[];
        
        // Return the last assistant message
        const lastAssistantMessage = messages
          .filter(m => m.role === 'assistant')
          .pop();
          
        if (lastAssistantMessage) {
          return res.json({ 
            response: lastAssistantMessage.content,
            scratchPad: getDefaultScratchPad(),
            hasExistingHistory: true,
            historyLength: messages.length
          });
        }
      }
    }
    
    // If no existing history is found or no valid assistant messages, generate a new one
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
    const scratchPad = getDefaultScratchPad();
    
    // Apply the cleaning function
    response = cleanResponse(response);
    
    // Final cleanup - remove any lingering indicators or markdown language hints
    response = response
      .replace(/\b(json|markdown|javascript|typescript|js|ts)\b\s*$/i, '') // Remove language names at the end
      .replace(/```\s*$/g, '') // Remove any triple backticks that might have been missed
      .trim();
    
    // Save the initial greeting to the database if user is authenticated
    if (userId) {
      const assistantMessage: Message = { role: 'assistant', content: response };
      
      if (existingHistory) {
        // Update existing history
        messages.push(assistantMessage);
        await storage.saveChatHistory(userId, lessonId, messages);
      } else {
        // Create new history
        await storage.saveChatHistory(userId, lessonId, [assistantMessage]);
      }
    }
    
    return res.json({ 
      response,
      scratchPad,
      hasExistingHistory: false
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
    const userId = req.user?.id; // Get the user ID from the authenticated session
    
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
    
    // Save the conversation to the database if user is authenticated
    if (userId) {
      // Create a new message for the assistant's response
      const assistantMessage: Message = { role: 'assistant', content: responseText };
      
      // Get any existing chat history
      const existingHistory = await storage.getChatHistory(userId, lessonId);
      
      if (existingHistory && existingHistory.messages && Array.isArray(existingHistory.messages)) {
        // Update existing history with the new messages
        // Get existing messages
        let messages = existingHistory.messages as Message[];
        
        // Add new messages that aren't already in the history
        // First add the user's message if it's not the last one in the history
        if (messages.length === 0 || 
            messages[messages.length - 1].role !== 'user' || 
            messages[messages.length - 1].content !== latestUserMessage.content) {
          messages.push(latestUserMessage);
        }
        
        // Then add the assistant's response
        messages.push(assistantMessage);
        
        // Save the updated history
        await storage.saveChatHistory(userId, lessonId, messages);
      } else {
        // Create new history with the conversation
        await storage.saveChatHistory(userId, lessonId, conversation.concat(assistantMessage));
      }
    }
    
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

/**
 * DELETE /api/chat/history/:lessonId/reset
 * Reset chat history for a specific lesson
 */
router.delete('/history/:lessonId/reset', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    if (!lessonId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: lessonId' 
      });
    }
    
    // Get existing chat history
    const existingHistory = await storage.getChatHistory(userId, lessonId);
    
    if (!existingHistory) {
      return res.status(200).json({ 
        success: true,
        message: 'No chat history to reset'
      });
    }
    
    // Reset the chat history by saving an empty array of messages
    await storage.saveChatHistory(userId, lessonId, []);
    
    return res.status(200).json({ 
      success: true,
      message: 'Chat history reset successfully'
    });
    
  } catch (error) {
    console.error('Error resetting chat history:', error);
    
    return res.status(500).json({ 
      error: 'Failed to reset chat history. Please try again later.' 
    });
  }
});

/**
 * GET /api/chat/history/:lessonId
 * Retrieve chat history for a specific lesson
 */
router.get('/history/:lessonId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    if (!lessonId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: lessonId' 
      });
    }
    
    // Get the chat history from storage
    const chatHistory = await storage.getChatHistory(userId, lessonId);
    
    if (!chatHistory || !chatHistory.messages || !Array.isArray(chatHistory.messages) || chatHistory.messages.length === 0) {
      return res.status(404).json({ 
        error: 'No chat history found for this lesson' 
      });
    }
    
    return res.json({ 
      messages: chatHistory.messages
    });
    
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    
    return res.status(500).json({ 
      error: 'Failed to retrieve chat history. Please try again later.' 
    });
  }
});

export default router;