import { APP_NAME } from "@/lib/constants";
import MascotLogo from "./MascotLogo";
import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

/**
 * Footer component that appears at the bottom of every page
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 pt-10 pb-8 bg-background/50">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="flex items-center">
            <MascotLogo className="w-12 h-12 mr-2" />
            <h3 className="text-xl font-bold">{APP_NAME}</h3>
          </div>
          
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="social-icon rounded-full bg-muted/30 p-2 hover:bg-primary/20 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="social-icon rounded-full bg-muted/30 p-2 hover:bg-primary/20 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="social-icon rounded-full bg-muted/30 p-2 hover:bg-primary/20 transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {APP_NAME}. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}