import React, { useState, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface VoiceRecorderProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onAudioSubmit, disabled }: VoiceRecorderProps) {
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleMouseDown = useCallback(async () => {
    if (disabled || isRecording) return;
    
    setIsHolding(true);
    
    // Start recording after a short delay to prevent accidental recordings
    holdTimeoutRef.current = setTimeout(async () => {
      await startRecording();
    }, 100);
  }, [disabled, isRecording, startRecording]);

  const handleMouseUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    
    setIsHolding(false);
    
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Auto-submit when recording stops and we have audio
  React.useEffect(() => {
    if (audioBlob && !isRecording) {
      onAudioSubmit(audioBlob);
      resetRecording();
    }
  }, [audioBlob, isRecording, onAudioSubmit, resetRecording]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="voice-recorder-container">
      <button
        className={`voice-recorder-btn ${isRecording ? 'recording' : ''} ${isHolding ? 'holding' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        type="button"
        title={isRecording ? `Recording... ${formatDuration(duration)}` : "Hold to speak"}
      >
        <Mic className="voice-recorder-icon" />
        {isRecording && (
          <span className="recording-duration">{formatDuration(duration)}</span>
        )}
      </button>
      
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-pulse"></div>
          <span className="recording-text">Recording...</span>
        </div>
      )}
    </div>
  );
}