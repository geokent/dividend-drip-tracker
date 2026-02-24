

# Fix Per-Page SEO Meta Tags

## Problem
The `SEOHead` component already exists and most pages pass custom props, but two issues remain:
1. **Twitter Card tags are missing** from the `SEOHead` component entirely — only OG tags are set dynamically.
2. **Titles and descriptions need updating** on 3 pages to match the exact copy you specified.
3. **Structured data URL** is hardcoded to the homepage in `index.html` and never updated per-page.

## Changes

### 1. Update `src/components/SEOHead.tsx`
- Add Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:url`) alongside the existing OG tags.
- Update the structured data logic to merge/override the `url` field with the current `canonicalUrl` so each page gets its own URL in JSON-LD.

### 2. Update `src/pages/DividendCalendar.tsx` (SEOHead props ~line 892)
Replace the current title/description with:
- **Title**: `Free Dividend Calendar 2026 - Ex-Dividend Dates & Payment Schedule | DivTrkr`
- **Description**: `Track upcoming ex-dividend dates and payment schedules for 150+ dividend stocks. Free dividend calendar for income investors. Never miss a dividend payment.`
- **Canonical**: already correct (`https://www.divtrkr.com/dividend-calendar`)

### 3. Update `src/pages/StockScreener.tsx` (SEOHead props ~line 282)
Replace the current title/description with:
- **Title**: `Free Dividend Stock Screener - Filter by Yield, Payout Ratio & Growth | DivTrkr`
- **Description**: `Screen 150+ dividend stocks by yield, payout ratio, dividend growth rate, and more. Find your next income investment. Free stock screener for dividend investors.`
- **Canonical**: already correct (`https://www.divtrkr.com/stock-screener`)

### 4. Update `src/pages/FutureIncomeProjects.tsx` (SEOHead props ~line 623)
Replace the current title/description with:
- **Title**: `Dividend Income Projections Calculator - DRIP & Compound Growth | DivTrkr`
- **Description**: `Project your future dividend income with DRIP reinvestment modeling. See how your passive income compounds over 5, 10, and 20 years. Free calculator.`
- **Canonical**: already correct (`https://www.divtrkr.com/future-income-projects`)

### 5. Homepage (`/`) — No changes
The homepage uses static tags from `index.html` and does not render `SEOHead`. This is already correct.

## Technical Details

**SEOHead.tsx additions** (inside the existing `useEffect`):

```text
// Twitter Card tags
updateMetaTag('twitter:card', 'summary_large_image');
updateMetaTag('twitter:title', title);
updateMetaTag('twitter:description', description);
updateMetaTag('twitter:image', ogImage);
updateMetaTag('twitter:url', canonicalUrl);
```

**Structured data URL override** — update the existing structured data block to always set the current page URL:

```text
if (structuredData) {
  const dataWithUrl = { ...structuredData, url: canonicalUrl };
  // ... rest of existing logic using dataWithUrl
}
```

Each page that passes `structuredData` will automatically get the correct URL. Pages without structured data props will leave the static homepage schema from `index.html` intact (which is correct behavior for SPA navigation — the static one only matters for initial crawl of `/`).

## Files Modified

| File | Change |
|------|--------|
| `src/components/SEOHead.tsx` | Add Twitter Card tags; merge canonicalUrl into structuredData |
| `src/pages/DividendCalendar.tsx` | Update title and description props |
| `src/pages/StockScreener.tsx` | Update title and description props |
| `src/pages/FutureIncomeProjects.tsx` | Update title and description props |

