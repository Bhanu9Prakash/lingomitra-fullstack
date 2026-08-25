import express from "express";
import { storage } from "../storage";
import { insertConversationSessionSchema, insertConversationTranscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { openaiTTSService } from "../openai-tts-service";
import { transcribeAudio, generateGeminiResponse } from "../services/genai";
import { isAuthenticated } from "../auth";

export const conversationRouter = express.Router();

// Define conversation topics and scenarios
const conversationScenarios = {
  restaurant: [
    "You are at a restaurant ordering food. The AI will play the role of a waiter.",
    "You are a waiter taking an order from a customer at a restaurant.",
    "You are at a cafe ordering drinks and pastries."
  ],
  travel: [
    "You are at the airport checking in for your flight. The AI will play the role of airport staff.",
    "You are booking a hotel room. The AI will play the role of hotel reception.",
    "You are asking for directions in a foreign city. The AI will play the role of a local."
  ],
  shopping: [
    "You are at a clothing store looking for specific items. The AI will play the role of a sales assistant.",
    "You are at a grocery store asking about products. The AI will play the role of a store employee.",
    "You are returning an item to a store. The AI will play the role of customer service."
  ],
  business: [
    "You are in a job interview. The AI will play the role of the interviewer.",
    "You are presenting a project to colleagues. The AI will play the role of your team.",
    "You are negotiating a business deal. The AI will play the role of a client."
  ],
  daily: [
    "You are making small talk with a neighbor. The AI will play the role of your neighbor.",
    "You are at the doctor's office describing symptoms. The AI will play the role of a doctor.",
    "You are talking to a friend about your weekend plans."
  ],
  medical: [
    "You are at a clinic describing a simple symptom. The AI will play the role of a clinician.",
    "You are at a pharmacy asking for help. The AI will play the role of a pharmacist."
  ]
};

// Create a new conversation session
conversationRouter.post("/sessions", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to start a conversation practice" });
    }

    const { languageCode, topic, difficultyLevel } = req.body;

    if (!languageCode || !topic) {
      return res.status(400).json({ error: "Language code and topic are required" });
    }

    // Validate topic
    if (!conversationScenarios[topic as keyof typeof conversationScenarios]) {
      return res.status(400).json({ error: "Invalid topic" });
    }

    // Select a random scenario for the topic
    const scenarios = conversationScenarios[topic as keyof typeof conversationScenarios];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const sessionData = insertConversationSessionSchema.parse({
      userId,
      languageCode,
      topic,
      difficultyLevel: difficultyLevel || 'beginner',
      scenario,
      messages: [],
      duration: 0,
      status: 'active'
    });

    const session = await storage.createConversationSession(sessionData);

    res.json({ session });
  } catch (error) {
    console.error('Error creating conversation session:', error);
    res.status(500).json({ error: 'Failed to create conversation session' });
  }
});

// Get user's conversation sessions
conversationRouter.get("/sessions", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to view conversation sessions" });
    }

    const { languageCode } = req.query;
    const sessions = await storage.getUserConversationSessions(userId, languageCode as string);

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching conversation sessions:', error);
    res.status(500).json({ error: 'Failed to fetch conversation sessions' });
  }
});

// Load one session only when it belongs to the signed-in learner.
conversationRouter.get("/sessions/:id", isAuthenticated, async (req, res) => {
  const sessionId = Number(req.params.id);
  if (!Number.isInteger(sessionId) || sessionId < 1) {
    return res.status(400).json({ error: "Invalid session" });
  }

  try {
    const session = await storage.getConversationSession(sessionId);
    if (!session || session.userId !== (req as any).user?.id) {
      return res.status(404).json({ error: "Conversation session not found" });
    }
    res.json({ session });
  } catch (error) {
    console.error("Error loading conversation session:", error);
    res.status(500).json({ error: "Failed to load conversation session" });
  }
});

// Process conversation message (text or audio)
conversationRouter.post("/sessions/:id/message", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to send messages" });
    }

    const sessionId = parseInt(req.params.id);
    const session = await storage.getConversationSession(sessionId);

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: "Conversation session not found" });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ error: "Conversation session is not active" });
    }

    const bodySchema = z.object({
      message: z.string().trim().min(1).max(2_000).optional(),
      audioData: z.string().min(1).max(14_000_000).optional(),
      audioMimeType: z.string().max(80).optional(),
    }).refine((body) => Boolean(body.message || body.audioData), {
      message: "Message or audio data is required",
    });
    const body = bodySchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: "Send a short message or a recording." });

    const { message, audioData: inputAudioData, audioMimeType } = body.data;
    let userMessage = message;

    // If audio data is provided, transcribe it first
    if (inputAudioData && !message) {
      try {
        const audioBuffer = Buffer.from(inputAudioData, "base64");
        const transcriptionResult = await transcribeAudio(audioBuffer, audioMimeType || "audio/webm");
        userMessage = transcriptionResult.transcription;
        await storage.createConversationTranscription(insertConversationTranscriptionSchema.parse({
          sessionId,
          audioData: inputAudioData,
          transcription: userMessage,
          languageCode: session.languageCode,
          confidence: transcriptionResult.confidence,
        }));
      } catch (transcriptionError) {
        console.error("Conversation transcription failed", transcriptionError);
        return res.status(422).json({ error: "We could not transcribe that recording. Please try again." });
      }
    }

    if (!userMessage) {
      return res.status(400).json({ error: "Message or audio data is required" });
    }

    // Add user message to conversation
    const messages = [...(session.messages as any[]), { role: 'user', content: userMessage }];

    // Generate AI response based on the conversation context
    const conversationContext = `
You are participating in a ${session.topic} conversation practice session in ${session.languageCode}. 
Difficulty level: ${session.difficultyLevel}
Scenario: ${session.scenario}

Previous conversation:
${messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

Please respond naturally as your role in this scenario. Keep responses appropriate for the ${session.difficultyLevel} level.
If this is the beginning of the conversation, start the roleplay according to the scenario.
Respond in ${session.languageCode === 'en' ? 'English' : session.languageCode === 'es' ? 'Spanish' : session.languageCode === 'fr' ? 'French' : session.languageCode === 'de' ? 'German' : session.languageCode === 'it' ? 'Italian' : session.languageCode === 'pt' ? 'Portuguese' : session.languageCode === 'ja' ? 'Japanese' : session.languageCode === 'ko' ? 'Korean' : session.languageCode === 'zh' ? 'Chinese' : session.languageCode === 'hi' ? 'Hindi' : session.languageCode === 'ar' ? 'Arabic' : session.languageCode === 'kn' ? 'Kannada' : 'the target language'}.
`;

    let aiResponse;
    try {
      // Create a mock lesson object for the conversation context
      const conversationLesson = {
        id: 0,
        lessonId: `conversation-${session.topic}`,
        languageCode: session.languageCode,
        title: `${session.topic} conversation practice`,
        content: conversationContext,
        orderIndex: 0
      };
      aiResponse = await generateGeminiResponse(conversationLesson, userMessage);
      aiResponse = z.string().trim().min(1).max(2_000).parse(aiResponse);
    } catch (aiError) {
      console.error('AI response generation error:', aiError);
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }

    // Add AI response to conversation
    const updatedMessages = [...messages, { role: 'assistant', content: aiResponse }];

    // Update session with new messages
    await storage.updateConversationSession(sessionId, {
      messages: updatedMessages,
      duration: session.duration + 1 // Increment turn count
    });

    // Generate TTS for AI response
    let responseAudioData = null;
    try {
      const ttsResult = await openaiTTSService.generateSpeech({
        text: aiResponse,
        languageCode: session.languageCode
      });
      
      if (ttsResult.success) {
        responseAudioData = ttsResult.audioData;
      }
    } catch (ttsError) {
      console.error("Conversation speech generation failed", ttsError);
      // Continue without audio
    }

    res.json({
      userMessage,
      aiResponse,
      audioData: responseAudioData,
      messages: updatedMessages
    });
  } catch (error) {
    console.error('Error processing conversation message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Complete a conversation session with feedback
conversationRouter.post("/sessions/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Please log in to complete conversation session" });
    }

    const sessionId = parseInt(req.params.id);
    const session = await storage.getConversationSession(sessionId);

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: "Conversation session not found" });
    }

    // Reflect observable activity without presenting a made-up fluency score.
    const messages = session.messages as any[];
    const learnerTurns = messages.filter((message) => message.role === "user").length;
    const feedback = learnerTurns
      ? `You expressed ${learnerTurns} idea${learnerTurns === 1 ? "" : "s"} in this ${session.topic} context. Revisit how you connect your first request to one follow-up question next time.`
      : `You opened a ${session.topic} practice space. Next time, try one short opening sentence, then add a follow-up question.`;

    const completedSession = await storage.completeConversationSession(sessionId, feedback, null);

    res.json({ session: completedSession });
  } catch (error) {
    console.error('Error completing conversation session:', error);
    res.status(500).json({ error: 'Failed to complete conversation session' });
  }
});

// Get available conversation topics
conversationRouter.get("/topics", (req, res) => {
  const topics = Object.keys(conversationScenarios).map(topic => ({
    id: topic,
    name: topic.charAt(0).toUpperCase() + topic.slice(1),
    scenarios: conversationScenarios[topic as keyof typeof conversationScenarios].length
  }));

  res.json({ topics });
});