import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lesson } from "@shared/schema";
import { DEFAULT_ERROR_MESSAGE } from "@/lib/constants";

// Define TypeScript interfaces for ReactMarkdown props to fix LSP errors
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MarkdownProps {
  children?: React.ReactNode;
}

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
                  code: (props: CodeProps) => {
                    const { children, className } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    if (props.inline) {
                      return <code className={`inline-code ${className || ''}`}>{children}</code>;
                    }
                    
                    return (
                      <div className="code-block-wrapper">
                        <pre className={`code-block ${language ? `language-${language}` : ''}`}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  },
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