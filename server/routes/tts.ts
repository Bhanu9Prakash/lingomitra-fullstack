import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { openaiTTSService } from "../openai-tts-service.js";

const router = Router();
const requestSchema = z.object({
  text: z.string().trim().min(1).max(4_000),
  languageCode: z.string().trim().regex(/^[a-z]{2,5}(?:-[A-Z]{2})?$/).default("en"),
}).strict();

router.post("/generate", isAuthenticated, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Send up to 4,000 characters and a valid language code." });

  try {
    const result = await openaiTTSService.generateSpeech(parsed.data);
    if (!result.success) return res.status(503).json({ error: result.error || "Speech is unavailable right now." });
    return res.json({ audioData: result.audioData, success: true });
  } catch (error) {
    console.error("TTS endpoint failed", error);
    return res.status(500).json({ error: "Speech is unavailable right now." });
  }
});

export default router;
