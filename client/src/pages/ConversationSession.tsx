import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, CircleStop, MessageCircle, Mic, Send, Square } from "lucide-react";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { AudioPlayer } from "@/components/AudioPlayer";

interface ConversationMessage {
  role: string;
  content: string;
  audioData?: string | null;
}

interface ConversationSession {
  id: number;
  languageCode: string;
  topic: string;
  difficultyLevel: string;
  scenario: string;
  messages: ConversationMessage[];
  feedback?: string;
  duration: number;
  status: string;
}

interface ConversationSessionProps {
  session: ConversationSession;
  onComplete: () => void;
  onBack: () => void;
}

interface ConversationMessageResult {
  messages: ConversationMessage[];
  audioData?: string | null;
}

export function ConversationSession({ session, onComplete, onBack }: ConversationSessionProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<ConversationMessage[]>(session.messages);
  const [recordingLabel, setRecordingLabel] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useSimpleToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentMessages, isRecording]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message?: string; audioData?: string; audioMimeType?: string }) => {
      const response = await apiRequest("POST", `/api/conversation/sessions/${session.id}/message`, data);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send that message.");
      return result as ConversationMessageResult;
    },
    onSuccess: (data) => {
      setCurrentMessages(data.messages.map((item, index, list) => (
        index === list.length - 1 && item.role === "assistant"
          ? { ...item, audioData: data.audioData }
          : item
      )));
      setMessage("");
    },
    onError: (error: Error) => {
      toast({ title: "Message not sent", description: error.message, variant: "destructive" });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/conversation/sessions/${session.id}/complete`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not finish this practice.");
      return result;
    },
    onSuccess: (data) => {
      toast({ title: "Practice saved", description: data.session.feedback || "Your reflection is ready." });
      onComplete();
    },
    onError: (error: Error) => toast({ title: "Could not finish", description: error.message, variant: "destructive" }),
  });

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        stream.getTracks().forEach((track) => track.stop());
        setRecordingLabel(null);
        if (!blob.size) {
          toast({ title: "No recording captured", description: "Please try again.", variant: "destructive" });
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioData = String(reader.result).split(",")[1];
          sendMessageMutation.mutate({ audioData, audioMimeType: finalMimeType.split(";")[0] });
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingLabel("Listening… tap stop when you finish.");
    } catch {
      toast({ title: "Microphone unavailable", description: "Allow microphone access, then try again.", variant: "destructive" });
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingLabel("Transcribing your answer…");
    }
  }

  function sendText() {
    if (message.trim() && !sendMessageMutation.isPending && !isRecording) {
      sendMessageMutation.mutate({ message: message.trim() });
    }
  }

  const isBusy = sendMessageMutation.isPending || isRecording;
  const learnerTurns = currentMessages.filter((item) => item.role === "user").length;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-5xl flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-11 min-w-11 rounded-2xl" aria-label="Back to conversation practice"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold capitalize text-stone-900 dark:text-amber-50">{session.topic} roleplay</h1>
            <p className="truncate text-sm text-stone-600 dark:text-stone-300">{session.scenario}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => completeSessionMutation.mutate()} disabled={completeSessionMutation.isPending} className="min-h-11 gap-2 rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-300">
          <CheckCircle2 className="h-4 w-4" /> Finish
        </Button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-amber-200/70 bg-[#fffdf8] shadow-[0_18px_50px_rgba(90,47,20,.1)] dark:border-stone-800 dark:bg-stone-950">
        <div className="flex flex-wrap items-center gap-2 border-b border-amber-100 bg-amber-50/70 px-4 py-3 text-sm dark:border-stone-800 dark:bg-stone-900/70">
          <span className="rounded-full bg-white px-3 py-1 font-bold capitalize text-stone-700 shadow-sm dark:bg-stone-800 dark:text-stone-100">{session.difficultyLevel}</span>
          <span className="text-stone-600 dark:text-stone-300">{learnerTurns} learner turn{learnerTurns === 1 ? "" : "s"}</span>
          <span className="ml-auto text-stone-500">Speak or type — you are in control of playback.</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {currentMessages.length === 0 && (
            <div className="grid min-h-48 place-items-center text-center text-stone-600 dark:text-stone-300">
              <div><MessageCircle className="mx-auto mb-3 h-10 w-10 text-orange-500" /><p className="font-bold">Start in the target language</p><p className="mt-1 text-sm">Try one short greeting, then respond to your partner.</p></div>
            </div>
          )}
          {currentMessages.map((item, index) => (
            <article key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "rounded-tr-sm bg-orange-500 text-white" : "rounded-tl-sm border border-amber-100 bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"}`}>
                <p className="mb-1 text-xs font-extrabold opacity-70">{item.role === "user" ? "You" : "Roleplay partner"}</p>
                <p>{item.content}</p>
                {item.role === "assistant" && <AudioPlayer text={item.content} languageCode={session.languageCode} audioData={item.audioData} className="mt-1" />}
              </div>
            </article>
          ))}
          {sendMessageMutation.isPending && <p className="text-sm text-stone-500" aria-live="polite">Your partner is thinking…</p>}
          <div ref={messagesEndRef} />
        </div>

        <footer className="border-t border-amber-100 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-stone-800 dark:bg-stone-950/95 sm:px-6">
          {recordingLabel && <p className="mb-2 text-sm font-semibold text-orange-700 dark:text-orange-300" aria-live="polite">{recordingLabel}</p>}
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendText(); } }}
              placeholder="Type your next line…"
              className="min-h-11 max-h-32 resize-none rounded-2xl border-amber-200 bg-amber-50/30 text-base focus-visible:ring-orange-400 dark:border-stone-700 dark:bg-stone-900"
              disabled={isBusy}
              aria-label="Roleplay message"
            />
            <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={isRecording ? stopRecording : startRecording} disabled={sendMessageMutation.isPending} className="min-h-11 min-w-11 rounded-2xl" aria-label={isRecording ? "Stop recording" : "Record an answer"}>
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="button" onClick={sendText} disabled={!message.trim() || isBusy} size="icon" className="min-h-11 min-w-11 rounded-2xl bg-orange-500 hover:bg-orange-600" aria-label="Send message">
              {sendMessageMutation.isPending ? <CircleStop className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}