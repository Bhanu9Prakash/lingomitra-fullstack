import { db } from './db';
import { audioCache, insertAudioCacheSchema } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface TTSOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
}

interface TTSResponse {
  audioData: string; // Base64 encoded audio
  success: boolean;
  error?: string;
}

class TTSService {
  private apiKey: string;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for TTS functionality');
    }
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Get appropriate voice name based on language code
   */
  private getVoiceForLanguage(languageCode: string): string {
    const voiceMap: { [key: string]: string } = {
      'de': 'Kore', // German
      'es': 'Puck', // Spanish
      'fr': 'Charon', // French
      'it': 'Kore', // Italian
      'pt': 'Puck', // Portuguese
      'ru': 'Charon', // Russian
      'ja': 'Kore', // Japanese
      'ko': 'Puck', // Korean
      'zh': 'Charon', // Chinese
      'hi': 'Kore', // Hindi
      'ar': 'Puck', // Arabic
      'kn': 'Charon', // Kannada
      'en': 'Kore', // English (default)
    };
    
    return voiceMap[languageCode] || 'Kore';
  }

  /**
   * Create language-appropriate TTS prompt
   */
  private createTTSPrompt(text: string, languageCode: string): string {
    const languageInstructions: { [key: string]: string } = {
      'de': 'Speak in clear, native German with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'es': 'Speak in clear, native Spanish with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'fr': 'Speak in clear, native French with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'it': 'Speak in clear, native Italian with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'pt': 'Speak in clear, native Portuguese with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'ru': 'Speak in clear, native Russian with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'ja': 'Speak in clear, native Japanese with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'ko': 'Speak in clear, native Korean with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'zh': 'Speak in clear, native Chinese with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'hi': 'Speak in clear, native Hindi with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'ar': 'Speak in clear, native Arabic with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'kn': 'Speak in clear, native Kannada with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
      'en': 'Speak in clear, native English with proper pronunciation and natural rhythm. Use a friendly, encouraging tone suitable for language learning.',
    };

    const instruction = languageInstructions[languageCode] || languageInstructions['en'];
    
    return `${instruction}

Text to speak: "${text}"`;
  }

  /**
   * Create a cache key for the TTS request
   */
  private createCacheKey(text: string, languageCode: string): string {
    const content = `${text.trim()}_${languageCode}`;
    // Create a more robust hash for better caching
    let hash = 0;
    if (content.length === 0) return '0';
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Generate speech from text using Gemini 2.5 Flash TTS with caching
   */
  async generateSpeech(options: TTSOptions): Promise<TTSResponse> {
    try {
      const { text, languageCode = 'en' } = options;
      
      if (!text || text.trim().length === 0) {
        return {
          audioData: '',
          success: false,
          error: 'Text is required for TTS generation'
        };
      }

      // Check cache first
      const cacheKey = this.createCacheKey(text, languageCode);
      console.log('Looking for cached audio with hash:', cacheKey, 'for text:', text.substring(0, 30) + '...');
      
      try {
        const cached = await db.select().from(audioCache).where(eq(audioCache.textHash, cacheKey)).limit(1);
        if (cached.length > 0) {
          console.log('✅ TTS CACHE HIT! Using cached audio for:', text.substring(0, 50) + '...');
          return {
            audioData: cached[0].audioData,
            success: true
          };
        } else {
          console.log('❌ Cache miss - generating new audio for hash:', cacheKey);
        }
      } catch (cacheError) {
        console.error('Cache lookup error:', cacheError);
      }

      // Clean the text for better TTS output
      const cleanText = this.cleanTextForTTS(text);
      
      if (cleanText.length > 5000) {
        return {
          audioData: '',
          success: false,
          error: 'Text is too long for TTS generation (max 5000 characters)'
        };
      }

      const voice = this.getVoiceForLanguage(languageCode);
      const prompt = this.createTTSPrompt(cleanText, languageCode);

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 1,
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        }
      };

      console.log('Making TTS API call with:', {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey.substring(0, 10)}...`,
        bodyPreview: JSON.stringify(requestBody).substring(0, 200)
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      console.log('TTS API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('TTS API Error:', errorData);
        return {
          audioData: '',
          success: false,
          error: `TTS API error: ${response.status} ${response.statusText}`
        };
      }

      const responseText = await response.text();
      console.log('TTS API raw response:', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse TTS response as JSON:', parseError);
        console.error('Response content:', responseText);
        return {
          audioData: '',
          success: false,
          error: 'Invalid response format from TTS service'
        };
      }
      console.log('TTS Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioData) {
        return {
          audioData: '',
          success: false,
          error: 'No audio data received from TTS service'
        };
      }

      // Cache the successful result
      try {
        await db.insert(audioCache).values({
          textHash: cacheKey,
          languageCode,
          audioData
        }).onConflictDoNothing();
        console.log('✅ TTS result cached successfully for hash:', cacheKey);
      } catch (cacheError: any) {
        console.error('Cache save error:', cacheError);
      }

      return {
        audioData,
        success: true
      };

    } catch (error) {
      console.error('TTS Service Error:', error);
      return {
        audioData: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown TTS error'
      };
    }
  }

  /**
   * Clean text for better TTS output
   */
  private cleanTextForTTS(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
      
      // Clean up special characters that might affect TTS
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/…/g, '...')
      .replace(/–/g, '-')
      .replace(/—/g, ' - ')
      
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const ttsService = new TTSService();
export type { TTSOptions, TTSResponse };