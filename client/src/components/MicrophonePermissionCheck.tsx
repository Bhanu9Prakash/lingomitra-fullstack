import { MicOff, Settings } from "lucide-react";
import { useMicrophonePermission } from "@/hooks/use-microphone-permission";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function MicrophonePermissionCheck() {
  const { permissionState, isSupported, requestPermission, showPermissionInstructions } = useMicrophonePermission();

  if (isSupported && permissionState !== "denied") return null;

  return (
    <Alert className="mb-3 border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
      <MicOff className="h-5 w-5" />
      <AlertTitle>{isSupported ? "Microphone access is blocked" : "Voice recording is unavailable"}</AlertTitle>
      <AlertDescription className="text-sm">
        <p className="mb-2">{isSupported ? "Allow microphone access in this site's browser permissions. Lingomitra only records after you tap the microphone." : "This browser does not expose microphone recording to the app."}</p>
        {isSupported && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void requestPermission()}>Try again</Button>
            <Button type="button" variant="ghost" size="sm" onClick={showPermissionInstructions}><Settings className="mr-1 h-3 w-3" /> Instructions</Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
