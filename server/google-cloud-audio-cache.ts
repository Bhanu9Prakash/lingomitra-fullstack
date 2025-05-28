import { Storage } from '@google-cloud/storage';
import * as crypto from 'crypto';

class GoogleCloudAudioCache {
  private storage: Storage;
  private bucketName: string;
  private bucket: any;

  constructor() {
    // Parse the Google Cloud credentials from environment
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || '';
    
    this.storage = new Storage({
      credentials,
      projectId: credentials.project_id,
    });
    
    this.bucket = this.storage.bucket(this.bucketName);
  }

  private createCacheKey(text: string, languageCode: string): string {
    const content = `${text.trim()}_${languageCode}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private getObjectName(cacheKey: string): string {
    return `audio-cache/${cacheKey}.wav`;
  }

  async get(text: string, languageCode: string): Promise<string | null> {
    try {
      const cacheKey = this.createCacheKey(text, languageCode);
      const objectName = this.getObjectName(cacheKey);
      const file = this.bucket.file(objectName);
      
      const [exists] = await file.exists();
      if (!exists) {
        return null;
      }
      
      const [buffer] = await file.download();
      return buffer.toString('base64');
    } catch (error) {
      console.log('Google Cloud Storage cache read error:', error);
      return null;
    }
  }

  async set(text: string, languageCode: string, audioData: string): Promise<void> {
    try {
      const cacheKey = this.createCacheKey(text, languageCode);
      const objectName = this.getObjectName(cacheKey);
      const file = this.bucket.file(objectName);
      
      // Convert base64 back to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Upload to Google Cloud Storage
      await file.save(audioBuffer, {
        metadata: {
          contentType: 'audio/wav',
          cacheControl: 'public, max-age=86400', // Cache for 1 day
        },
      });
      
      console.log('Audio cached to Google Cloud Storage:', objectName);
    } catch (error) {
      console.log('Google Cloud Storage cache write error:', error);
    }
  }

  // Optional: Clean old cache files (for cost optimization)
  async cleanOldCache(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const [files] = await this.bucket.getFiles({
        prefix: 'audio-cache/',
      });
      
      const cutoffDate = new Date(Date.now() - maxAgeMs);
      
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const createdDate = new Date(metadata.timeCreated);
        
        if (createdDate < cutoffDate) {
          await file.delete();
          console.log('Cleaned old cache file:', file.name);
        }
      }
    } catch (error) {
      console.log('Google Cloud Storage cleanup error:', error);
    }
  }
}

export const googleCloudAudioCache = new GoogleCloudAudioCache();