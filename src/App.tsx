
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/groundtruthingnotice";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// This component handles redirects from the 404.html page
const RedirectHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's a redirect path stored
    if (window.redirectTo) {
      console.log("Redirecting to:", window.redirectTo);
      
      // Get the redirect path and clear it
      const path = window.redirectTo;
      window.redirectTo = null;
      
      // Use React Router's navigate for SPA navigation
      navigate(path);
    }
  }, [navigate]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/ground-truth-generator">
        <RedirectHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groundtruthingnotice" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
