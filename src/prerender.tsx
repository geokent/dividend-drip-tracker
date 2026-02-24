import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { FutureIncomeProjects } from "./pages/FutureIncomeProjects";
import DividendCalendar from "./pages/DividendCalendar";
import StockScreener from "./pages/StockScreener";
import NotFound from "./pages/NotFound";
import { getSEOForRoute } from "./seoData";

export async function prerender(data: { url: string }) {
  const url = data.url || "/";
  const queryClient = new QueryClient();
  const seo = getSEOForRoute(url);

  const html = renderToString(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StaticRouter location={url}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dividend-calendar" element={<DividendCalendar />} />
              <Route path="/stock-screener" element={<StockScreener />} />
              <Route path="/future-income-projects" element={<FutureIncomeProjects />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );

  const head = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    ${seo.keywords ? `<meta name="keywords" content="${seo.keywords}" />` : ""}
    <link rel="canonical" href="${seo.canonicalUrl}" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:url" content="${seo.canonicalUrl}" />
    <meta property="og:image" content="${seo.ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${seo.ogImage}" />
  `;

  return { html, head };
}
