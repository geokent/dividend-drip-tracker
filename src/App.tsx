import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";

import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import { LearnDividends } from "./pages/LearnDividends";
import { LearnDividendSnowball } from "./pages/LearnDividendSnowball";
import { LearnFIRE } from "./pages/LearnFIRE";
import { FutureIncomeProjects } from "./pages/FutureIncomeProjects";
import { LearningAcademy } from "./pages/LearningAcademy";
import { DividendDashboard } from "@/components/DividendDashboard";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => {
  console.log('App.tsx: Rendering App component');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
          <Routes>
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DividendDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/learn-dividends" element={
              <ProtectedRoute>
                <LearnDividends />
              </ProtectedRoute>
            } />
            <Route path="/learn-dividend-snowball" element={
              <ProtectedRoute>
                <LearnDividendSnowball />
              </ProtectedRoute>
            } />
            <Route path="/learn-fire" element={
              <ProtectedRoute>
                <LearnFIRE />
              </ProtectedRoute>
            } />
            <Route path="/learning-academy" element={
              <ProtectedRoute>
                <LearningAcademy />
              </ProtectedRoute>
            } />
            <Route path="/future-income-projects" element={<FutureIncomeProjects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
