import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  text: string;
  languageCode?: string;
  audioData?: string | null;
  className?: string;
}

function base64ToWavUrl(audioData: string) {
  const binary = atob(audioData);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

export function AudioPlayer({ text, languageCode = "en", audioData, className = "" }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  function installAudioUrl(url: string) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = url;
    setAudioUrl(url);
  }

  useEffect(() => {
    if (audioData) installAudioUrl(base64ToWavUrl(audioData));
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [audioData]);

  async function play(url: string) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = url;
    await audio.play();
  }

  async function togglePlayback() {
    setError(null);
    if (isPlaying) {
      audioRef.current?.pause();
      return;
    }

    if (audioUrl) {
      await play(audioUrl).catch(() => {
        setIsPlaying(false);
        setError("Audio could not be played.");
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || !result.audioData) throw new Error("Speech unavailable");
      const url = base64ToWavUrl(result.audioData);
      installAudioUrl(url);
      await play(url);
    } catch {
      setIsPlaying(false);
      setError("Speech is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!text.trim()) return null;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        disabled={isLoading}
        className="min-h-11 min-w-11 rounded-full text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-950"
        aria-label={isPlaying ? "Pause coach audio" : "Play coach audio"}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => { setIsPlaying(false); setError("Audio could not be played."); }}
      />
      {error && <span className="sr-only" role="alert">{error}</span>}
    </span>
  );
}
