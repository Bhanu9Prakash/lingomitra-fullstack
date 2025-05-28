import { googleCloudAudioCache } from './google-cloud-audio-cache';
import OpenAI from 'openai';

interface TTSOptions {
  text: string;
  languageCode?: string;
}

interface TTSResponse {
  audioData: string; // Base64 encoded audio
  success: boolean;
  error?: string;
}

class OpenAITTSService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Get appropriate voice name based on language code
   */
  private getVoiceForLanguage(languageCode: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    // OpenAI voices are optimized for English, but work for other languages
    const voiceMap: { [key: string]: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' } = {
      'en': 'alloy',
      'de': 'echo',    // Good for German
      'es': 'nova',    // Good for Spanish  
      'fr': 'shimmer', // Good for French
      'it': 'fable',   // Good for Italian
      'ja': 'onyx',    // Good for Japanese
      'ko': 'alloy',   // Korean
      'pt': 'nova',    // Portuguese
      'zh': 'onyx',    // Chinese
      'hi': 'shimmer', // Hindi
      'kn': 'fable',   // Kannada
    };
    
    return voiceMap[languageCode] || 'alloy';
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
   * Clean text for better TTS output
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/[*_~`]/g, '') // Remove markdown formatting
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Generate speech from text using OpenAI GPT-4o Mini TTS with caching
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

      // Clean the text for better TTS output
      const cleanText = this.cleanTextForTTS(text);

      // Check Google Cloud Storage cache first (using cleanText for consistency)
      try {
        const cachedAudio = await googleCloudAudioCache.get(cleanText, languageCode);
        if (cachedAudio) {
          console.log('Google Cloud Storage cache hit for:', text.substring(0, 50) + '...');
          return {
            audioData: cachedAudio,
            success: true
          };
        }
      } catch (cacheError) {
        console.log('Google Cloud Storage lookup error (continuing with API):', cacheError);
      }
      
      if (cleanText.length > 4000) {
        return {
          audioData: '',
          success: false,
          error: 'Text is too long for TTS generation (max 4000 characters)'
        };
      }

      const voice = this.getVoiceForLanguage(languageCode);
      
      console.log('Making OpenAI TTS API call for:', text.substring(0, 50) + '...', 'with voice:', voice);

      // Use OpenAI's GPT-4o Mini TTS
      const response = await this.openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice,
        input: cleanText,
        response_format: "wav"
      });

      console.log('OpenAI TTS response received successfully');

      // Convert the response to base64
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const audioData = Buffer.from(uint8Array).toString('base64');

      console.log('OpenAI TTS audio data length:', audioData.length);

      // Cache the successful result to Google Cloud Storage
      try {
        await googleCloudAudioCache.set(cleanText, languageCode, audioData);
        console.log('TTS result cached to Google Cloud Storage successfully');
      } catch (cacheError) {
        console.log('Google Cloud Storage save error (audio still works):', cacheError);
      }

      return {
        audioData,
        success: true
      };

    } catch (error) {
      console.error('OpenAI TTS Service Error:', error);
      return {
        audioData: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const openaiTTSService = new OpenAITTSService();