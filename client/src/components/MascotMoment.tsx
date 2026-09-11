import { useAuth } from '@/hooks/use-auth';
type MascotState = "neutral" | "thinking" | "coach" | "celebrate" | "retry";

interface MascotMomentProps {
  state?: MascotState;
  className?: string;
  alt?: string;
}

const poseAsset: Record<MascotState, string> = {
  neutral: "/mascot-neutral.png",
  thinking: "/mascot-thinking.png",
  coach: "/mascot-coaching.png",
  celebrate: "/mascot-celebration.png",
  retry: "/mascot-retry.png",
};

export default function MascotMoment({
  state = "neutral",
  className = "",
  alt = "The LingoMitra fox",
}: MascotMomentProps) {
  const {user}=useAuth();
  if(user?.preferences?.minimizeCompanion)return null;
  return (
    <div className={`mascot-moment mascot-${state} ${className}`}>
      <img src={poseAsset[state]} alt={alt} width={1024} height={1024} decoding="async" />
    </div>
  );
}
