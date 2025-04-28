import { APP_NAME } from "@/lib/constants";
import MascotLogo from "./MascotLogo";

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
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          
          {/* Social media links removed */}
        </div>
        
        <div className="footer-bottom">
          <p>© {currentYear} {APP_NAME}. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}