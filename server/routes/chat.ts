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
    
    // Generate an initial greeting using the Gemini API
    const initialPrompt = `As LingoMitra, introduce yourself and this lesson (${lesson.title}) to the student. Be very brief (50-100 words maximum), welcoming, and mention just 1 key thing they'll learn first. 
    
IMPORTANT: Keep your response extremely short and focused. Start by teaching only the absolute basics. Always introduce new vocabulary or concepts before asking students to use them. Begin with a single teaching point, explain it clearly in 2-3 sentences max, and only then ask a simple practice question.`;
    
    // Get the initial response
    let response = await generateGeminiResponse(lesson, initialPrompt);
    const scratchPad = getDefaultScratchPad();
    
    // Apply the cleaning function
    response = cleanResponse(response);
    
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
    
    // Apply the cleaning function to remove ScratchPad content and markdown artifacts
    responseText = cleanResponse(responseText);
    
    // Attempt to detect and remove any lingering JSON that looks like a ScratchPad
    const removeScratchPadJSON = (text: string): string => {
      let result = text;
      
      // First pass: Try to remove explicitly formed ScratchPad JSON
      const scratchPadIndicators = ['"knownVocabulary"', '"knownStructures"', '"struggles"', '"nextFocus"', 'who'];
      
      // Check for any ScratchPad indicators
      if (scratchPadIndicators.some(indicator => result.includes(indicator))) {
        // Find all potential JSON objects in the text
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
            
            // Remove if looks like a ScratchPad (has at least 2 of the 5 fields or keywords)
            let matchCount = 0;
            scratchPadIndicators.forEach(indicator => {
              if (jsonPart.includes(indicator)) matchCount++;
            });
            
            if (matchCount >= 2) {
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
      }
      
      // Second pass: Remove specific text patterns that might be remnants of JSON
      // This handles incomplete JSON or text that looks like JSON but isn't properly formatted
      const jsonPatterns = [
        // Match "who we're talking about" and similar phrases which are often leftover from scratchpad explanation
        /who\s+we['']re\s+talking\s+about/gi,
        // Match "Notice how it starts with..." which is often explaining metadata
        /Notice\s+how\s+it\s+starts\s+with\s+.*?,\s+which\s+can\s+mean\s+.*?[\.\!]/gi,
        // Match "Notice how..." which is often explaining metadata
        /Notice\s+how\s+.*?[\.\!]/gi,
        // Match JSON key-value pair format that might be inline with text
        /"(knownVocabulary|knownStructures|struggles|nextFocus)"\s*:\s*(\[[^\]]*\]|null|"[^"]*")/g,
        // Match specific phrases like "telling you who we're talking about"
        /telling\s+you\s+who\s+.*?about/gi
      ];
      
      jsonPatterns.forEach(pattern => {
        result = result.replace(pattern, '');
      });
      
      // Third pass: Clean up any trailing JSON artifacts and punctuation
      result = result.replace(/\.\s*{/g, '.');  // Period followed by opening brace
      result = result.replace(/,\s*$/g, '.');   // Trailing comma
      result = result.replace(/:\s*$/g, '.');   // Trailing colon
      
      // Final pass: Remove any remnant "The" that might be left from "The 'nu'" after cleaning
      result = result.replace(/\s+The\s*$/g, '');
      
      return result.trim();
    };
    
    // Apply the JSON cleaning
    responseText = removeScratchPadJSON(responseText);
    
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