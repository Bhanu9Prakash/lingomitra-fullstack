import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, CircleStop, Lightbulb, Loader2, RefreshCcw, Send, Sparkles } from "lucide-react";
import { Lesson } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./AudioPlayer";
import MicrophonePermissionCheck from "./MicrophonePermissionCheck";
import { ModernVoiceRecorder } from "./ModernVoiceRecorder";

type Message = { role: "user" | "assistant"; content: string; audioData?: string | null };
type ScratchPad = { knownVocabulary: string[]; knownStructures: string[]; struggles: string[]; nextFocus: string | null };
const emptyScratchPad: ScratchPad = { knownVocabulary: [], knownStructures: [], struggles: [], nextFocus: null };
const scratchPadKey = (lessonId: string) => `lingomitra:scratchpad:${lessonId}`;

function isScratchPad(value: unknown): value is ScratchPad {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ScratchPad>;
  return Array.isArray(candidate.knownVocabulary)
    && Array.isArray(candidate.knownStructures)
    && Array.isArray(candidate.struggles)
    && (candidate.nextFocus === null || typeof candidate.nextFocus === "string")
    && candidate.knownVocabulary.every((item) => typeof item === "string")
    && candidate.knownStructures.every((item) => typeof item === "string")
    && candidate.struggles.every((item) => typeof item === "string");
}

function restoredScratchPad(lessonId: string): ScratchPad {
  try {
    const stored = sessionStorage.getItem(scratchPadKey(lessonId));
    const parsed = stored ? JSON.parse(stored) : null;
    return isScratchPad(parsed) ? parsed : emptyScratchPad;
  } catch {
    return emptyScratchPad;
  }
}

interface ChatUIProps { lesson: Lesson }

const ChatUI = forwardRef(({ lesson }: ChatUIProps, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scratchPad, setScratchPad] = useState<ScratchPad>(() => restoredScratchPad(lesson.lessonId));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  function updateScratchPad(value: unknown) {
    if (!isScratchPad(value)) return;
    setScratchPad(value);
    try {
      sessionStorage.setItem(scratchPadKey(lesson.lessonId), JSON.stringify(value));
    } catch {
      // Storage is optional; the current tutor session remains usable.
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function initialize() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/chat/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.lessonId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not open your tutor.");

      if (data.hasExistingHistory) {
        const history = await fetch(`/api/chat/history/${lesson.lessonId}`);
        const historyData = await history.json();
        if (history.ok && Array.isArray(historyData.messages)) setMessages(historyData.messages);
        else setMessages([{ role: "assistant", content: data.response }]);
      } else {
        setMessages([{ role: "assistant", content: data.response }]);
      }
      if (data.scratchPad && scratchPad.nextFocus === null) updateScratchPad(data.scratchPad);
    } catch (initializationError) {
      setError(initializationError instanceof Error ? initializationError.message : "We could not open your tutor.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setScratchPad(restoredScratchPad(lesson.lessonId));
    void initialize();
    return () => abortRef.current?.abort();
  }, [lesson.lessonId]);

  async function resetChatHistory() {
    const confirmed = window.confirm("Start this lesson conversation again? Your previous chat for this lesson will be cleared.");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/history/${lesson.lessonId}/reset`, { method: "DELETE" });
      if (!response.ok) throw new Error("We could not reset this conversation.");
      setMessages([]);
      setScratchPad(emptyScratchPad);
      try {
        sessionStorage.removeItem(scratchPadKey(lesson.lessonId));
      } catch {
        // Storage is optional.
      }
      await initialize();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "We could not reset this conversation.");
      setIsLoading(false);
    }
  }

  useImperativeHandle(ref, () => ({ resetChatHistory }));

  async function sendText(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;
    const learnerMessage: Message = { role: "user", content };
    const conversation = [...messages, learnerMessage];
    setMessages(conversation);
    setInput("");
    setError(null);
    setIsLoading(true);
    abortRef.current = new AbortController();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.lessonId, conversation, scratchPad }),
        signal: abortRef.current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not send that.");
      setMessages((previous) => [...previous, { role: "assistant", content: data.response, audioData: data.audioData }]);
      updateScratchPad(data.scratchPad);
    } catch (sendError) {
      if (!(sendError instanceof DOMException && sendError.name === "AbortError")) {
        setError(sendError instanceof Error ? sendError.message : "We could not send that.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  async function sendAudio(audioBlob: Blob) {
    if (isLoading) return;
    const pending: Message = { role: "user", content: "Transcribing your recording…" };
    setMessages((previous) => [...previous, pending]);
    setIsLoading(true);
    setError(null);
    abortRef.current = new AbortController();
    try {
      const formData = new FormData();
      const recordingExtension = audioBlob.type.includes("mp4") ? "m4a" : audioBlob.type.includes("ogg") ? "ogg" : audioBlob.type.includes("wav") ? "wav" : "webm";
      formData.append("audio", audioBlob, `learner-recording.${recordingExtension}`);
      formData.append("lessonId", lesson.lessonId);
      formData.append("conversation", JSON.stringify(messages));
      formData.append("scratchPad", JSON.stringify(scratchPad));
      const response = await fetch("/api/chat/audio", { method: "POST", body: formData, signal: abortRef.current.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not transcribe that.");
      setMessages((previous) => [
        ...previous.slice(0, -1),
        { role: "user", content: data.transcription },
        { role: "assistant", content: data.response, audioData: data.audioData },
      ]);
      updateScratchPad(data.scratchPad);
    } catch (audioError) {
      setMessages((previous) => previous.slice(0, -1));
      if (!(audioError instanceof DOMException && audioError.name === "AbortError")) {
        setError(audioError instanceof Error ? audioError.message : "We could not transcribe that.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <section className="mx-auto flex min-h-[min(680px,calc(100dvh-9rem))] max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-200/70 bg-[#fffdf8] shadow-[0_18px_50px_rgba(90,47,20,.10)] dark:border-amber-900/60 dark:bg-stone-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/70 px-4 py-3 dark:border-amber-950 dark:bg-amber-950/30 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-sm"><Bot className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="font-extrabold text-stone-900 dark:text-amber-50">Lesson tutor</p>
            <p className="truncate text-sm text-stone-600 dark:text-stone-300">{lesson.title}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={resetChatHistory} disabled={isLoading} className="min-h-11 gap-2 text-stone-700 dark:text-stone-200">
          <RefreshCcw className="h-4 w-4" /> Reset
        </Button>
      </header>

      <div className="border-b border-amber-100 px-4 py-2.5 dark:border-amber-950 sm:px-6">
        <p className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
          <Lightbulb className="h-4 w-4 text-orange-500" />
          <span><strong>Current focus:</strong> {scratchPad.nextFocus || "Notice one useful pattern, then try it."}</span>
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-500 text-white"><Sparkles className="h-4 w-4" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.role === "user" ? "rounded-tr-sm bg-orange-500 text-white" : "rounded-tl-sm border border-amber-100 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              {message.role === "assistant" && <AudioPlayer text={message.content} languageCode={lesson.languageCode} audioData={message.audioData} className="mt-1" />}
            </div>
          </article>
        ))}
        {isLoading && <div className="flex items-center gap-3 text-sm text-stone-500"><Loader2 className="h-5 w-5 animate-spin text-orange-500" /> LingoMitra is thinking…</div>}
        <div ref={endRef} />
      </div>

      {error && <p role="alert" className="mx-4 mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200 sm:mx-6">{error}</p>}
      <div className="border-t border-amber-100 bg-white/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90 sm:px-6">
        <MicrophonePermissionCheck />
        <form onSubmit={sendText} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) void sendText(event); }}
            placeholder="Write your answer…"
            disabled={isLoading}
            rows={1}
            className="min-h-11 max-h-32 flex-1 resize-none rounded-2xl border border-amber-200 bg-amber-50/30 px-4 py-2.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-900"
            aria-label="Message your lesson tutor"
          />
          <ModernVoiceRecorder onAudioSubmit={sendAudio} disabled={isLoading} />
          {isLoading ? (
            <Button type="button" variant="outline" size="icon" onClick={() => abortRef.current?.abort()} className="min-h-11 min-w-11 rounded-2xl" aria-label="Stop waiting for a response"><CircleStop className="h-5 w-5" /></Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} className="min-h-11 min-w-11 rounded-2xl bg-orange-500 hover:bg-orange-600" aria-label="Send message"><Send className="h-5 w-5" /></Button>
          )}
        </form>
      </div>
    </section>
  );
});

export default ChatUI;