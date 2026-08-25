import crypto from "node:crypto";
import OpenAI from "openai";
import { googleCloudAudioCache } from "./google-cloud-audio-cache";
import { toSafeProviderError, withProviderRetry } from "./services/provider-utils";

export interface TTSOptions {
  text: string;
  languageCode?: string;
}

export interface TTSResponse {
  audioData: string;
  success: boolean;
  error?: string;
}

const TTS_MODEL = "gpt-4o-mini-tts";
const MAX_TTS_CHARS = 4_000;

class OpenAITTSService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
    timeout: 30_000,
  });

  private cleanText(text: string) {
    return text
      .replace(/[*_~`#]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  private getVoice(languageCode: string): "coral" {
    // Coral provides the warm, clear tutoring voice used across the product.
    void languageCode;
    return "coral";
  }

  async generateSpeech(options: TTSOptions): Promise<TTSResponse> {
    const languageCode = options.languageCode ?? "en";
    const text = this.cleanText(options.text);
    if (!text) return { success: false, audioData: "", error: "Text is required for speech." };
    if (text.length > MAX_TTS_CHARS) {
      return { success: false, audioData: "", error: "This response is too long to read aloud." };
    }

    try {
      const cached = await googleCloudAudioCache.get(text, languageCode);
      if (cached) return { success: true, audioData: cached };
    } catch {
      // Audio caching is an optimization; it must never block the response.
    }

    try {
      const response = await withProviderRetry(() =>
        this.openai.audio.speech.create({
          model: TTS_MODEL,
          voice: this.getVoice(languageCode),
          input: text,
          response_format: "wav",
        }),
      );
      const audioData = Buffer.from(await response.arrayBuffer()).toString("base64");
      if (!audioData) throw new Error("Speech returned no audio");

      try {
        await googleCloudAudioCache.set(text, languageCode, audioData);
      } catch {
        // The generated speech is still valid if cache persistence is unavailable.
      }
      return { success: true, audioData };
    } catch (error) {
      return { success: false, audioData: "", error: toSafeProviderError(error, "Speech is unavailable right now.").message };
    }
  }

  createStableKey(text: string, languageCode = "en") {
    return crypto.createHash("sha256").update(`${languageCode}:${this.cleanText(text)}`).digest("hex");
  }
}

export const openaiTTSService = new OpenAITTSService();