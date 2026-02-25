
# Redesign Homepage Hero: Replace Auth Form with FIRE Calculator

## Overview
Replace the authentication form in the hero section's right column (`lg:col-span-2`) with an inline FIRE calculator. Includes robust input validation and displays the target portfolio size alongside years-to-FIRE.

## Changes to `src/components/LandingPageV2.tsx`

### 1. Remove auth-related state and handlers
**Remove** these state variables and functions:
- `isSignUp`, `email`, `password`, `displayName`, `showPassword`, `isLoading`, `showEmailVerification`
- `handleSignUp`, `handleSignIn` functions
- `cleanupAuthState` helper (top-level function)

**Remove** unused imports: `Eye`, `EyeOff`, `Loader2`, `supabase` client import

**Keep**: `useAuth` (for redirect-to-dashboard logic), `useNavigate`, `useToast`

### 2. Add FIRE calculator state
```text
const [annualIncome, setAnnualIncome] = useState("");
const [desiredPassiveIncome, setDesiredPassiveIncome] = useState("");
const [fireResult, setFireResult] = useState<{
  years: number;
  targetPortfolio: number;
  fireYear: number;
} | null>(null);
```

### 3. Calculation logic with input validation
The `handleCalculate` function will:
- Parse both inputs as numbers
- **Validate**: both must be positive numbers (> 0)
- **Validate**: desired passive income must be reasonable (cap at some upper bound isn't needed, but guard against zero/negative)
- Calculate target portfolio using the 4% rule: `targetPortfolio = desiredPassiveIncome * 25`
- Assume 20% savings rate and 7% annual return
- Use compound growth: `years = ln((target * r / annualSavings) + 1) / ln(1 + r)` where `r = 0.07` and `annualSavings = annualIncome * 0.20`
- **Guard against edge cases**:
  - If annual savings is 0 or negative: show toast error "Please enter a positive income"
  - If the formula produces NaN, Infinity, or negative: show a fallback message like "With these inputs, you may need to increase your savings rate"
  - Cap displayed years at 100 ("100+ years")
- Store `{ years, targetPortfolio, fireYear: currentYear + years }`

### 4. Replace the right-column auth Card (lines ~394-513)
Delete the entire `lg:col-span-2` div with the auth Card. Replace with:

```text
Card with shadow-xl:
  Header: "See Your FIRE Date" / "Find out when you can retire"
  Content:
    - Label + Input: "Current Annual Income ($)" placeholder "80,000"
    - Label + Input: "Desired Annual Passive Income ($)" placeholder "50,000"
    - Button size="lg" full-width: "Calculate Your FIRE Date -- Free"
    - Disclaimer text: "No credit card required. Always free."

  When fireResult is set, show below the button:
    - Highlighted box (bg-primary/5): 
      "Your FIRE Number: $X" (targetPortfolio formatted with commas)
    - Second highlighted box (bg-accent/10):
      "You could reach FIRE in ~X years (by [year])!"
    - If years > 100: "At current rates, FIRE is 100+ years away. Consider increasing your savings rate."
    - CTA Button linking to /auth: "Save Your Plan -- Create Free Account" with ArrowRight icon
```

### 5. Header Sign In button
Change the header `Button` `onClick` from `() => setIsSignUp(false)` to `() => navigate("/auth")`.

### 6. Remove other auth toggle references
The bottom of the auth card has "Already have an account? Sign in" / "Don't have an account? Sign up" toggle buttons -- these will be removed along with the auth card.

## Input Validation Summary

| Edge Case | Handling |
|-----------|----------|
| Empty fields | Show toast: "Please fill in both fields" |
| Zero or negative income | Show toast: "Please enter a positive income" |
| Zero or negative desired income | Show toast: "Please enter a positive amount" |
| Result is NaN or Infinity | Show message: "Unable to calculate. Try adjusting your inputs." |
| Years > 100 | Display "100+ years" with suggestion to increase savings rate |
| Non-numeric input | HTML `type="number"` prevents this; `parseFloat` fallback returns NaN which is caught |

## Result Display
The result section will show **two key numbers** for maximum impact:
1. **Target Portfolio**: "You need **$1,250,000** invested" (makes it tangible)
2. **Years to FIRE**: "You could reach FIRE in **~15 years** (by 2041)!"

This creates urgency and motivation to sign up and track progress.

## Files Modified

| File | Change |
|------|--------|
| `src/components/LandingPageV2.tsx` | Replace auth form with FIRE calculator, add validation, show target portfolio + years |
