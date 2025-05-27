import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Note: Toast functionality will be added when available

// Helper function to create a WAV file with proper headers for PCM data
function createWavBlob(pcmData: Uint8Array, sampleRate: number, channels: number): Blob {
  const length = pcmData.length;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  // WAV header
  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // File length minus RIFF identifier length and file description length
  view.setUint32(4, 36 + length, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // Format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, channels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2 * channels, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, 2 * channels, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // Data chunk length
  view.setUint32(40, length, true);
  
  // Copy the PCM data
  const uint8Array = new Uint8Array(buffer);
  uint8Array.set(pcmData, 44);
  
  return new Blob([buffer], { type: 'audio/wav' });
}

interface AudioPlayerProps {
  text: string;
  languageCode?: string;
  autoPlay?: boolean;
  className?: string;
}

export function AudioPlayer({ text, languageCode = 'en', autoPlay = false, className = '' }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Simple console logging for errors (toast will be added later)

  // Generate TTS audio
  const generateAudio = async () => {
    if (isLoading || !text.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          languageCode
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.audioData) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      // Convert base64 audio data to blob URL
      // The Gemini API returns raw PCM audio data as base64
      const binaryString = atob(data.audioData);
      const audioArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioArray[i] = binaryString.charCodeAt(i);
      }
      
      // Create a proper WAV file with header for PCM data
      const wavBlob = createWavBlob(audioArray, 24000, 1); // 24kHz, mono
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.src = url;
        if (autoPlay) {
          await audioRef.current.play();
        }
      }

    } catch (error) {
      console.error('Error generating TTS audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Play/pause audio
  const togglePlayback = async () => {
    if (!audioUrl) {
      await generateAudio();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
      console.error("There was an error playing the audio.");
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Auto-generate audio if autoPlay is enabled
  useEffect(() => {
    if (autoPlay && text.trim() && !audioUrl && !isLoading) {
      generateAudio();
    }
  }, [autoPlay, text, audioUrl, isLoading]);

  if (!text.trim()) {
    return null;
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        disabled={isLoading}
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        title={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      
      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
      />
    </div>
  );
}