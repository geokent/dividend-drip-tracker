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
import { LearnDividends } from "./pages/LearnDividends";
import { LearnDividendSnowball } from "./pages/LearnDividendSnowball";
import { LearnFIRE } from "./pages/LearnFIRE";
import { FutureIncomeProjects } from "./pages/FutureIncomeProjects";
import { LearningAcademy } from "./pages/LearningAcademy";
import { DividendDashboard } from "@/components/DividendDashboard";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import FAQ from "./pages/FAQ";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Author } from "./pages/Author";
import { Editorial } from "./pages/Editorial";

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
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/author" element={<Author />} />
            <Route path="/editorial" element={<Editorial />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
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
