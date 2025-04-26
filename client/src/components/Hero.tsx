import { useLocation } from "wouter";

export default function Hero() {
  const [_, navigate] = useLocation();

  return (
    <section className="bg-muted py-16 md:py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 z-10">
            <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-light text-sm font-bold mb-4">
              Language Learning Simplified
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">Learn Languages The Smart Way</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-[500px]">
              Master new languages naturally through pattern-based lessons. Build your vocabulary and understanding step by step with our interactive approach.
            </p>
            <button 
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 uppercase tracking-wide"
              onClick={() => navigate("/languages")}
            >
              Get Started
            </button>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute hero-animation top-0 left-[15%] bg-background dark:bg-gray-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-muted" style={{animationDelay: "0s"}}>
                <i className="fas fa-language text-3xl text-primary"></i>
              </div>
              <div className="absolute hero-animation top-[5%] left-1/2 -translate-x-1/2 bg-background dark:bg-gray-700 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg border-2 border-muted" style={{animationDelay: "1s"}}>
                <i className="fas fa-comment-dots text-3xl text-secondary"></i>
              </div>
              <div className="absolute hero-animation bottom-[25%] left-[5%] bg-background dark:bg-gray-700 w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg border-2 border-muted" style={{animationDelay: "2.5s"}}>
                <i className="fas fa-globe-americas text-4xl text-green-500"></i>
              </div>
              <div className="absolute hero-animation top-[45%] right-[15%] bg-background dark:bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-muted" style={{animationDelay: "1.8s"}}>
                <i className="fas fa-book text-2xl text-purple-500"></i>
              </div>
              <div className="absolute hero-animation top-[32%] left-[20%] bg-background dark:bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-muted" style={{animationDelay: "2s"}}>
                <i className="fas fa-graduation-cap text-2xl text-yellow-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
