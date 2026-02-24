

# Vercel Migration - Phase 1

## Current State
- **`package.json`**: Already has the required `dev`, `build`, and `preview` scripts. No changes needed.
- **`vercel.json`**: Already exists but contains a complex configuration with Prerender.io bot rewrites, legacy `routes` syntax, and custom headers. This needs to be **replaced** with your simplified version.

## Important Note on Git Branches
Lovable has **experimental, limited** support for Git branches. To use this feature, you need to enable it first:
1. Go to **Account Settings > Labs**
2. Enable **GitHub Branch Switching**

If branch switching is not enabled, changes will go directly to your default branch. Alternatively, you could create the branch and make these changes directly in GitHub/your local IDE, which gives you full Git control.

## Changes

### 1. Replace `vercel.json`
The current file has Prerender.io rewrites, legacy Vercel `routes` array, and security headers. Replace the entire file with the minimal SPA config:

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

Key differences from the current file:
- Removes the Prerender.io bot-specific rewrite (will be revisited in Phase 2)
- Removes legacy `routes` array in favor of the modern `rewrites` syntax
- Removes custom security headers (can be re-added in Phase 2 using the `headers` key)
- Adds `"framework": "vite"` to help Vercel auto-detect the project type

### 2. `package.json` -- No Changes Needed
The required scripts already exist:
- `"dev": "vite"`
- `"build": "vite build"`
- `"preview": "vite preview"`

### 3. `vite.config.ts` -- No Changes (per your instructions)
No pre-rendering plugins will be added in this phase.

## Files Modified

| File | Change |
|------|--------|
| `vercel.json` | Replace with minimal Vite SPA config |

## What You Lose Temporarily
The current `vercel.json` includes Prerender.io bot rewrites and security headers. These are removed in Phase 1 for a clean baseline. Plan to re-add them in Phase 2 after confirming the basic Vercel deployment works.

