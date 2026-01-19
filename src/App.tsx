import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";

import Index from "./pages/Index";
import Features from "./pages/Features";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OtpVerify from "./pages/OtpVerify";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import DeniedCandidates from "./pages/DeniedCandidates";

const queryClient = new QueryClient();

// Component to restore auth on app init
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if jwt cookie exists and user is in localStorage
    const userString = localStorage.getItem("auth-storage");
    if (userString) {
      try {
        const authData = JSON.parse(userString);
        if (authData.state?.isAuthenticated) {
          setAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to parse auth storage:", e);
      }
    }
  }, [setAuthenticated]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthInitializer>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<OtpVerify />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/deniedCandidates"
                element={
                  <ProtectedRoute>
                    <DeniedCandidates />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthInitializer>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
