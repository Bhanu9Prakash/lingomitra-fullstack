import { useState, useRef, useEffect } from "react";
import { Lesson } from "@shared/schema";
import { DEFAULT_ERROR_MESSAGE } from "@/lib/constants";
import { generateChatResponse, AIMessage } from "@/lib/ai-service";

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
      // Get all messages for the conversation context
      const conversationMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })) as AIMessage[];
      
      // Add the new user message
      conversationMessages.push({
        role: "user",
        content: input
      });
      
      // Get response from Google Gemini AI with lesson context
      const aiResponse = await generateChatResponse(
        conversationMessages, 
        lesson.content
      );
      
      // Add AI response to chat
      const assistantResponse: Message = { 
        role: "assistant", 
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = { 
        role: "assistant", 
        content: `I'm sorry, I encountered an error. ${DEFAULT_ERROR_MESSAGE}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
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
                <img src="/tutor-icon.svg" alt="AI Tutor" className="chat-bot-icon" />
              </div>
            )}
            <div className="message-content">
              {message.content}
            </div>
            {message.role === "user" && (
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
      
      <div className="chat-input">
        <form onSubmit={handleSubmit}>
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
    </div>
  );
}