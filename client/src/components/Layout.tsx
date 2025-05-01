import React, { ReactNode } from "react";
import MascotLogo from "./MascotLogo";
import Footer from "./Footer";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Check if we're on a lesson page to hide the footer
  const isLessonPage = location.includes("/lesson/");

  return (
    <div>
      <header>
        <div className="container">
          <div className="logo">
            <MascotLogo className="mascot-logo" />
            <h1>LingoMitra</h1>
          </div>
        </div>
      </header>
      
      <main>
        {children}
      </main>
      
      {/* Only show footer on non-lesson pages */}
      {!isLessonPage && <Footer />}
    </div>
  );
}