/**
 * prerender.mjs
 * 
 * Post-build script that generates per-route static HTML files with
 * correct meta tags baked in. Crawlers (Google, AdSense, social) receive
 * fully-formed HTML without needing to execute JavaScript.
 * 
 * Run after: vite build
 * Vercel serves static files before rewrites, so dist/route/index.html
 * is served directly for that path.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

const routes = [
  {
    route: 'dividend-calendar',
    title: 'Free Dividend Calendar 2026 - Ex-Dividend Dates & Payment Schedule | DivTrkr',
    description: 'Track upcoming ex-dividend dates and payment schedules for 150+ dividend stocks. Free dividend calendar for income investors. Never miss a dividend payment.',
    keywords: 'dividend calendar 2026, ex-dividend dates, dividend payment schedule, dividend tracker, income investing, SCHD dividends',
    canonical: 'https://www.divtrkr.com/dividend-calendar',
    ogTitle: 'Free Dividend Calendar 2026 | DivTrkr',
    ogDescription: 'Track ex-dividend dates and payment schedules for 150+ stocks. Free forever.',
    ogUrl: 'https://www.divtrkr.com/dividend-calendar',
  },
  {
    route: 'stock-screener',
    title: 'Free Dividend Stock Screener - Filter by Yield, Payout Ratio & Growth | DivTrkr',
    description: 'Screen 150+ dividend stocks by yield, payout ratio, dividend growth rate, and more. Find your next income investment. Free stock screener for dividend investors.',
    keywords: 'dividend stock screener, high yield dividend stocks, dividend growth stocks, SCHD, JEPI, JEPQ, stock screener free',
    canonical: 'https://www.divtrkr.com/stock-screener',
    ogTitle: 'Free Dividend Stock Screener | DivTrkr',
    ogDescription: 'Screen 150+ dividend stocks by yield, payout ratio, and growth. Free forever.',
    ogUrl: 'https://www.divtrkr.com/stock-screener',
  },
  {
    route: 'future-income-projects',
    title: 'Dividend Income Projections Calculator - DRIP & Compound Growth | DivTrkr',
    description: 'Project your future dividend income with DRIP reinvestment modeling. See how your passive income compounds over 5, 10, and 20 years. Free calculator.',
    keywords: 'dividend income projections, DRIP calculator, dividend compound growth, passive income calculator, FIRE income, early retirement',
    canonical: 'https://www.divtrkr.com/future-income-projects',
    ogTitle: 'Dividend Income Projections Calculator | DivTrkr',
    ogDescription: 'See how your dividends compound with DRIP reinvestment over 5-20 years. Free calculator.',
    ogUrl: 'https://www.divtrkr.com/future-income-projects',
  },
  {
    route: 'terms',
    title: 'Terms of Service | DivTrkr',
    description: 'DivTrkr Terms of Service. Read our terms and conditions for using the DivTrkr dividend tracking platform.',
    keywords: 'DivTrkr terms of service, terms and conditions',
    canonical: 'https://www.divtrkr.com/terms',
    ogTitle: 'Terms of Service | DivTrkr',
    ogDescription: 'DivTrkr Terms of Service and conditions of use.',
    ogUrl: 'https://www.divtrkr.com/terms',
  },
  {
    route: 'privacy',
    title: 'Privacy Policy | DivTrkr',
    description: 'DivTrkr Privacy Policy. Learn how we collect, use, and protect your personal data on the DivTrkr dividend tracking platform.',
    keywords: 'DivTrkr privacy policy, data protection, personal data',
    canonical: 'https://www.divtrkr.com/privacy',
    ogTitle: 'Privacy Policy | DivTrkr',
    ogDescription: 'Learn how DivTrkr collects, uses, and protects your data.',
    ogUrl: 'https://www.divtrkr.com/privacy',
  },
];

// Read the base index.html produced by vite build
let baseHtml;
try {
  baseHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
} catch (e) {
  console.error('❌ dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

// Helper: replace a meta tag attribute value
function replaceMeta(html, selector, value) {
  // Handles both single and double quotes, with or without trailing slash
  return html.replace(
    new RegExp(`(${selector}\\s*=\\s*["'])([^"']*)(["'])`, 'i'),
    `$1${value}$3`
  );
}

let successCount = 0;

for (const route of routes) {
  let html = baseHtml;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`);

  // Standard meta
  html = replaceMeta(html, 'name="description" content', route.description);
  html = replaceMeta(html, 'name="keywords" content', route.keywords);

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${route.canonical}"`
  );

  // Open Graph
  html = replaceMeta(html, 'property="og:title" content', route.ogTitle);
  html = replaceMeta(html, 'property="og:description" content', route.ogDescription);
  html = replaceMeta(html, 'property="og:url" content', route.ogUrl);

  // Twitter
  html = replaceMeta(html, 'name="twitter:title" content', route.ogTitle);
  html = replaceMeta(html, 'name="twitter:description" content', route.ogDescription);

  // JSON-LD: update url field
  html = html.replace(
    /("url"\s*:\s*)"https:\/\/www\.divtrkr\.com[^"]*"/,
    `$1"${route.canonical}"`
  );

  // Write to dist/<route>/index.html
  const routeDir = join(distDir, route.route);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');
  console.log(`✅ Prerendered: /${route.route}`);
  successCount++;
}

console.log(`\n🎉 Prerender complete — ${successCount} routes generated.`);
