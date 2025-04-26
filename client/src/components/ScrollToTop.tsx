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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScrollTop]);

  return (
    <button
      id="scrollToTop"
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg transition-opacity duration-300 z-50 ${
        showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <i className="fas fa-arrow-up text-lg"></i>
    </button>
  );
}