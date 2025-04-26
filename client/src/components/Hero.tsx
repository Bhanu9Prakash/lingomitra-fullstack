import { useLocation } from "wouter";

export default function Hero() {
  const [_, navigate] = useLocation();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-secondary-dark dark:text-secondary-light text-sm font-medium mb-4">
              Language Learning Simplified
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">Learn Languages The Smart Way</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Master new languages naturally through pattern-based lessons. Build your vocabulary and understanding step by step with our interactive approach.
            </p>
            <button 
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              onClick={() => navigate("/languages")}
            >
              Get Started
            </button>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute hero-animation top-0 left-0 bg-white dark:bg-gray-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{animationDelay: "0s"}}>
                <i className="fas fa-language text-3xl text-primary"></i>
              </div>
              <div className="absolute hero-animation top-12 right-0 bg-white dark:bg-gray-700 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg" style={{animationDelay: "0.5s"}}>
                <i className="fas fa-comment-dots text-3xl text-secondary"></i>
              </div>
              <div className="absolute hero-animation bottom-0 left-10 bg-white dark:bg-gray-700 w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg" style={{animationDelay: "1s"}}>
                <i className="fas fa-globe-americas text-4xl text-green-500"></i>
              </div>
              <div className="absolute hero-animation bottom-16 right-12 bg-white dark:bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{animationDelay: "1.5s"}}>
                <i className="fas fa-book text-2xl text-purple-500"></i>
              </div>
              <div className="absolute hero-animation top-32 left-20 bg-white dark:bg-gray-700 w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg" style={{animationDelay: "2s"}}>
                <i className="fas fa-graduation-cap text-2xl text-yellow-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
