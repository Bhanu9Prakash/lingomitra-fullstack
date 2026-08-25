import { useCallback, useEffect, useState } from "react";
import { useSimpleToast } from "@/hooks/use-simple-toast";

type PermissionState = "granted" | "denied" | "prompt" | "unknown";

export function useMicrophonePermission() {
  const [permissionState, setPermissionState] = useState<PermissionState>("unknown");
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useSimpleToast();

  useEffect(() => {
    let permissionStatus: PermissionStatus | undefined;
    let mounted = true;

    async function inspectPermission() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) {
          setIsSupported(false);
          setPermissionState("unknown");
        }
        return;
      }
      if (!navigator.permissions?.query) {
        if (mounted) setPermissionState("prompt");
        return;
      }
      try {
        permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (!mounted) return;
        setPermissionState(permissionStatus.state as PermissionState);
        permissionStatus.onchange = () => setPermissionState(permissionStatus!.state as PermissionState);
      } catch {
        if (mounted) setPermissionState("prompt");
      }
    }

    void inspectPermission();
    return () => {
      mounted = false;
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      toast({ title: "Microphone ready", description: "Tap the microphone when you want to record." });
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") setPermissionState("denied");
      return false;
    }
  }, [toast]);

  const showPermissionInstructions = useCallback(() => {
    toast({
      title: "Enable microphone access",
      description: "Open this site's browser permissions, allow Microphone, then return and tap Try again.",
      variant: "destructive",
      duration: 6000,
    });
  }, [toast]);

  return { permissionState, isSupported, requestPermission, showPermissionInstructions };
}
