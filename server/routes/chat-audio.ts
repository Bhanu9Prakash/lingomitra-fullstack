import { Router } from "express";
import multer from "multer";
import { generateGeminiAudioResponse } from "../services/genai";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Handle audio chat messages
router.post("/", upload.single('audio'), async (req, res) => {
  try {
    const { lessonId, conversation, scratchPad } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!lessonId) {
      return res.status(400).json({ error: "Lesson ID is required" });
    }

    // Get the lesson
    const lesson = await storage.getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Parse conversation and scratchPad from form data
    let parsedConversation = [];
    let parsedScratchPad = {
      knownVocabulary: [],
      knownStructures: [],
      struggles: [],
      nextFocus: null,
    };

    try {
      if (conversation) {
        parsedConversation = JSON.parse(conversation);
      }
      if (scratchPad) {
        parsedScratchPad = JSON.parse(scratchPad);
      }
    } catch (parseError) {
      console.error("Error parsing form data:", parseError);
    }

    // Generate response using Gemini with audio input
    const { response, transcription } = await generateGeminiAudioResponse(lesson, audioFile.buffer);

    // Save the conversation to chat history if user is authenticated
    const user = (req as any).user;
    if (user?.username) {
      const userId = user.username;
      
      // Build the updated conversation
      const userMessage = { role: "user" as const, content: transcription || "🎤 Audio message" };
      const assistantMessage = { role: "assistant" as const, content: response };
      const updatedMessages = [...parsedConversation.slice(0, -1), userMessage, assistantMessage];
      
      // Save to storage
      await storage.saveChatHistory(userId, lessonId, updatedMessages);
    }

    res.json({
      response,
      transcription,
      scratchPad: parsedScratchPad, // For now, return the same scratchPad
    });

  } catch (error) {
    console.error("Error processing audio chat:", error);
    res.status(500).json({ 
      error: "Failed to process audio message. Please try again." 
    });
  }
});

export default router;