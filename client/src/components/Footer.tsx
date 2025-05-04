import { APP_NAME } from "@/lib/constants";
import MascotLogo from "./MascotLogo";
import { Link } from "wouter";

/**
 * Footer component that appears at the bottom of every page
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-6 pb-4">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center">
            <MascotLogo className="w-12 h-12 mr-3" />
            <h3 className="text-xl font-bold text-primary">{APP_NAME}</h3>
          </div>
          
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
          <p>© {currentYear} {APP_NAME}. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}