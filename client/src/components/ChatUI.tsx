import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "wouter";
import { Lesson } from "@shared/schema";
import { DEFAULT_ERROR_MESSAGE } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export default function ChatUI({ lesson }: ChatUIProps) {
  const [_, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [scratchPad, setScratchPad] = useState<ScratchPad>({
    knownVocabulary: [],
    knownStructures: [],
    struggles: [],
    nextFocus: null,
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
        setMessages([{ role: "assistant", content: data.response }]);
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

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
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

  /* ───────────────────────── RENDER ───────────────────────── */
  
  // If the user is not authenticated, show a login prompt
  if (!authLoading && !user) {
    return (
      <div className="chat-ui flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            To use the AI chat tutor and save your learning progress, you need to sign in or create an account.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="min-w-[140px]"
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth?tab=register")}
              className="min-w-[140px]"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If still loading authentication status, show a loading indicator
  if (authLoading) {
    return (
      <div className="chat-ui flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // User is authenticated, show the chat UI
  return (
    <div className="chat-ui">
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

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about this lesson..."
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button" 
          disabled={isLoading || !input.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}