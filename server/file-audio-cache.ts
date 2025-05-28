import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

class FileAudioCache {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'audio-cache');
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private createCacheKey(text: string, languageCode: string): string {
    const content = `${text.trim()}_${languageCode}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private getCacheFilePath(cacheKey: string): string {
    return path.join(this.cacheDir, `${cacheKey}.wav`);
  }

  async get(text: string, languageCode: string): Promise<string | null> {
    try {
      const cacheKey = this.createCacheKey(text, languageCode);
      const filePath = this.getCacheFilePath(cacheKey);
      
      if (fs.existsSync(filePath)) {
        const audioBuffer = fs.readFileSync(filePath);
        return audioBuffer.toString('base64');
      }
      
      return null;
    } catch (error) {
      console.log('File cache read error:', error);
      return null;
    }
  }

  async set(text: string, languageCode: string, audioData: string): Promise<void> {
    try {
      const cacheKey = this.createCacheKey(text, languageCode);
      const filePath = this.getCacheFilePath(cacheKey);
      
      // Convert base64 back to buffer and save
      const audioBuffer = Buffer.from(audioData, 'base64');
      fs.writeFileSync(filePath, audioBuffer);
      
      console.log('Audio cached to file:', filePath);
    } catch (error) {
      console.log('File cache write error:', error);
    }
  }

  // Optional: Clean old cache files
  async cleanOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log('Cleaned old cache file:', file);
        }
      }
    } catch (error) {
      console.log('Cache cleanup error:', error);
    }
  }
}

export const fileAudioCache = new FileAudioCache();