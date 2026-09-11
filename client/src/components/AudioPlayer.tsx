import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonAudio from './LessonAudio';

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
  const { user } = useAuth();
  const [deviceVoice, setDeviceVoice] = useState(false);
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
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
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
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
      if (response.ok && result.provider === "device") {
        if (!("speechSynthesis" in window)) throw new Error("No device voice available");
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ""));
        utterance.lang = languageCode;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(item => item.lang.toLowerCase().startsWith(languageCode.toLowerCase()));
        if (voice) utterance.voice = voice;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => { setIsPlaying(false); setError("A voice for this language is unavailable on your device."); };
        setDeviceVoice(true); setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
        return;
      }
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

  if (!text.trim() || user?.ttsEnabled === false) return null;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        disabled={isLoading}
        className="min-h-11 min-w-11 rounded-full text-foreground hover:bg-muted"
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
      {deviceVoice && <span className="text-xs text-muted-foreground">Device voice</span>}
      {error && <span className="text-sm" role="status">{error} You can try the device voice or continue reading.<LessonAudio text={text} language={languageCode}/></span>}
    </span>
  );
}
