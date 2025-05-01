import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LanguageSelection from "@/pages/LanguageSelection";
import LessonView from "@/pages/LessonView";
import AuthPage from "@/pages/AuthPage";
// Temporarily removed theme provider to fix React hook issues
import Layout from "@/components/Layout";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/languages" component={LanguageSelection} />
        <Route path="/auth" component={AuthPage} />
        {/* Legacy routes - keep for compatibility but will redirect */}
        <Route path="/language/:code" component={LessonView} />
        <Route path="/lesson/:id" component={LessonView} />
        {/* New standard route format */}
        <Route path="/:language/lesson/:lessonNumber" component={LessonView} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
