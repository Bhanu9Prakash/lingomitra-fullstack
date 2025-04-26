import { useLocation } from "wouter";

export default function Hero() {
  const [_, navigate] = useLocation();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="badge">
            Language Learning Simplified
          </div>
          <h2>Learn Languages The Smart Way</h2>
          <p>
            Master new languages naturally through pattern-based lessons. Build your vocabulary and understanding step by step with our interactive approach.
          </p>
          <div className="cta-buttons">
            <button 
              className="primary-btn"
              onClick={() => navigate("/languages")}
            >
              Get Started
            </button>
            <button className="secondary-btn">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="character character-1">
            <i className="fas fa-language"></i>
          </div>
          <div className="character character-2">
            <i className="fas fa-comment-dots"></i>
          </div>
          <div className="character character-3">
            <i className="fas fa-globe-americas"></i>
          </div>
          <div className="character character-4">
            <i className="fas fa-book"></i>
          </div>
          <div className="character character-5">
            <i className="fas fa-graduation-cap"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
