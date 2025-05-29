import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lesson } from "@shared/schema";
import { DEFAULT_ERROR_MESSAGE } from "@/lib/constants";
import { VoiceRecorder } from "./VoiceRecorder";
import MicrophonePermissionCheck from "./MicrophonePermissionCheck";
import { AudioPlayer } from "./AudioPlayer";

interface Message {
  role: "user" | "assistant";
  content: string;
  audioData?: string | null;
  isNewMessage?: boolean;
}

interface ScratchPad {
  knownVocabulary: string[];
  knownStructures: string[];
  struggles: string[];
  nextFocus: string | null;
}

interface ChatUIProps {
  lesson: Lesson;
}

// Forward ref to allow parent component to access resetChatHistory method
const ChatUI = forwardRef(({ lesson }: ChatUIProps, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scratchPad, setScratchPad] = useState<ScratchPad>({
    knownVocabulary: [],
    knownStructures: [],
    struggles: [],
    nextFocus: null,
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoPlayedIndex, setLastAutoPlayedIndex] = useState(-1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // State for custom confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Function to reset the chat history
  const resetChatHistory = async () => {
    // Show custom confirmation dialog
    setShowConfirmation(true);
  };
  
  // Actual reset function after confirmation
  const performReset = async () => {
    try {
      setIsLoading(true);
      setShowConfirmation(false);
      
      // Delete chat history from server
      const res = await fetch(`/api/chat/history/${lesson.lessonId}/reset`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to reset chat history: ${res.status}`);
      }
      
      // Re-initialize the chat
      const initRes = await fetch("/api/chat/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.lessonId }),
      });
      
      if (!initRes.ok) {
        throw new Error(`API responded with status: ${initRes.status}`);
      }
      
      const data = await initRes.json();
      setMessages([{ role: "assistant", content: data.response }]);
      if (data.scratchPad) setScratchPad(data.scratchPad);
    } catch (e) {
      console.error("Error resetting chat:", e);
      alert("Could not reset the conversation. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Expose resetChatHistory method to parent components
  useImperativeHandle(ref, () => ({
    resetChatHistory
  }));

  /* ───────────────────────── INITIAL GREETING ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/chat/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.lessonId }),
        });
        
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Check if we have existing chat history from the server
        if (data.hasExistingHistory && data.historyLength > 0) {
          // Fetch full conversation history
          try {
            const historyRes = await fetch(`/api/chat/history/${lesson.lessonId}`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              if (historyData.messages && Array.isArray(historyData.messages) && historyData.messages.length > 0) {
                // Preload audio for all assistant messages in parallel
                const messagesWithAudio = await Promise.all(
                  historyData.messages.map(async (message: any) => {
                    if (message.role === 'assistant' && message.content && !message.audioData) {
                      try {
                        const ttsRes = await fetch('/api/tts/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            text: message.content,
                            languageCode: lesson.language.code
                          }),
                        });
                        
                        if (ttsRes.ok) {
                          const ttsData = await ttsRes.json();
                          if (ttsData.success && ttsData.audioData) {
                            return { ...message, audioData: ttsData.audioData };
                          }
                        }
                      } catch (error) {
                        console.log('Preloading audio failed for message:', error);
                      }
                    }
                    return message;
                  })
                );
                
                // Set the full conversation history with preloaded audio
                setMessages(messagesWithAudio);
                if (data.scratchPad) setScratchPad(data.scratchPad);
                return; // Exit early since we've loaded the history
              }
            }
          } catch (historyErr) {
            console.error("Error fetching chat history:", historyErr);
            // Fall back to default initialization if history fetch fails
          }
        }
        
        // If we don't have history or history fetch failed, initialize with just the response
        // Generate TTS for the initial greeting
        let audioData = null;
        try {
          const ttsRes = await fetch('/api/tts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: data.response,
              languageCode: lesson.languageCode
            }),
          });
          
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioData) {
              audioData = ttsData.audioData;
            }
          }
        } catch (ttsError) {
          console.log('TTS generation failed for initial greeting:', ttsError);
        }

        setMessages([{ 
          role: "assistant", 
          content: data.response,
          audioData: audioData,
          isNewMessage: true 
        }]);
        if (data.scratchPad) setScratchPad(data.scratchPad);
      } catch (e) {
        console.error("Error initializing chat:", e);
        setMessages([
          {
            role: "assistant",
            content:
              `Hi! I'm your AI tutor for "${lesson.title}". How can I help you learn today?`
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.lessonId]);

  /* ───────────────────────── AUTO-SCROLL ───────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ───────────────────────── HANDLE SEND ───────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.lessonId,
          conversation: [...messages, userMessage], // send history
          scratchPad,                               // send current ScratchPad
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const { response, scratchPad: newSP } = await res.json();

      // Generate TTS audio first, then add message
      let audioData = null;
      try {
        const ttsRes = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: response,
            languageCode: lesson.languageCode
          })
        });
        
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          audioData = ttsData.audioData;
        } else {
          console.log('TTS generation failed with status:', ttsRes.status);
        }
      } catch (ttsError) {
        console.log('TTS generation failed, proceeding without audio:', ttsError);
      }

      // Add assistant response with audio data and mark as new
      const assistantMessage = { 
        role: "assistant" as const, 
        content: response,
        audioData: audioData || null,
        isNewMessage: true
      };
      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        setLastAutoPlayedIndex(newMessages.length - 1);
        return newMessages;
      });
      
      if (newSP) setScratchPad(newSP);
    } catch (err) {
      console.error("Error getting AI response:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm sorry, I encountered an error. ${DEFAULT_ERROR_MESSAGE}`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────── HANDLE AUDIO ───────────────────────── */
  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (isLoading) return;

    setIsLoading(true);

    // Add a placeholder for the user's audio message
    const audioMessage: Message = { role: "user", content: "🎤 Processing audio..." };
    setMessages((prev) => [...prev, audioMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('lessonId', lesson.lessonId);
      formData.append('conversation', JSON.stringify([...messages, audioMessage]));
      formData.append('scratchPad', JSON.stringify(scratchPad));

      const res = await fetch("/api/chat/audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const { response, transcription, scratchPad: newSP, audioData } = await res.json();
      
      // Update the user message with the transcription if available
      if (transcription) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastUserMessageIndex = newMessages.length - 1;
          if (newMessages[lastUserMessageIndex]?.role === "user") {
            newMessages[lastUserMessageIndex].content = transcription;
          }
          return newMessages;
        });
      }
      
      // Add assistant response to chat with audio data
      const assistantMessage = { 
        role: "assistant" as const, 
        content: response,
        audioData: audioData || null,
        isNewMessage: true
      };
      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        setLastAutoPlayedIndex(newMessages.length - 1);
        return newMessages;
      });
      
      // Update scratch pad if provided
      if (newSP) setScratchPad(newSP);
    } catch (err) {
      console.error("Error sending audio message:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm sorry, I encountered an error processing your audio. ${DEFAULT_ERROR_MESSAGE}`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────── RENDER ───────────────────────── */
  return (
    <div className="chat-ui">
      {/* Custom Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-content">
              <h3>Reset Conversation</h3>
              <p>Are you sure you want to reset this conversation? All messages will be deleted.</p>
              <div className="confirmation-actions">
                <button 
                  className="confirmation-cancel" 
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirmation-confirm" 
                  onClick={performReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat header removed to save space */}
      
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-message ${m.role === "assistant" ? "assistant" : "user"}`}
          >
            {m.role === "assistant" && (
              <div className="avatar">
                <img src="/tutor-icon.svg" alt="AI Tutor" className="chat-bot-icon" />
              </div>
            )}

            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  code: ({ className, children, ...props }: any) => {
                    // Handle empty code blocks
                    if (!children || (typeof children === 'string' && children.trim() === '')) {
                      return null; // Don't render empty code blocks
                    }
                    
                    const isInline = !props.node?.position?.start.line;
                    return isInline ? (
                      <code className={`inline-code ${className || ''}`} {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className={`code-block ${className || ''}`}>
                        <code className={className || ''} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  table: ({ children }) => (
                    <div className="table-container">
                      <table className="markdown-table">{children}</table>
                    </div>
                  ),
                }}
              >
                {m.content}
              </ReactMarkdown>
              {m.role === "assistant" && (
                <div className="message-audio-controls">
                  <AudioPlayer 
                    text={m.content} 
                    languageCode={lesson.languageCode}
                    audioData={m.audioData}
                    autoPlay={i === messages.length - 1 && m.isNewMessage}
                    isNewMessage={m.isNewMessage}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="avatar">
                <img src="/user-icon.svg" alt="User" className="chat-user-icon" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="avatar">
              <img src="/tutor-icon.svg" alt="AI Tutor" className="chat-bot-icon" />
            </div>
            <div className="message-content typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-container">
        <MicrophonePermissionCheck />
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or hold mic..."
            disabled={isLoading}
          />
          <div className="chat-input-buttons">
            <VoiceRecorder 
              onAudioSubmit={handleAudioSubmit}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button" 
              disabled={isLoading || !input.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ChatUI;