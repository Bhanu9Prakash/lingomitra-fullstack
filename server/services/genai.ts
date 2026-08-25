import { GoogleGenAI } from "@google/genai";
import OpenAI, { toFile } from "openai";
import { Lesson } from "../../shared/schema";
import { ProviderRequestError, toSafeProviderError, withProviderRetry } from "./provider-utils";

const GEMINI_MODEL = "gemini-3.7-flash";
const TRANSCRIPTION_MODEL = "gpt-transcribe";
const REQUEST_TIMEOUT_MS = 30_000;

let geminiClient: GoogleGenAI | null = null;
let openAIClient: OpenAI | null = null;

function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("Google AI is not configured");
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

function getOpenAIClient() {
  if (!openAIClient) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI is not configured");
    openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: REQUEST_TIMEOUT_MS });
  }
  return openAIClient;
}

function formatLessonContext(lesson: Lesson): string {
  return `You are LingoMitra, a concise and encouraging language coach.

Lesson: ${lesson.title}
Target language: ${lesson.languageCode}
Lesson reference:
${lesson.content}

Teach through a reasoning-first loop: introduce one small idea, invite a learner attempt, diagnose the underlying thought if needed, and ask one focused follow-up. Keep replies to 50–150 words, never reveal internal planning, and never invent lesson facts.`;
}

export async function generateGeminiResponse(
  lesson: Lesson,
  userMessage: string,
  options: { signal?: AbortSignal } = {},
): Promise<string> {
  const abortSignal = options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const request = {
    model: GEMINI_MODEL,
    contents: [{ role: "user" as const, parts: [{ text: userMessage }] }],
    config: {
      systemInstruction: formatLessonContext(lesson),
      maxOutputTokens: 350,
      temperature: 0.6,
      topP: 0.8,
      abortSignal,
    },
  };

  try {
    const stream = await withProviderRetry(() => getGeminiClient().models.generateContentStream(request));
    let response = "";
    for await (const chunk of stream) response += chunk.text ?? "";
    if (response.trim()) return response.trim();
  } catch (streamError) {
    if (streamError instanceof Error && (streamError.name === "AbortError" || streamError.name === "TimeoutError")) {
      throw toSafeProviderError(streamError);
    }
  }

  try {
    const result = await withProviderRetry(() => getGeminiClient().models.generateContent(request));
    if (!result.text?.trim()) throw new Error("The coach returned an empty response");
    return result.text.trim();
  } catch (error) {
    throw toSafeProviderError(error);
  }
}

export type TranscriptionResult = {
  transcription: string;
  confidence: null;
  detectedLanguages: string[];
};

const mimeExtensions: Record<string, string> = {
  "audio/webm": "webm",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
};

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
  options: { signal?: AbortSignal } = {},
): Promise<TranscriptionResult> {
  if (!audioBuffer.length) throw new ProviderRequestError("The recording was empty.");
  if (audioBuffer.length > 10 * 1024 * 1024) throw new ProviderRequestError("The recording is too large.");
  if (!mimeExtensions[mimeType]) throw new ProviderRequestError("That recording format is not supported.");

  try {
    const file = await toFile(audioBuffer, `recording.${mimeExtensions[mimeType]}`, { type: mimeType });
    const result = await withProviderRetry(() =>
      getOpenAIClient().audio.transcriptions.create(
        { file, model: TRANSCRIPTION_MODEL, response_format: "json" },
        { signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
      ),
    );
    const transcription = result.text?.trim();
    if (!transcription) throw new Error("The recording did not contain understandable speech");

    return {
      transcription,
      confidence: null,
      detectedLanguages: (result.languages ?? []).map((language) => String(language)),
    };
  } catch (error) {
    throw toSafeProviderError(error, "We could not transcribe that recording. Please try again.");
  }
}

export async function generateGeminiAudioResponse(
  lesson: Lesson,
  audioBuffer: Buffer,
  mimeType: string,
) {
  const transcriptionResult = await transcribeAudio(audioBuffer, mimeType);
  const response = await generateGeminiResponse(lesson, transcriptionResult.transcription);
  return { response, ...transcriptionResult };
}