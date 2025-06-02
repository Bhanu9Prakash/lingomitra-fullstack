import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mic, MicOff, Send, Play, Square, Trophy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationSession {
  id: number;
  languageCode: string;
  topic: string;
  difficultyLevel: string;
  scenario: string;
  messages: Array<{ role: string; content: string }>;
  feedback?: string;
  score?: number;
  duration: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ConversationSessionProps {
  session: ConversationSession;
  onComplete: () => void;
  onBack: () => void;
}

export function ConversationSession({ session, onComplete, onBack }: ConversationSessionProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessages, setCurrentMessages] = useState(session.messages);
  const [isListening, setIsListening] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message?: string; audioData?: string }) => {
      return apiRequest(`/api/conversation/sessions/${session.id}/message`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setCurrentMessages(data.messages);
      setMessage("");
      
      // Play TTS audio if available
      if (data.audioData) {
        playAudio(data.audioData);
      }
      
      toast({
        title: "Message Sent",
        description: "AI responded to your message",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/conversation/sessions/${session.id}/complete`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Conversation Completed!",
        description: `Score: ${data.session.score}% - ${data.session.feedback}`,
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete session",
        variant: "destructive",
      });
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const audioData = base64data.split(',')[1];
          
          sendMessageMutation.mutate({ audioData });
        };
        
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your message...",
      });
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your message...",
      });
    }
  };

  const handleSendText = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({ message: message.trim() });
  };

  const playAudio = (audioData: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Could not play audio response",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold capitalize">{session.topic} Conversation</h1>
            <p className="text-muted-foreground">{session.scenario}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{session.difficultyLevel}</Badge>
          <Badge variant="secondary">{currentMessages.length} messages</Badge>
          <Button 
            variant="destructive" 
            onClick={() => completeSessionMutation.mutate()}
            disabled={completeSessionMutation.isPending}
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Conversation Messages */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {currentMessages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start the conversation by saying hello or introducing yourself!</p>
              </div>
            )}
            
            {currentMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.role === 'user' ? 'You' : 'AI Partner'}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="min-h-[80px] resize-none"
              disabled={sendMessageMutation.isPending || isRecording}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={sendMessageMutation.isPending}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                
                {isRecording && (
                  <span className="text-sm text-red-600 animate-pulse">
                    Recording...
                  </span>
                )}
                
                {isPlaying && (
                  <span className="text-sm text-blue-600 animate-pulse">
                    Playing response...
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleSendText}
                disabled={!message.trim() || sendMessageMutation.isPending || isRecording}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sendMessageMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Conversation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For {session.topic} conversations:</h4>
              <ul className="space-y-1 text-muted-foreground">
                {session.topic === 'restaurant' && (
                  <>
                    <li>• Ask about the menu and specials</li>
                    <li>• Practice ordering food and drinks</li>
                    <li>• Ask for the bill when finished</li>
                  </>
                )}
                {session.topic === 'travel' && (
                  <>
                    <li>• Ask for directions and recommendations</li>
                    <li>• Practice booking accommodations</li>
                    <li>• Discuss travel plans and destinations</li>
                  </>
                )}
                {session.topic === 'shopping' && (
                  <>
                    <li>• Ask about products and prices</li>
                    <li>• Practice expressing preferences</li>
                    <li>• Learn to ask for different sizes or colors</li>
                  </>
                )}
                {session.topic === 'business' && (
                  <>
                    <li>• Practice professional introductions</li>
                    <li>• Discuss work experience and skills</li>
                    <li>• Ask thoughtful questions</li>
                  </>
                )}
                {session.topic === 'daily' && (
                  <>
                    <li>• Share personal experiences</li>
                    <li>• Ask follow-up questions</li>
                    <li>• Practice small talk topics</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">General tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use voice input to practice pronunciation</li>
                <li>• Don't worry about perfect grammar</li>
                <li>• Ask for clarification if you don't understand</li>
                <li>• Try to keep the conversation flowing naturally</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}