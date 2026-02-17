

# Fix Canonical URLs and Update Sitemap Dates

## Problem
Google is treating the Lovable subdomain (`divtrkr.lovable.app`) as the canonical version of pages because the SEOHead component explicitly points canonical URLs there. This blocks all indexing on the custom domain `www.divtrkr.com`.

## Changes

### 1. `src/pages/StockScreener.tsx` (line 286)
Change canonical from `https://divtrkr.lovable.app/stock-screener` to `https://www.divtrkr.com/stock-screener`

### 2. `src/pages/DividendCalendar.tsx` (line 896)
Change canonical from `https://divtrkr.lovable.app/dividend-calendar` to `https://www.divtrkr.com/dividend-calendar`

### 3. `src/pages/FutureIncomeProjects.tsx` (line 657)
Fix path typo: change `https://www.divtrkr.com/future-income-projections` to `https://www.divtrkr.com/future-income-projects`

### 4. `public/sitemap.xml` (lines 6, 14, 22, 30)
Update all four `lastmod` dates from `2026-01-30` to `2026-02-17`

### Not changing (per your instructions)
- Dashboard stays `noIndex={true}` and disallowed in robots.txt
- Dashboard stays excluded from sitemap
- robots.txt stays as-is

