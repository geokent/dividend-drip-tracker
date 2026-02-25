

# Fix: Auth Page Redirecting to Non-Existent "/learning-academy"

## Problem
The `src/pages/Auth.tsx` file contains four references to `/learning-academy` -- a route that does not exist in the app's router (`App.tsx`). After login or signup, users are sent to a 404 page.

## Solution
Replace all `/learning-academy` references in `Auth.tsx` with `/dashboard`, which is the correct authenticated route defined in `App.tsx`.

## Changes to `src/pages/Auth.tsx`

Four replacements:

1. **Line 28** (redirect if already authenticated): `/learning-academy` -> `/dashboard`
2. **Line 62** (after successful sign-in): `/learning-academy` -> `/dashboard`
3. **Line 95** (email redirect URL for sign-up confirmation): `/learning-academy` -> `/dashboard`
4. **Line 109** (after successful sign-up with confirmed email): `/learning-academy` -> `/dashboard`

Also update the `SEOHead` description on line 143 from "access the Learning Academy" to "access your dividend dashboard".

## Additional Cleanup
In `src/components/LandingPage.tsx` line 329, there is a `Link to="/learning-academy"` that should be updated to point to a valid route (e.g., `/dashboard` or removed). However, since `LandingPageV2.tsx` is the active landing page (used by `Index.tsx`), this is low priority.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Replace 4 instances of `/learning-academy` with `/dashboard` |

