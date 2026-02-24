

# Vercel Migration - Phase 1 Implementation

## Branch
All changes will be made on the current branch: `feature/vercel-migration-phase1`

## Changes

### 1. Replace `vercel.json`
Replace the entire file with the minimal Vite SPA config:

```text
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This removes:
- Prerender.io bot rewrites
- Legacy `routes` array
- Custom security headers

These can be re-added in Phase 2 after confirming the basic deployment works.

### 2. `package.json` -- No Changes
The required Vite scripts (`dev`, `build`, `preview`) already exist.

### 3. `vite.config.ts` -- No Changes
No pre-rendering plugins in this phase.

## Files Modified

| File | Change |
|------|--------|
| `vercel.json` | Replace with minimal Vite SPA config |

