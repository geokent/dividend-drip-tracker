import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";

import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { LearnDividends } from "./pages/LearnDividends";
import { LearnDividendSnowball } from "./pages/LearnDividendSnowball";
import { LearnFIRE } from "./pages/LearnFIRE";
import { FutureIncomeProjects } from "./pages/FutureIncomeProjects";
import { LearningAcademy } from "./pages/LearningAcademy";
import { DividendDashboard } from "@/components/DividendDashboard";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/learn-dividends" element={<LearnDividends />} />
            <Route path="/learn-dividend-snowball" element={<LearnDividendSnowball />} />
            <Route path="/learn-fire" element={<LearnFIRE />} />
            <Route path="/future-income-projects" element={<FutureIncomeProjects />} />
            <Route path="/learning-academy" element={<LearningAcademy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
