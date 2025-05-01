import { Link } from "wouter";
import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 bg-white">
      <div className="text-center max-w-xl flex flex-col items-center">
        <div className="flex flex-row items-center justify-center mb-8 relative">
          <div className="mr-4">
            <h1 className="text-7xl md:text-8xl font-extrabold text-[#ff6600]">404</h1>
          </div>
          <div>
            <img 
              src="/404.svg"
              alt="404 Fox" 
              className="w-40 md:w-48 h-auto"
            />
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#333333]">Page not found</h2>
        
        <p className="text-[#666666] mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        
        <Link href="/">
          <button className="px-8 py-3 bg-[#ff6600] hover:bg-[#ff7722] text-white rounded-lg 
                        transition-all hover:-translate-y-1 shadow-md font-semibold text-lg 
                        inline-block">
            Go to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
