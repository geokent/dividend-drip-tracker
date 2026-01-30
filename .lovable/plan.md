

# SEO Files Update Plan

## Overview
Update the `public/sitemap.xml` and `public/robots.txt` files with a consistent SEO strategy: only index public pages that work without authentication.

---

## File 1: public/sitemap.xml

**Complete updated file:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://www.divtrkr.com/</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Dividend Calendar -->
  <url>
    <loc>https://www.divtrkr.com/dividend-calendar</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Stock Screener -->
  <url>
    <loc>https://www.divtrkr.com/stock-screener</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Future Income Projections -->
  <url>
    <loc>https://www.divtrkr.com/future-income-projects</loc>
    <lastmod>2026-01-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Changes:**
- Updated all lastmod dates to 2026-01-30
- Added /stock-screener and /future-income-projects
- Removed /terms, /privacy (low SEO value)
- Removed /dashboard and /auth (require authentication)
- Changed /dividend-calendar to daily updates

---

## File 2: public/robots.txt

**Complete updated file:**

```text
# DivTrkr Robots.txt
# Last updated: 2026-01-30

# Allow all legitimate bots to crawl public pages
User-agent: *
Allow: /
Allow: /dividend-calendar
Allow: /stock-screener
Allow: /future-income-projects
Disallow: /auth
Disallow: /api/
Disallow: /dashboard

# Social media bots - full access for rich previews
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

# Block aggressive SEO crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

# Sitemap location
Sitemap: https://www.divtrkr.com/sitemap.xml
```

**Changes:**
- Consolidated bot rules with single wildcard section
- Added explicit Allow for public tool pages
- Added Disallow for /api/ endpoints
- Added AhrefsBot and SemrushBot blocking
- Added LinkedInBot for social preview support
- Removed duplicate Googlebot/Bingbot sections

---

## Indexing Strategy Summary

| Page | Sitemap | Robots | Status |
|------|---------|--------|--------|
| / | Yes (1.0) | Allow | Public homepage |
| /dividend-calendar | Yes (0.9) | Allow | Public tool |
| /stock-screener | Yes (0.9) | Allow | Public tool |
| /future-income-projects | Yes (0.8) | Allow | Public tool |
| /dashboard | No | Disallow | Requires login |
| /auth | No | Disallow | Login page |
| /api/ | No | Disallow | API endpoints |

