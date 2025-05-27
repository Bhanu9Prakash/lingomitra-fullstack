import { genai } from '@google/genai';

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
  private client: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for TTS functionality');
    }
    this.client = genai.Client({ apiKey: process.env.GEMINI_API_KEY });
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
   * Generate speech from text using Gemini 2.5 Flash TTS
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
      
      if (cleanText.length > 5000) {
        return {
          audioData: '',
          success: false,
          error: 'Text is too long for TTS generation (max 5000 characters)'
        };
      }

      const voice = this.getVoiceForLanguage(languageCode);
      const prompt = this.createTTSPrompt(cleanText, languageCode);

      const model = this.client.getGenerativeModel({ 
        model: 'gemini-2.5-flash-preview-tts' 
      });

      const response = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: voice 
              }
            }
          }
        }
      });

      const audioData = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioData) {
        return {
          audioData: '',
          success: false,
          error: 'No audio data received from TTS service'
        };
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