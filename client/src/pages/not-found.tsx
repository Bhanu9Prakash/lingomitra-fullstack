import { Link } from "wouter";
import { Button } from "@/components/ui/button";

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
          <Button asChild><Link href="/">Go home</Link></Button>
          
          <Button asChild variant="outline"><Link href="/languages">See languages</Link></Button>
        </div>
      </div>
    </div>
  );
}
