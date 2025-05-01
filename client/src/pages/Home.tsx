import { useEffect } from "react";
import Hero from "@/components/Hero";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  // If user is already logged in and accessing the root path,
  // redirect them to the dashboard to see their language learning content
  useEffect(() => {
    if (user && window.location.pathname === '/') {
      navigate('/languages');
    }
  }, [user, navigate]);

  return (
    <Hero />
  );
}
