import React, { useEffect } from 'react';
import { useMicrophonePermission } from '@/hooks/use-microphone-permission';
import { Mic, MicOff, Settings } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

export default function MicrophonePermissionCheck() {
  const { permissionState, requestPermission, showPermissionInstructions } = useMicrophonePermission();
  
  // Check permission after the component mounts
  useEffect(() => {
    // If permission state is unknown or prompt, request it after a short delay
    // This ensures we don't immediately prompt on page load
    if (permissionState === 'unknown' || permissionState === 'prompt') {
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [permissionState, requestPermission]);
  
  // Only show alert if permission is denied
  if (permissionState !== 'denied') {
    return null;
  }
  
  return (
    <Alert className="mb-4 border-red-400 bg-red-50 dark:bg-red-900/20">
      <MicOff className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-500">Microphone access denied</AlertTitle>
      <AlertDescription className="text-sm">
        <p className="mb-2">To use voice features, please enable microphone access in your browser settings.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs border-red-200 hover:bg-red-100 hover:text-red-700"
          onClick={showPermissionInstructions}
        >
          <Settings className="mr-1 h-3 w-3" />
          How to enable
        </Button>
      </AlertDescription>
    </Alert>
  );
}