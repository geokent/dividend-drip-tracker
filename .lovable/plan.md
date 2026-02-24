

# Phase 2: Pre-rendering for SEO

## Branch
`feature/vercel-migration-phase1` (current branch)

## Changes

### 1. Install `vite-plugin-prerender`
Add as a dev dependency:
```text
npm install -D vite-plugin-prerender
```

### 2. Update `vite.config.ts`
Replace the entire file with the user-provided configuration that adds `PrerenderSPAPlugin` for production builds only.

Pre-rendered routes:
- `/`
- `/dividend-calendar`
- `/stock-screener`
- `/future-income-projects`
- `/terms`
- `/privacy`

The plugin will wait 500ms (`renderAfterTime`) for the `SEOHead` component to update meta tags before capturing each page's static HTML.

### 3. No other files modified
- `vercel.json` -- no changes (already updated in Phase 1)
- `package.json` -- only the new dev dependency added automatically

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Add `vite-plugin-prerender` as devDependency |
| `vite.config.ts` | Add `PrerenderSPAPlugin` import and plugin config for production mode |

## How It Works
During `vite build`, the plugin spins up a headless browser, navigates to each listed route, waits 500ms for client-side meta tags to render, then saves the fully-rendered HTML as static files. Vercel serves these static HTML files to bots and crawlers, ensuring correct per-page SEO metadata.

