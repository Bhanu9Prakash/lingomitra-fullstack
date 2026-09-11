import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
// Import the AuthProvider from the hooks directory
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

const NotFound = lazy(() => import("@/pages/not-found"));
const LanguageSelection = lazy(() => import("@/pages/LanguageSelection"));
const Today = lazy(() => import("@/pages/Today"));
const Words = lazy(() => import("@/pages/Words"));
const Practice = lazy(() => import("@/pages/Practice"));
const GuidedLesson = lazy(() => import("@/pages/GuidedLesson"));
const TryLanguage = lazy(() => import('@/pages/TryLanguage'));
const LanguageDetail = lazy(() => import("@/pages/LanguageDetail"));
const LessonView = lazy(() => import("@/pages/LessonView"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const ConversationPractice = lazy(() => import("@/pages/ConversationPractice"));
const Healthcheck = lazy(() => import("./pages/Healthcheck"));

function RouteFallback() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <p>Opening your learning studio…</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
        {/* Home page is public to show marketing content */}
        <Route path="/" component={Home} />
        <Route path="/try/:code/:activityId" component={TryLanguage} /><Route path="/try/:code" component={TryLanguage} />

        {/* Protected routes requiring authentication */}
        <ProtectedRoute path="/dashboard" component={Today} />
        <ProtectedRoute path="/dashboard/:code" component={Today} />
        <ProtectedRoute path="/words" component={Words} />
        <ProtectedRoute path="/words/:code" component={Words} />
        <ProtectedRoute path="/practice" component={Practice} />
        <ProtectedRoute path="/practice/:code" component={Practice} />
        <ProtectedRoute path="/learn/:activityId" component={GuidedLesson} />
        <Route path="/languages" component={LanguageSelection} />
        {/* Language detail page */}
        <ProtectedRoute path="/language/:code" component={LanguageDetail} />
        {/* Legacy lesson routes - keep for compatibility but will redirect */}
        <ProtectedRoute path="/lesson/:id" component={LessonView} />
        {/* New standard route format */}
        <ProtectedRoute path="/:language/lesson/:lessonNumber" component={LessonView} />
        
        {/* Conversation Practice page */}
        <ProtectedRoute path="/conversation" component={ConversationPractice} />
        {/* Keep the original learner-facing path working as a compatibility alias. */}
        <ProtectedRoute path="/conversation-practice" component={ConversationPractice} />
        
        {/* Profile and Settings pages */}
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/settings" component={Settings} />
        
        {/* Admin Dashboard */}
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        
        {/* Authentication routes */}
        <Route path="/auth" component={AuthPage} />

        {/* About page - public */}
        <Route path="/about" component={AboutPage} />
        
        {/* Contact form is attributed to the signed-in learner. */}
        <ProtectedRoute path="/contact" component={ContactPage} />
        
        {/* FAQ page - public */}
        <Route path="/faq" component={FAQPage} />
        
        {/* Blog pages - public */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        
        {/* Health check - public */}
        <Route path="/health" component={Healthcheck} />
        
        {/* 404 page */}
        <Route component={NotFound} />
        </Switch>
      </Suspense>
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
