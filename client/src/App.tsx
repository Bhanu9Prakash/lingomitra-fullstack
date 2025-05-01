import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LanguageSelection from "@/pages/LanguageSelection";
import LessonView from "@/pages/LessonView";
import AuthPage from "@/pages/auth-page";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
// Import the AuthProvider from the hooks directory
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Home page is public to show marketing content */}
        <Route path="/" component={Home} />
        
        {/* Protected routes requiring authentication */}
        <ProtectedRoute path="/dashboard" component={Home} />
        <ProtectedRoute path="/languages" component={LanguageSelection} />
        {/* Legacy routes - keep for compatibility but will redirect */}
        <ProtectedRoute path="/language/:code" component={LessonView} />
        <ProtectedRoute path="/lesson/:id" component={LessonView} />
        {/* New standard route format */}
        <ProtectedRoute path="/:language/lesson/:lessonNumber" component={LessonView} />
        
        {/* Authentication route */}
        <Route path="/auth" component={AuthPage} />
        
        {/* 404 page */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
