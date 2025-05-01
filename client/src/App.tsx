import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LanguageSelection from "@/pages/LanguageSelection";
import LessonView from "@/pages/LessonView";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
// Temporarily commenting out ThemeProvider import
// import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/languages" component={LanguageSelection} />
        {/* Legacy routes - keep for compatibility but will redirect */}
        <Route path="/language/:code" component={LessonView} />
        <Route path="/lesson/:id" component={LessonView} />
        {/* New standard route format */}
        <Route path="/:language/lesson/:lessonNumber" component={LessonView} />
        {/* Information pages */}
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Temporarily removed ThemeProvider to fix issues */}
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
