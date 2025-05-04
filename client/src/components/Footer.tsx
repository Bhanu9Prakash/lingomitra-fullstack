import { APP_NAME } from "@/lib/constants";
import MascotLogo from "./MascotLogo";
import { Link } from "wouter";
import { Instagram } from "lucide-react";

/**
 * Footer component that appears at the bottom of every page
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-[#222222] text-white">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          <div className="flex items-center">
            <MascotLogo className="w-10 h-10 mr-3" />
            <h3 className="text-xl font-bold text-[#ff6600]">LingoMitra</h3>
          </div>
          
          <div className="flex gap-6">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
          
          <div className="flex gap-4">
            <a href="https://www.instagram.com/lingomitra" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors rounded-full p-2" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
          <p>© {currentYear} LingoMitra. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}