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
    <footer className="site-footer">
      <div className="landing-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <MascotLogo className="footer-mascot" />
              <strong>{APP_NAME}</strong>
            </div>
            <p>A calm place to notice patterns, build sentences, and make a language your own.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <span>Explore</span>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="footer-method">
            <span>Our method</span>
            <strong>Notice. Predict. Reuse.</strong>
            <p>Language learning built around active thinking.</p>
            <a href="https://www.instagram.com/lingomitra" target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="LingoMitra on Instagram">
              <Instagram size={18} aria-hidden="true" /> Instagram
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} {APP_NAME}</p>
          <p>Think first. Then speak.</p>
        </div>
      </div>
    </footer>
  );
}
