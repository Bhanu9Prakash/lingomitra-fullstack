import { Link } from "wouter";

interface MascotLogoProps {
  className?: string;
}

export default function MascotLogo({ className = "" }: MascotLogoProps) {
  return (
    <Link href="/">
      <div>
        <img 
          src="/mascot.svg" 
          alt="LingoMitra Mascot" 
          className={className}
        />
      </div>
    </Link>
  );
}
