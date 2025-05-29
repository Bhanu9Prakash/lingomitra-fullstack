import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModernVoiceRecorderProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function ModernVoiceRecorder({ onAudioSubmit, disabled = false }: ModernVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate waveform bars based on audio level
  const generateWaveform = () => {
    const bars = [];
    const barCount = 20;
    
    for (let i = 0; i < barCount; i++) {
      const height = isRecording 
        ? Math.random() * audioLevel * 40 + 10 
        : 10;
      
      bars.push(
        <div
          key={i}
          className="bg-orange-500 rounded-full transition-all duration-75"
          style={{
            width: '3px',
            height: `${height}px`,
            opacity: isRecording ? 0.7 + Math.random() * 0.3 : 0.3
          }}
        />
      );
    }
    return bars;
  };

  // Monitor audio levels during recording
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setHasRecording(true);
        setShowControls(true);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Submit recording
  const submitRecording = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onAudioSubmit(audioBlob);
      resetRecorder();
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    resetRecorder();
  };

  // Reset recorder state
  const resetRecorder = () => {
    setHasRecording(false);
    setShowControls(false);
    setAudioLevel(0);
    audioChunksRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Main Recording Button */}
      <div className="relative">
        <Button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-orange-500 hover:bg-orange-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Waveform Visualization */}
      {(isRecording || hasRecording) && (
        <div className="flex items-center justify-center space-x-1 h-12 px-4 bg-gray-900 rounded-full">
          {generateWaveform()}
        </div>
      )}

      {/* Action Controls */}
      {showControls && hasRecording && (
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            onClick={cancelRecording}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
          
          <Button
            type="button"
            onClick={submitRecording}
            size="sm"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      )}

      {/* Status Text */}
      <p className="text-sm text-gray-600 text-center">
        {isRecording 
          ? 'Recording... Click to stop' 
          : hasRecording 
            ? 'Choose an action'
            : 'Click to start recording'
        }
      </p>
    </div>
  );
}