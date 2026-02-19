

# Fix: Remove `noindex` Block for Unauthenticated Users on Future Income Projects

## Problem
When Googlebot (unauthenticated) visits `/future-income-projects`, lines 622-648 of `FutureIncomeProjects.tsx` render a "Sign In Required" card with `noIndex={true}` in the SEOHead. Google sees the `noindex` robots meta tag and refuses to index the page.

## Solution
Replace the current "block unauthenticated users entirely" pattern with a design that shows the full page to everyone, but prompts sign-in inline for personalized data -- similar to how other public pages work.

### Changes to `src/pages/FutureIncomeProjects.tsx`

1. **Remove the early return block** (lines 621-648) that shows "Sign In Required" with `noIndex={true}`
2. **Keep the main SEOHead** (lines 653-658) which already has the correct indexable metadata and canonical URL
3. **Add a sign-in prompt inside the page content** (e.g., a banner or card within the existing layout) so unauthenticated visitors see the page structure, headings, and description -- making it indexable -- while being encouraged to sign in for personalized projections

### What unauthenticated visitors (and Googlebot) will see
- The full page layout with Header, page title, and descriptive content
- The projection tools with default/zero values (since the data-fetching already handles `!user` gracefully by returning empty arrays)
- A prominent sign-in prompt card encouraging them to log in for personalized results

### What stays the same
- Authenticated users see their full portfolio data as before
- The SEOHead with proper canonical URL, title, and description remains unchanged
- No sensitive data is exposed (empty portfolio for guests)

## Technical Detail

The `!user` early return at line 622 will be removed. Instead, within the main render, we will add a conditional banner/card (visible only when `!user`) that says something like "Sign in to see your personalized projections" with a link to the home/auth page. The rest of the page renders normally with zeroed-out data.

