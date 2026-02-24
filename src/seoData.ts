export interface RouteSEO {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  keywords?: string;
}

const BASE_URL = "https://www.divtrkr.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export const seoData: Record<string, RouteSEO> = {
  "/": {
    title: "Divtrkr - Track Your Dividend Income & Build Wealth",
    description:
      "Track your dividend income, monitor portfolio performance, and build passive wealth with our comprehensive dividend tracking platform. Start your journey to financial independence today.",
    canonicalUrl: `${BASE_URL}/`,
    ogImage: DEFAULT_OG_IMAGE,
    keywords:
      "dividend tracker, dividend investing, passive income, FIRE, financial independence, investment portfolio, dividend stocks, portfolio tracking",
  },
  "/dividend-calendar": {
    title: "Dividend Calendar - Track Ex-Dividend & Payment Dates | Divtrkr",
    description:
      "Never miss a dividend payment. Track ex-dividend dates, payment schedules, and upcoming dividends for your portfolio stocks all in one calendar.",
    canonicalUrl: `${BASE_URL}/dividend-calendar`,
    ogImage: DEFAULT_OG_IMAGE,
    keywords:
      "dividend calendar, ex-dividend dates, dividend payment dates, dividend schedule, upcoming dividends",
  },
  "/stock-screener": {
    title: "Dividend Stock Screener - Find High-Yield Stocks | Divtrkr",
    description:
      "Screen and filter dividend stocks by yield, payout ratio, sector, and more. Discover the best dividend-paying stocks for your investment portfolio.",
    canonicalUrl: `${BASE_URL}/stock-screener`,
    ogImage: DEFAULT_OG_IMAGE,
    keywords:
      "dividend stock screener, high yield stocks, dividend aristocrats, stock filter, dividend investing",
  },
  "/future-income-projects": {
    title: "Future Income Projections - FIRE Calculator | Divtrkr",
    description:
      "Project your future dividend income and plan your path to financial independence. Calculate how long until dividends cover your expenses.",
    canonicalUrl: `${BASE_URL}/future-income-projects`,
    ogImage: DEFAULT_OG_IMAGE,
    keywords:
      "FIRE calculator, dividend income projection, financial independence, passive income calculator, retirement planning",
  },
  "/terms": {
    title: "Terms of Service | Divtrkr",
    description:
      "Read the terms and conditions for using the Divtrkr dividend tracking platform.",
    canonicalUrl: `${BASE_URL}/terms`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/privacy": {
    title: "Privacy Policy | Divtrkr",
    description:
      "Learn how Divtrkr protects your data and privacy. Read our comprehensive privacy policy.",
    canonicalUrl: `${BASE_URL}/privacy`,
    ogImage: DEFAULT_OG_IMAGE,
  },
};

export function getSEOForRoute(path: string): RouteSEO {
  return (
    seoData[path] ?? {
      title: "Divtrkr - Track Your Dividend Income & Build Wealth",
      description:
        "Track your dividend income, monitor portfolio performance, and build passive wealth.",
      canonicalUrl: `${BASE_URL}${path}`,
      ogImage: DEFAULT_OG_IMAGE,
    }
  );
}
