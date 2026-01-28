
# Prerender.io Configuration for Vercel

## Overview
Add Prerender.io bot rendering support to the existing `vercel.json` by adding a `rewrites` section that detects search engine bots and proxies their requests through Prerender.io for pre-rendered HTML.

## Current State
The `vercel.json` already has:
- Build configuration (npm run build, dist output)
- Routes for static files and SPA fallback
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)

## Changes to Make

### Add Rewrites Section
Insert a `rewrites` array before the existing routes that:
1. Uses `has` condition to check the User-Agent header against bot patterns
2. Matches all paths with `source: "/:path*"`
3. Rewrites to Prerender.io service URL with the original path

### Bot Patterns to Match
- googlebot, bingbot, yandex, baiduspider
- facebookexternalhit, twitterbot, linkedinbot
- Generic patterns: bot, crawler, spider

### Token Configuration
The Prerender.io token is passed via the request to their service. Vercel's rewrites don't directly support adding headers to rewritten requests, so the recommended approach is to use URL-based token authentication with Prerender.io or configure the token in the Prerender.io dashboard for domain whitelisting.

---

## Technical Details

### Updated vercel.json Structure

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(bot|crawler|spider|googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot).*"
        }
      ],
      "destination": "https://service.prerender.io/https://www.divtrkr.com/:path*"
    }
  ],
  "routes": [
    // ... existing routes preserved
  ],
  "headers": [
    // ... existing headers preserved
  ]
}
```

### Key Points
1. **Rewrites run before routes** - Bot requests are intercepted before normal routing
2. **Case-insensitive matching** - The regex pattern matches common bot user agents
3. **Path preservation** - The `:path*` parameter captures and forwards the full URL path
4. **Token note** - Prerender.io tokens are typically configured in their dashboard for domain whitelisting rather than via headers in rewrites

### After Deployment
1. Replace `YOUR_PRERENDER_TOKEN` in Prerender.io dashboard settings
2. Add `www.divtrkr.com` to your Prerender.io allowed domains
3. Test with: `curl -A "googlebot" https://www.divtrkr.com/`
