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
  return (
    <div className={`mascot-moment mascot-${state} ${className}`}>
      <img src={poseAsset[state]} alt={alt} />
    </div>
  );
}