import { Link } from "wouter";

interface MascotLogoProps {
  className?: string;
  linked?: boolean;
}

export default function MascotLogo({ className = "", linked = true }: MascotLogoProps) {
  const image = (
    <img
      src="/mascot.svg"
      alt="LingoMitra Mascot"
      className={className}
    />
  );

  return linked ? <Link href="/">{image}</Link> : image;
}
