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
import { FutureIncomeProjects } from "./pages/FutureIncomeProjects";
import { DividendDashboard } from "@/components/DividendDashboard";
import DividendCalendar from "./pages/DividendCalendar";
import StockScreener from "./pages/StockScreener";

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
                <Route path="/future-income-projects" element={
                  <ProtectedRoute>
                    <FutureIncomeProjects />
                  </ProtectedRoute>
                } />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/dividend-calendar" element={<DividendCalendar />} />
                <Route path="/stock-screener" element={<StockScreener />} />
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
