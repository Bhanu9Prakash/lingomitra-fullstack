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
  audioData?: string | null; // Pre-generated audio data
  autoPlay?: boolean;
  isNewMessage?: boolean; // Only auto-play if this is a new message
  className?: string;
}

export function AudioPlayer({ text, languageCode = 'en', audioData, autoPlay = false, isNewMessage = false, className = '' }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Simple console logging for errors (toast will be added later)

  // Generate TTS audio
  const generateAudio = async () => {
    if (isLoading || !text.trim()) return;

    console.log('Generating TTS audio for text:', text.substring(0, 50) + '...');
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

      console.log('TTS API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('TTS API response:', { success: data.success, hasAudioData: !!data.audioData });
      
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
      
      console.log('Audio data length:', audioArray.length);
      
      // Create a proper WAV file with header for PCM data
      const wavBlob = createWavBlob(audioArray, 24000, 1); // 24kHz, mono
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
      
      console.log('Created audio blob URL:', url);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.src = url;
        console.log('Set audio source to:', url);
        if (autoPlay) {
          try {
            await audioRef.current.play();
            console.log('Auto-play successful');
          } catch (playError) {
            console.error('Auto-play failed:', playError);
          }
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
    console.log('Audio player clicked, audioUrl:', !!audioUrl, 'isLoading:', isLoading);
    
    if (!audioUrl) {
      console.log('No audio URL, generating audio...');
      await generateAudio();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        console.log('Pausing audio...');
        audioRef.current.pause();
      } else {
        try {
          console.log('Attempting to play audio...');
          // Ensure audio source is set
          if (audioUrl && audioRef.current.src !== audioUrl) {
            audioRef.current.src = audioUrl;
          }
          audioRef.current.load(); // Ensure audio is loaded
          await audioRef.current.play();
          console.log('Audio playing successfully');
        } catch (error) {
          console.error('Error playing audio:', error);
          // Try regenerating audio if playback fails
          console.log('Retrying with fresh audio generation...');
          setAudioUrl(null);
          await generateAudio();
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

  // Handle pre-generated audio data or auto-generate if needed
  useEffect(() => {
    if (audioData && !audioUrl) {
      // Use pre-generated audio data
      try {
        const binaryString = atob(audioData);
        const audioArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioArray[i] = binaryString.charCodeAt(i);
        }
        
        const wavBlob = createWavBlob(audioArray, 24000, 1);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
        
        // Set audio source for playback
        if (audioRef.current) {
          audioRef.current.src = url;
          // Auto-play only if enabled AND this is a new message
          if (autoPlay && isNewMessage) {
            console.log('Auto-playing new message');
            audioRef.current.play().catch(console.error);
          }
        }
      } catch (error) {
        console.error('Error processing pre-generated audio:', error);
      }
    } else if (text.trim() && !audioUrl && !isLoading && !audioData) {
      // Generate missing audio for messages without cached audio
      console.log('Generating missing audio for message');
      generateAudio();
    }
  }, [audioData, text]);

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