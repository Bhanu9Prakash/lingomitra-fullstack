import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LanguageSelection from "@/pages/LanguageSelection";
import LessonView from "@/pages/LessonView";
import AuthPage from "@/pages/auth-page";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import SubscribePage from "@/pages/SubscribePage";
import AdminDashboard from "@/pages/AdminDashboard";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import FAQPage from "@/pages/FAQPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import Healthcheck from "./pages/Healthcheck";
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
        
        {/* Profile and Settings pages */}
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/settings" component={Settings} />
        
        {/* Admin Dashboard */}
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        
        {/* Authentication routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        
        {/* Subscription page - public */}
        <Route path="/subscribe" component={SubscribePage} />
        
        {/* About page - public */}
        <Route path="/about" component={AboutPage} />
        
        {/* Contact page - public */}
        <Route path="/contact" component={ContactPage} />
        
        {/* FAQ page - public */}
        <Route path="/faq" component={FAQPage} />
        
        {/* Health check - public */}
        <Route path="/health" component={Healthcheck} />
        
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
          <ToastProvider>
            {/* Toaster moved outside Router so it's not affected by Layout styling */}
            <Toaster />
            <AuthProvider>
              <Router />
            </AuthProvider>
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
