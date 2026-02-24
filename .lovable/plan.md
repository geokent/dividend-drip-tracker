

# Cleanup: Remove Pre-rendering, Restore Static SEO

## Overview
Remove all `vite-prerender-plugin` infrastructure and revert to a simple static meta tag approach in `index.html`. This eliminates build complexity while maintaining consistent SEO metadata.

## Changes

### 1. Remove `vite-prerender-plugin` from `package.json`
Remove `vite-prerender-plugin` from devDependencies.

### 2. Restore clean `vite.config.ts`
- Remove the `vitePrerenderPlugin` import and plugin config
- Keep `componentTagger` for dev mode
- Result: standard Vite + React config with no prerendering

### 3. Delete `src/prerender.tsx` and `src/seoData.ts`
These files were created for the prerender plugin and are no longer needed.

### 4. Restore `src/main.tsx`
Revert from the hydration logic back to simple `createRoot().render()`:
```text
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

### 5. Update `vercel.json`
Replace with clean config including SPA rewrites and security headers:
```text
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-XSS-Protection", "value": "1; mode=block" }
    ]
  }]
}
```

### 6. Update `index.html` meta tags
Replace the existing SEO meta tags in `<head>` with the user-specified static tags. Key changes:
- Description updated to FIRE-focused copy
- Canonical set to `https://www.divtrkr.com`
- OG and Twitter images point to `/og-image.png`
- Existing title, favicon, fonts, PWA manifest, AdSense, structured data, and noscript block remain unchanged

**Note:** The `og:image` and `twitter:image` reference `/og-image.png`. If this file doesn't exist in `public/`, those tags will point to a 404. The existing favicon PNG could be used as a fallback if needed.

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Remove `vite-prerender-plugin` |
| `vite.config.ts` | Remove prerender plugin, restore clean config |
| `src/prerender.tsx` | **Delete** |
| `src/seoData.ts` | **Delete** |
| `src/main.tsx` | Revert to simple `createRoot` |
| `vercel.json` | Add security headers |
| `index.html` | Update meta tags to static SEO values |

