import { GoogleGenAI } from '@google/genai';
import { Lesson } from '../../shared/schema';

// Initialize the Gemini API client
const initializeGenAI = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Format lesson content as a context message for the AI
 */
const formatLessonContext = (lesson: Lesson): string => {
  return `
You are a knowledgeable AI tutor named LingoMitra. The student is currently learning from this lesson:

Title: ${lesson.title}
Lesson ID: ${lesson.lessonId}
Language: ${lesson.languageCode}

Content:
${lesson.content}

Your task is to help the student learn and understand this lesson. Answer their questions based on the lesson content.
Always be encouraging, patient, and accurate. If you don't know something or it's not in the lesson content,
admit that you don't know rather than making up information. Use simple language that's appropriate for a language learner.
You can provide examples, additional context, or explanations to help the student understand the material better.
`;
};

/**
 * Generate a response from Gemini based on the lesson content and user input
 */
export async function generateGeminiResponse(lesson: Lesson, userMessage: string) {
  try {
    const genAI = initializeGenAI();
    const model = genAI.getGenerativeModel('gemini-2.0-flash'); // Using the flash model as specified
    
    // Format the system instructions with lesson content as context
    const systemInstruction = formatLessonContext(lesson);
    
    // Configure generation parameters
    const generationConfig = {
      maxOutputTokens: 1024,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    };
    
    // Safety settings to ensure appropriate content
    const safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ];
    
    // Generate the response
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction },
            { text: `User question: ${userMessage}` }
          ]
        }
      ],
      generationConfig,
      safetySettings
    });
    
    // Extract the text from the response
    const responseText = result?.response?.text();
    
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }
    
    return responseText;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}