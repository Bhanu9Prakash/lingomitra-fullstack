import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button 
      id="scroll-to-top" 
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary hover:bg-primary-dark text-white shadow-lg transition-opacity z-40 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{ display: isVisible ? 'block' : 'none' }}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}
