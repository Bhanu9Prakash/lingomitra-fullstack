import React from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Button } from '@/components/ui/button';

interface AudioRecorderProps {
  onAudioSubmit: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onAudioSubmit, disabled }: AudioRecorderProps) {
  const {
    isRecording,
    audioBlob,
    duration,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSendAudio = () => {
    if (audioBlob) {
      onAudioSubmit(audioBlob);
      resetRecording();
    }
  };

  const handleCancel = () => {
    resetRecording();
  };

  if (error) {
    return (
      <div className="audio-recorder error">
        <span className="error-text">{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetRecording}
          className="ml-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="audio-recorder recording">
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span className="recording-text">Recording...</span>
          <span className="recording-duration">{formatDuration(duration)}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleStopRecording}
          className="stop-button"
        >
          <MicOff className="w-4 h-4" />
          Stop
        </Button>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className="audio-recorder recorded">
        <div className="recorded-info">
          <span className="recorded-text">Audio recorded ({formatDuration(duration)})</span>
        </div>
        <div className="recorded-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="cancel-button"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSendAudio}
            className="send-button"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartRecording}
      disabled={disabled}
      className="audio-recorder-button"
    >
      <Mic className="w-4 h-4" />
      Speak
    </Button>
  );
}