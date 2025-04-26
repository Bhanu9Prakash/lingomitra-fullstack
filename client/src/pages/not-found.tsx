import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-160px)] w-full flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-destructive/10 mx-auto flex items-center justify-center mb-6">
          <i className="fas fa-exclamation-triangle text-4xl text-destructive"></i>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-3">404</h1>
        <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        
        <div className="space-x-4">
          <Link href="/">
            <button className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all hover:-translate-y-1 shadow-sm font-semibold">
              Go Home
            </button>
          </Link>
          
          <Link href="/languages">
            <button className="px-5 py-2 border border-border hover:bg-muted text-foreground rounded-lg transition-colors font-semibold">
              See Languages
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
