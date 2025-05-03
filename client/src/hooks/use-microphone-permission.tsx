import { useState, useEffect, useRef } from 'react';
import { useSimpleToast } from '@/hooks/use-simple-toast';

const PERMISSION_CHECK_KEY = 'microphone_permission_checked';

export function useMicrophonePermission() {
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useSimpleToast();
  const hasCheckedPermission = useRef(false);

  useEffect(() => {
    // Check if we already checked permissions in this session or browser
    const alreadyChecked = localStorage.getItem(PERMISSION_CHECK_KEY) === 'true';
    if (alreadyChecked) {
      hasCheckedPermission.current = true;
    }
    
    const checkMicrophonePermission = async () => {
      // Check if browser supports the Permission API
      if (!navigator.permissions || !navigator.permissions.query) {
        setIsSupported(false);
        return;
      }

      try {
        // Check for microphone permission status
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        // Set initial state
        setPermissionState(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        
        // Listen for changes to permission state
        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state as 'granted' | 'denied' | 'prompt');
          
          // Show a toast notification when permission is granted
          if (permissionStatus.state === 'granted' && !hasCheckedPermission.current) {
            hasCheckedPermission.current = true;
            localStorage.setItem(PERMISSION_CHECK_KEY, 'true');
            
            toast({
              title: "Microphone access granted",
              description: "You can now use voice features.",
              variant: "default",
            });
          }
        };
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setIsSupported(false);
      }
    };

    // Run the check
    checkMicrophonePermission();

    // If the permission API isn't supported, fall back to getUserMedia
    if (!isSupported && !hasCheckedPermission.current) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          setPermissionState('granted');
          hasCheckedPermission.current = true;
          localStorage.setItem(PERMISSION_CHECK_KEY, 'true');
        })
        .catch((err) => {
          console.log('Error accessing microphone:', err);
          if (err.name === 'NotAllowedError') {
            setPermissionState('denied');
          } else {
            setPermissionState('prompt');
          }
          hasCheckedPermission.current = true;
          localStorage.setItem(PERMISSION_CHECK_KEY, 'true');
        });
    }
  }, [toast, isSupported]);

  // Function to request microphone permission
  const requestPermission = async () => {
    // Only proceed if we haven't checked permission before
    if (hasCheckedPermission.current) {
      return false;
    }
    
    hasCheckedPermission.current = true;
    
    // Store in localStorage to prevent checking across page refreshes
    try {
      localStorage.setItem(PERMISSION_CHECK_KEY, 'true');
      
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      if ((error as Error).name === 'NotAllowedError') {
        setPermissionState('denied');
      }
      return false;
    }
  };

  // Function to show permission instructions
  const showPermissionInstructions = () => {
    toast({
      title: "Microphone Access Required",
      description: "Please allow microphone access in your browser settings to use voice features.",
      variant: "destructive",
      duration: 6000,
    });
  };

  return { permissionState, isSupported, requestPermission, showPermissionInstructions };
}