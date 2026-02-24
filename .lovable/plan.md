

# Add Static Prerendering with vite-plugin-prerender

## What This Does
During `npm run build`, the plugin launches a headless browser, visits each listed route, waits for your React app (including `SEOHead`) to render, then saves the fully-rendered HTML. Crawlers and social media scrapers will see the correct per-page title, description, canonical URL, and OG tags without needing to execute JavaScript.

## Important Caveat
**Lovable Cloud builds may not support this plugin** because prerendering requires launching a headless Chromium instance during `vite build`. If the Lovable build environment doesn't have Chromium available, the build will fail. This will work perfectly on your local machine or any CI/CD pipeline (GitHub Actions, Vercel, etc.) where a headless browser is available. If the Lovable Cloud build fails after this change, you'd need to build and deploy externally (which you already do via `deploy.sh` / Firebase).

## Changes

### 1. `package.json` -- Add devDependency
Add `"vite-plugin-prerender": "^1.0.7"` to `devDependencies`. This is the latest stable release from the Rudeus3Greyrat package, which supports Vite 2+ and any framework.

### 2. `vite.config.ts` -- Add prerender plugin for production builds
Import and configure the plugin to prerender the 6 public routes only during production builds (`mode === 'production'`).

**Routes to prerender:**
- `/`
- `/dividend-calendar`
- `/stock-screener`
- `/future-income-projects`
- `/terms`
- `/privacy`

**Configuration:**
- `staticDir`: points to `path.resolve(__dirname, 'dist')` (Vite's output directory)
- `routes`: the 6 routes listed above
- `renderer`: uses `PuppeteerRenderer` with `renderAfterTime: 500` to allow the `SEOHead` component's `useEffect` to fire before capturing HTML

```text
import vitePrerender from 'vite-plugin-prerender';
const Renderer = vitePrerender.PuppeteerRenderer;

// Inside plugins array:
mode === 'production' && vitePrerender({
  staticDir: path.resolve(__dirname, 'dist'),
  routes: ['/', '/dividend-calendar', '/stock-screener', '/future-income-projects', '/terms', '/privacy'],
  renderer: new Renderer({
    renderAfterTime: 500
  })
})
```

The existing `.filter(Boolean)` already handles the conditional inclusion.

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Add `vite-plugin-prerender: ^1.0.7` to devDependencies |
| `vite.config.ts` | Import and configure prerender plugin for production builds |

## No Other Files Changed
The existing `SEOHead` component already injects the correct per-page meta tags at runtime. The prerender plugin simply captures that rendered state into static HTML files, so no changes are needed to any page components.

