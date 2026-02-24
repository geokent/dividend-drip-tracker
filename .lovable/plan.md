

# Phase 2: Pre-rendering with vite-prerender-plugin

## Overview
Replace the broken `vite-plugin-prerender` (which uses `require()` and fails in ESM) with `vite-prerender-plugin` from the Preact team. This plugin is fully ESM-compatible and works with React via `renderToString`.

**No routing changes needed** -- your existing `react-router-dom` setup stays exactly as-is.

## How It Works
1. During `vite build`, the plugin imports a prerender script you provide
2. That script uses React's `renderToString` with `StaticRouter` to render each route to HTML
3. The plugin saves the rendered HTML into the `dist/` folder as static files
4. Vercel serves these static HTML files (with correct meta tags baked in) to bots and crawlers
5. When a real user loads the page, React hydrates and takes over as a normal SPA

## Changes

### 1. Remove `vite-plugin-prerender`, install `vite-prerender-plugin`
- Remove `vite-plugin-prerender` from dependencies
- Install `vite-prerender-plugin` as a dev dependency

### 2. Update `vite.config.ts`
- Remove the `PrerenderSPAPlugin` import and plugin config
- Add `vitePrerenderPlugin` with `renderTarget: '#root'` and `additionalPrerenderRoutes` for all 6 public routes
- Remove the `componentTagger` (dev-only Lovable tool, not needed for production deployments)

### 3. Create `src/prerender.tsx` (new file)
This is the prerender entry point the plugin calls during build. It:
- Imports `renderToString` from `react-dom/server`
- Imports `StaticRouter` from `react-router-dom/server` (already included in react-router-dom v6)
- Renders the App's route content for each URL
- Returns the HTML string with per-route SEO meta tags embedded in the `<head>`

The key insight: instead of relying on `useEffect` (which doesn't run during SSR), the prerender script will directly inject the correct `<title>`, `<meta>`, and `<link rel="canonical">` tags into the head based on the route being rendered.

### 4. Create `src/seoData.ts` (new file)
A shared data file mapping routes to their SEO metadata (title, description, canonical URL, OG tags). This keeps the SEO data in one place and is used by both:
- The prerender script (for static HTML generation)
- The existing `SEOHead` component (for client-side updates)

### 5. Update `src/main.tsx`
Change `createRoot().render()` to `hydrateRoot()` so React properly hydrates the pre-rendered HTML instead of replacing it. Include a fallback to `createRoot` for development mode.

### 6. No changes to
- `vercel.json` (already correct from Phase 1)
- `src/App.tsx` (routing stays the same)
- Any page components

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Remove `vite-plugin-prerender`, add `vite-prerender-plugin` to devDependencies |
| `vite.config.ts` | Replace plugin config with `vitePrerenderPlugin` |
| `src/prerender.tsx` | **New** -- prerender entry point using `renderToString` + `StaticRouter` |
| `src/seoData.ts` | **New** -- shared SEO metadata map for all public routes |
| `src/main.tsx` | Switch to `hydrateRoot` for pre-rendered pages |

## Pre-rendered Routes
- `/` (Homepage / Landing)
- `/dividend-calendar`
- `/stock-screener`
- `/future-income-projects`
- `/terms`
- `/privacy`

## Technical Details

The prerender script structure:

```text
src/prerender.tsx
  - Export async function prerender(data)
  - Uses StaticRouter to render each route
  - Returns { html, head } where head contains route-specific meta tags
  - The plugin injects html into #root and head into <head>
```

The hydration change in main.tsx:

```text
- Before: createRoot(el).render(<App />)
- After:  hydrateRoot(el, <App />) when pre-rendered content exists
          createRoot(el).render(<App />) as fallback
```

