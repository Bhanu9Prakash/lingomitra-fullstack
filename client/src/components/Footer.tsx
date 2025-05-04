import { APP_NAME } from "@/lib/constants";
import MascotLogo from "./MascotLogo";
import { Link } from "wouter";

/**
 * Footer component that appears at the bottom of every page
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <MascotLogo className="mascot-logo" />
            <h3>{APP_NAME}</h3>
          </div>
          
          <div className="footer-links">
            <Link href="/about">About</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
          </div>
          
          <div className="footer-social">
            <a href="#" className="social-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {currentYear} {APP_NAME}. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}