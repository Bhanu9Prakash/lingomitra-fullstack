import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const checkScrollTop = () => {
    if (!showScrollTop && window.pageYOffset > 300) {
      setShowScrollTop(true);
    } else if (showScrollTop && window.pageYOffset <= 300) {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScrollTop]);

  return (
    <Button variant="ghost"
      id="scrollToTop"
      className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up"></i>
    </Button>
  );
}