import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, CircleStop, MessageCircle, Mic, Send, Square } from "lucide-react";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ModernVoiceRecorder } from "@/components/ModernVoiceRecorder";

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
  const [transcribing,setTranscribing]=useState(false);
  const {data:capability}=useQuery<{transcription:boolean}>({queryKey:['/api/capabilities']});
  const requestRef=useRef<{id:string;message:string}|null>(null);
  const [reloadError,setReloadError]=useState(''),[reloading,setReloading]=useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useSimpleToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block: "end" });
  }, [currentMessages, isRecording]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message?: string; audioData?: string; audioMimeType?: string }) => {
      const text=data.message||'';if(!requestRef.current||requestRef.current.message!==text)requestRef.current={id:crypto.randomUUID(),message:text};
      const response = await apiRequest("POST", `/api/conversation/sessions/${session.id}/message`, {...data,requestId:requestRef.current.id});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send that message.");
      return result as ConversationMessageResult;
    },
    onSuccess: (data) => {
      requestRef.current=null;
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

  async function transcribeClip(blob:Blob) {
    setTranscribing(true);setRecordingLabel('Transcribing your clip…');
    try {
      const form=new FormData();form.set('audio',blob,'recording.'+(blob.type.includes('mp4')?'m4a':'webm'));
      const response=await fetch('/api/speech/transcribe',{method:'POST',body:form});
      const result=await response.json();if(!response.ok)throw new Error(result.message||'The clip could not be transcribed.');
      setMessage(previous=>previous?previous+'\n'+result.transcription:result.transcription);
      setRecordingLabel('Check and edit this transcript before sending. Transcription is not a pronunciation score.');
    }catch(error){setRecordingLabel('Transcription unavailable. You can retry the clip or type instead.');throw error;}finally{setTranscribing(false);}
  }

  function sendText() {
    if (message.trim() && !sendMessageMutation.isPending && !isRecording && !transcribing) {
      sendMessageMutation.mutate({ message: message.trim() });
    }
  }

  const isBusy = sendMessageMutation.isPending || isRecording || transcribing;
  const learnerTurns = currentMessages.filter((item) => item.role === "user").length;

  async function reloadSavedConversation(){
    setReloading(true);setReloadError('');
    try{const response=await apiRequest('GET',`/api/conversation/sessions/${session.id}`);const result=await response.json();if(!response.ok)throw new Error(result.error||'The saved conversation could not be loaded.');setCurrentMessages(result.session.messages);requestRef.current=null;sendMessageMutation.reset();}
    catch(error){setReloadError(error instanceof Error?error.message:'The saved conversation could not be loaded.');}
    finally{setReloading(false);}
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-5xl flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-h-11 min-w-11 rounded-2xl" aria-label="Back to conversation practice"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold capitalize text-stone-900 dark:text-foreground">{session.topic} roleplay</h1>
            <p className="truncate text-sm text-stone-600 dark:text-stone-300">{session.scenario}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => completeSessionMutation.mutate()} disabled={completeSessionMutation.isPending||isBusy} className="min-h-11 gap-2 rounded-xl border-border text-foreground hover:bg-accent">
          <CheckCircle2 className="h-4 w-4" /> Finish
        </Button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-none dark:border-stone-800 dark:bg-stone-950">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-4 py-3 text-sm dark:border-stone-800 dark:bg-stone-900/70">
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
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm border border-border bg-white text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"}`}>
                <p className="mb-1 text-xs font-extrabold opacity-70">{item.role === "user" ? "You" : "Roleplay partner"}</p>
                <p>{item.content}</p>
                {item.role === "assistant" && <AudioPlayer text={item.content} languageCode={session.languageCode} audioData={item.audioData} className="mt-1" />}
              </div>
            </article>
          ))}
          {sendMessageMutation.isPending && <p className="text-sm text-stone-500" aria-live="polite">Your partner is thinking…</p>}
          <div ref={messagesEndRef} />
        </div>

        <footer className="border-t border-border bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-stone-800 dark:bg-stone-950/95 sm:px-6">
          <p className="mb-2 text-xs text-stone-600 dark:text-stone-300">Optional AI roleplay. Sent messages go to the model provider. No mastery or pronunciation score is assigned.</p>
          {sendMessageMutation.isError&&<div role="status" className="mb-3 text-sm"><p>{sendMessageMutation.error.message}</p><Button variant="outline" onClick={()=>void reloadSavedConversation()} disabled={isBusy||reloading}>Reload saved conversation before another attempt</Button>{reloadError&&<p>{reloadError}</p>}</div>}
          {recordingLabel && <p className="mb-2 text-sm font-semibold text-foreground" aria-live="polite">{recordingLabel}</p>}
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); sendText(); } }}
              placeholder="Type your next line…"
              className="min-h-11 max-h-32 resize-none rounded-2xl border-border bg-background text-base focus-visible:ring-ring dark:border-stone-700 dark:bg-stone-900"
              disabled={isBusy}
              aria-label="Roleplay message"
            />
            <ModernVoiceRecorder onAudioSubmit={transcribeClip} onRecordingChange={setIsRecording} disabled={sendMessageMutation.isPending||transcribing||!capability?.transcription}/>
            <Button type="button" onClick={sendText} disabled={!message.trim() || isBusy} size="icon" className="min-h-11 min-w-11 rounded-2xl bg-primary text-primary-foreground" aria-label="Send message">
              {sendMessageMutation.isPending ? <CircleStop className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
