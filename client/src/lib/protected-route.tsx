import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({
  path,
  component: Component,
}: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (error) return <Route path={path}><div className="container py-12"><h2 className="text-xl font-bold">We could not load your account</h2><p className="my-4">Please try again. Your saved learning is safe.</p><Button variant="ghost" onClick={() => window.location.reload()}>Try again</Button></div></Route>;

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`} />
      </Route>
    );
  }
  

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}