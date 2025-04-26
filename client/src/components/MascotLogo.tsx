import { ReactNode } from "react";
import { Link } from "wouter";

interface MascotLogoProps {
  className?: string;
}

export default function MascotLogo({ className = "" }: MascotLogoProps) {
  return (
    <Link href="/">
      <a className={`flex items-center gap-3 ${className}`}>
        <img 
          src="/mascot.svg" 
          alt="LingoMitra Mascot" 
          className="w-10 h-10"
        />
        <h1 className="text-xl font-bold text-primary dark:text-primary-light">
          LingoMitra
        </h1>
      </a>
    </Link>
  );
}
