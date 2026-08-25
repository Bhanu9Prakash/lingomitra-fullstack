import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { generateGeminiAudioResponse } from "../services/genai";
import { openaiTTSService } from "../openai-tts-service";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { assertLessonAccess } from "./progress";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("audio/")),
});

const scratchPadSchema = z.object({
  knownVocabulary: z.array(z.string().max(100)).max(50),
  knownStructures: z.array(z.string().max(100)).max(50),
  struggles: z.array(z.string().max(100)).max(50),
  nextFocus: z.string().max(200).nullable(),
});
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2_000),
});

router.post("/", isAuthenticated, upload.single("audio"), async (req, res) => {
  try {
    const lessonId = z.string().min(1).max(120).safeParse(req.body.lessonId);
    if (!lessonId.success) return res.status(400).json({ error: "A lesson is required." });
    if (!req.file?.size) return res.status(400).json({ error: "Record a short message first." });

    const lesson = await assertLessonAccess(req, lessonId.data);

    let conversation: Array<z.infer<typeof messageSchema>> = [];
    let scratchPad: z.infer<typeof scratchPadSchema> = {
      knownVocabulary: [],
      knownStructures: [],
      struggles: [],
      nextFocus: null,
    };
    try {
      if (req.body.conversation) conversation = z.array(messageSchema).max(40).parse(JSON.parse(req.body.conversation));
      if (req.body.scratchPad) scratchPad = scratchPadSchema.parse(JSON.parse(req.body.scratchPad));
    } catch {
      return res.status(400).json({ error: "The conversation data was invalid. Please refresh and try again." });
    }

    const { response, transcription } = await generateGeminiAudioResponse(lesson, req.file.buffer, req.file.mimetype);
    const userId = Number(req.user?.id);
    if (Number.isInteger(userId) && userId > 0) {
      await storage.saveChatHistory(userId, lessonId.data, [
        ...conversation.filter((message) => message.content !== "🎤 Processing audio..."),
        { role: "user", content: transcription },
        { role: "assistant", content: response },
      ]);
    }

    const speech = await openaiTTSService.generateSpeech({
      text: response,
      languageCode: lesson.languageCode,
    });

    return res.json({
      response,
      transcription,
      audioData: speech.success ? speech.audioData : null,
      scratchPad,
    });
  } catch (error) {
    console.error("Audio chat processing failed", error);
    if (error instanceof Error && "status" in error) {
      return res.status((error as Error & { status: number }).status).json({ error: error.message });
    }
    return res.status(500).json({ error: "We could not process that recording. Please try again." });
  }
});

export default router;