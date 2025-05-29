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

  // Generate waveform bars spanning full width
  const generateWaveform = () => {
    const bars = [];
    const barCount = 35; // More bars to fill the entire space
    
    for (let i = 0; i < barCount; i++) {
      const height = isRecording 
        ? Math.random() * audioLevel * 20 + 4 
        : 4;
      
      bars.push(
        <div
          key={i}
          className="bg-orange-400 rounded-full transition-all duration-75 flex-shrink-0"
          style={{
            width: '2px',
            height: `${height}px`,
            opacity: isRecording ? 0.8 + Math.random() * 0.2 : 0.4
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
    <>
      {/* Main Recording Button - circular */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative
          ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isRecording ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Waveform spanning full horizontal space as shown */}
      {isRecording && (
        <div className="absolute left-4 right-20 bottom-full mb-3 flex items-center h-6 px-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-evenly w-full">
            {generateWaveform()}
          </div>
        </div>
      )}

      {/* Action Controls - positioned like in your image */}
      {showControls && hasRecording && (
        <div className="absolute right-4 bottom-full mb-3 flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
          <button
            type="button"
            onClick={cancelRecording}
            className="w-8 h-8 rounded-full bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={submitRecording}
            className="w-8 h-8 rounded-full bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}