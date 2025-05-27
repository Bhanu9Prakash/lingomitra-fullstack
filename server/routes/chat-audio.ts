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
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Handle audio chat messages
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const { lessonId, conversation, scratchPad } = req.body;
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!lessonId) {
      return res.status(400).json({ error: "Lesson ID is required" });
    }

    // Get the lesson from storage
    const lessons = await storage.getAllLessons();
    const lesson = lessons.find((l) => l.lessonId === lessonId);
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

    console.log(
      `Processing audio file: ${audioFile.originalname}, size: ${audioFile.size} bytes, type: ${audioFile.mimetype}`,
    );

    if (audioFile.size === 0) {
      return res.status(400).json({ error: "Audio file is empty" });
    }

    if (audioFile.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "Audio file too large" });
    }

    console.log("Starting Gemini audio processing...");
    const startTime = Date.now();

    // Generate response using Gemini with audio input
    const { response, transcription } = await generateGeminiAudioResponse(
      lesson,
      audioFile.buffer,
      audioFile.mimetype,
    );

    const processingTime = Date.now() - startTime;
    console.log(`Audio processing completed in ${processingTime}ms`);
    console.log("Transcription result:", transcription);
    console.log("Response preview:", response.substring(0, 100) + "...");

    // Save the conversation to chat history if user is authenticated
    const user = (req as any).user;

    if (user?.id) {
      // Ensure userId is a number - handle both string and number cases
      let userId: number;
      if (typeof user.id === "string") {
        userId = parseInt(user.id, 10);
        if (isNaN(userId)) {
          console.error("Invalid user ID format:", user.id);
          // Don't save to history if ID is invalid, but continue with response
        } else {
          // Valid numeric string converted to number
          const userMessage = {
            role: "user" as const,
            content: transcription || "🎤 Audio message",
          };
          const assistantMessage = {
            role: "assistant" as const,
            content: response,
          };
          const updatedMessages = [
            ...parsedConversation.slice(0, -1),
            userMessage,
            assistantMessage,
          ];

          await storage.saveChatHistory(userId, lessonId, updatedMessages);
        }
      } else if (typeof user.id === "number") {
        userId = user.id;

        // Build the updated conversation
        const userMessage = {
          role: "user" as const,
          content: transcription || "🎤 Audio message",
        };
        const assistantMessage = {
          role: "assistant" as const,
          content: response,
        };
        const updatedMessages = [
          ...parsedConversation.slice(0, -1),
          userMessage,
          assistantMessage,
        ];

        // Save to storage
        await storage.saveChatHistory(userId, lessonId, updatedMessages);
      } else {
        console.error(
          "User ID is neither string nor number:",
          user.id,
          "Type:",
          typeof user.id,
        );
      }
    }

    res.json({
      response,
      transcription,
      scratchPad: parsedScratchPad, // For now, return the same scratchPad
    });
  } catch (error) {
    console.error("Error processing audio chat:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error),
    );
    res.status(500).json({
      error: "Failed to process audio message. Please try again.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
