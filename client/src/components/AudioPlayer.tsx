import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Note: Toast functionality will be added when available

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
  const { toast } = useToast();

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
      const audioData = atob(data.audioData);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
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
      toast({
        title: "Audio Error",
        description: error instanceof Error ? error.message : "Failed to generate speech audio",
        variant: "destructive",
      });
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
          toast({
            title: "Playback Error",
            description: "Unable to play audio. Please try again.",
            variant: "destructive",
          });
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
      toast({
        title: "Audio Error",
        description: "There was an error playing the audio.",
        variant: "destructive",
      });
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
  }, [toast]);

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