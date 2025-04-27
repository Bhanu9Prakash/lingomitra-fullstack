import { Link } from "wouter";

/**
 * MascotLogo component displays the app logo and links to home page
 */
interface MascotLogoProps {
  className?: string;
}

export default function MascotLogo({ className = "" }: MascotLogoProps) {
  return (
    <Link href="/">
      <img 
        src="/mascot.svg" 
        alt="LingoMitra Mascot" 
        className={className}
      />
    </Link>
  );
}
