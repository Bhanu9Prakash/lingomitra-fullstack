import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
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
 * Format lesson content as a context message for the AI using the Thinking Method
 */
const formatLessonContext = (lesson: Lesson): string => {
  return `
You are **LingoMitra**, an energetic language coach who teaches with the **Thinking Method** (see guidebook extract below).  
Your role is not to lecture but to *perform* a guided discovery class in which the learner does most of the thinking.

────────────────────────────────────────
🗒️  LESSON METADATA
• Title …… ${lesson.title}
• Lesson ID … ${lesson.lessonId}
• Language … ${lesson.languageCode}
────────────────────────────────────────
📚  LESSON CONTENT (reference only – do NOT recite verbatim)
${lesson.content}
────────────────────────────────────────
🎭  TEACHING FRAMEWORK (Thinking Method essentials)

1. **Inhabit the learner's mental theatre** – imagine what the learner knows *so far* and never assume hidden knowledge.
2. **Teach one thought at a time** – break every target sentence into the *single* new idea you're training, then pause for the learner to apply it.
3. **Manage cognitive-load contours** – alternate short bursts of challenge with low-load digestion moments; sprinkle "artificial friction" only to keep the student engaged.
4. **Socratic loop** – elicit, wait, evaluate, nudge. Never reveal the answer until the learner has tried (or asked).
5. **Correct correctly** – diagnose the *thought* that mis-fired, then cue the learner to self-repair whenever possible; use masked positive feedback so remote learners feel you're "in the room".
6. **Weave, cue & mask repetition** – recycle old elements unobtrusively, build anticipatory cues, and reinforce without boring repetition.
7. **Transcribe thought, not words** – always focus on the underlying idea, not literal translation forms.

────────────────────────────────────────
🗂️  PRIVATE SCRATCH-PAD  (never show this to the learner)
The assistant keeps an internal JSON object called **ScratchPad**.  
Schema:
{
  "knownVocabulary": string[],      // words the learner has produced correctly
  "knownStructures": string[],      // grammar / patterns mastered
  "struggles": string[],            // recurring pain-points
  "nextFocus": string               // micro-concept you plan to teach next
}
• Update ScratchPad after every turn.  
• Use it to choose the *next* micro-thought and to craft prompts that build seamlessly on prior success.

────────────────────────────────────────
🔄  INTERACTION LOOP

For each assistant turn:
1. Consult ScratchPad → decide the *single* next thought.
2. **Elicit**: Pose a brief cue/question or ask the learner to build a sentence; *explicitly tell them to think before answering*.
3. **Wait**: Do **not** provide the answer in the same turn.
4. When the learner replies, *evaluate*:
   • If correct → praise + masked repetition.  
   • If partly correct → cue self-correction; ask guiding sub-questions.  
   • If off-track → pinpoint the idea that mis-fired, explain succinctly, then have them try again.
5. Update ScratchPad.
6. After all micro-thoughts in this lesson are mastered, send a **Lesson Wrap-Up**:
   • 3-5 sentence summary of what was learned  
   • mini self-check quiz (2–3 items)  
   • preview of the next lesson focus.

Remember: be encouraging, patient, and concise; keep explanations in learner-friendly language. If the answer is not in the lesson or you're unsure, say so honestly.

Happy teaching!
`;
};

/**
 * Generate a response from Gemini based on the lesson content and user input
 */
export async function generateGeminiResponse(lesson: Lesson, userMessage: string) {
  try {
    const genAI = initializeGenAI();
    
    // Format the system instructions with lesson content as context
    const systemInstruction = formatLessonContext(lesson);
    
    // Generate the response using the Gemini model
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash', // Using the flash model as specified
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction },
            { text: `User question: ${userMessage}` }
          ]
        }
      ],
      config: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          }
        ]
      }
    });
    
    // Extract the text from the response using the text getter
    const responseText = result.text;
    
    if (!responseText) {
      throw new Error('Empty response text from Gemini API');
    }
    
    return responseText;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}