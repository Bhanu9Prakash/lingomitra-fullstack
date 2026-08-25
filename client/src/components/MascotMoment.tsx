import { Lightbulb, MessageCircleMore, RotateCcw, Sparkles } from "lucide-react";

type MascotState = "neutral" | "thinking" | "coach" | "celebrate" | "retry";

interface MascotMomentProps {
  state?: MascotState;
  className?: string;
  alt?: string;
}

const accents = {
  neutral: null,
  thinking: <Lightbulb aria-hidden="true" />,
  coach: <MessageCircleMore aria-hidden="true" />,
  celebrate: <Sparkles aria-hidden="true" />,
  retry: <RotateCcw aria-hidden="true" />,
};

/**
 * The original fox remains the visual source of every learning state. Small,
 * non-character accents provide state context without introducing a second avatar.
 */
export default function MascotMoment({
  state = "neutral",
  className = "",
  alt = "The LingoMitra fox",
}: MascotMomentProps) {
  return (
    <div className={`mascot-moment mascot-${state} ${className}`}>
      <img src="/mascot.svg" alt={alt} />
      {accents[state] ? <span className="mascot-accent">{accents[state]}</span> : null}
    </div>
  );
}