import { useState, useRef, useEffect } from "react";
import { Lesson } from "@shared/schema";
import { DEFAULT_ERROR_MESSAGE } from "@/lib/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatUIProps {
  lesson: Lesson;
}

export default function ChatUI({ lesson }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Hi! I'm your AI tutor for "${lesson.title}". How can I help you learn today?` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Here you would typically call your AI service
      // For now, we'll simulate a response
      
      // Note: In a real implementation, you would send a request to OpenAI or your backend
      // that handles the OpenAI integration using the OPENAI_API_KEY
      
      setTimeout(() => {
        const assistantResponse: Message = { 
          role: "assistant", 
          content: `I understand you're asking about "${input}". This is related to our lesson "${lesson.title}". Let me help you with that...`
        };
        setMessages(prev => [...prev, assistantResponse]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = { 
        role: "assistant", 
        content: `I'm sorry, I encountered an error. ${DEFAULT_ERROR_MESSAGE}`
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-ui">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`chat-message ${message.role === "assistant" ? "assistant" : "user"}`}
          >
            {message.role === "assistant" && (
              <div className="avatar">
                <i className="fas fa-robot"></i>
              </div>
            )}
            <div className="message-content">
              {message.content}
            </div>
            {message.role === "user" && (
              <div className="avatar">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="avatar">
              <i className="fas fa-robot"></i>
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
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}