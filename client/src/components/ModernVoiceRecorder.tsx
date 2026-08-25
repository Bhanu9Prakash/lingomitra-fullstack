import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, X } from "lucide-react";

interface ModernVoiceRecorderProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

export function ModernVoiceRecorder({ onAudioSubmit, disabled = false }: ModernVoiceRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "preview">("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef(false);
  const mimeTypeRef = useRef("audio/webm");
  const startedAtRef = useRef(0);

  function releaseCapture() {
    recordingRef.current = false;
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
  }

  function monitorAudioLevel() {
    const analyser = analyserRef.current;
    if (!analyser || !recordingRef.current) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    const energy = data.reduce((sum, sample) => sum + Math.abs(sample - 128), 0) / data.length;
    setAudioLevel(Math.min(1, energy / 38));
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }

  async function startRecording() {
    if (disabled || state !== "idle") return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const selectedMime = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      mimeTypeRef.current = recorder.mimeType || selectedMime || "audio/webm";
      audioChunksRef.current = [];
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        releaseCapture();
        setIsStopping(false);
        setState("idle");
        setError("The recording stopped unexpectedly. Please try again.");
      };
      recorder.onstop = () => {
        const duration = Date.now() - startedAtRef.current;
        mimeTypeRef.current = recorder.mimeType || audioChunksRef.current[0]?.type || mimeTypeRef.current;
        releaseCapture();
        setIsStopping(false);
        setAudioLevel(0);
        if (duration < 350 || audioChunksRef.current.length === 0) {
          audioChunksRef.current = [];
          setState("idle");
          setError("That recording was too short. Hold for a moment and try again.");
          return;
        }
        setState("preview");
      };

      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) {
        const context = new AudioContextConstructor();
        audioContextRef.current = context;
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        context.createMediaStreamSource(stream).connect(analyser);
        analyserRef.current = analyser;
      }

      recordingRef.current = true;
      recorder.start(250);
      setState("recording");
      monitorAudioLevel();
    } catch (captureError) {
      releaseCapture();
      const denied = captureError instanceof DOMException && captureError.name === "NotAllowedError";
      setError(denied ? "Allow microphone access, then tap the microphone again." : "We could not start the microphone. Please try again.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive" || isStopping) return;
    recordingRef.current = false;
    setIsStopping(true);
    recorder.stop();
  }

  function resetRecorder() {
    audioChunksRef.current = [];
    setAudioLevel(0);
    setError(null);
    setState("idle");
  }

  function submitRecording() {
    if (!audioChunksRef.current.length) return;
    const blob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
    onAudioSubmit(blob);
    resetRecorder();
  }

  useEffect(() => () => releaseCapture(), []);

  return (
    <div className="relative flex shrink-0 items-center">
      {state !== "preview" && (
        <button
          type="button"
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={disabled || isStopping}
          className={`grid min-h-11 min-w-11 place-items-center rounded-2xl border transition-colors ${state === "recording" ? "border-red-600 bg-red-600 text-white" : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-stone-700 dark:bg-stone-900 dark:text-amber-100"}`}
          aria-label={state === "recording" ? "Stop recording" : "Record an answer"}
          aria-pressed={state === "recording"}
        >
          {state === "recording" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {state === "recording" && <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-400" />}
        </button>
      )}

      {state === "recording" && (
        <div className="absolute bottom-full right-0 mb-3 flex h-10 w-52 items-center gap-1 rounded-2xl border border-amber-200 bg-[#fffaf3] px-3 shadow-lg dark:border-stone-700 dark:bg-stone-900" aria-live="polite">
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} className="w-1 rounded-full bg-orange-500 transition-[height] duration-75" style={{ height: `${Math.max(4, 5 + audioLevel * (8 + (index % 5) * 4))}px` }} />
          ))}
          <span className="sr-only">Recording</span>
        </div>
      )}

      {state === "preview" && (
        <div className="flex items-center gap-1 rounded-2xl border border-amber-200 bg-amber-50 p-1 dark:border-stone-700 dark:bg-stone-900">
          <button type="button" onClick={resetRecorder} className="grid min-h-9 min-w-9 place-items-center rounded-xl text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40" aria-label="Discard recording"><X className="h-4 w-4" /></button>
          <button type="button" onClick={submitRecording} className="grid min-h-9 min-w-9 place-items-center rounded-xl bg-orange-500 text-white hover:bg-orange-600" aria-label="Send recording"><Check className="h-4 w-4" /></button>
        </div>
      )}

      {error && <p role="alert" className="absolute bottom-full right-0 mb-3 w-64 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-lg dark:bg-red-950/80 dark:text-red-200">{error}</p>}
    </div>
  );
}
