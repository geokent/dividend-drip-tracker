

# DividendCoach AI Chat - Full Implementation Plan

## Overview
Implement a floating AI chat assistant with server-side rate limiting (5/day), portfolio-aware context, and streaming responses via Lovable AI Gateway.

## Step 1: Database Migration

Create `ai_coach_usage` table with performance index and RLS policies:

```sql
CREATE TABLE public.ai_coach_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  prompt_text text,
  tokens_estimated integer DEFAULT 0,
  model text DEFAULT 'google/gemini-3-flash-preview'
);

ALTER TABLE public.ai_coach_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.ai_coach_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage"
  ON public.ai_coach_usage FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE INDEX idx_ai_coach_usage_user_date
  ON public.ai_coach_usage(user_id, created_at DESC);
```

## Step 2: Edge Function - `supabase/functions/dividend-coach/index.ts`

- CORS headers
- JWT validation via `getClaims()`
- Create service_role Supabase client
- Count today's usage for user; reject if >= 5 with `{ error: "limit_reached", remaining: 0 }`
- Fetch user's `user_stocks` server-side for portfolio context
- Insert usage row
- Build system prompt with portfolio context injected
- Stream SSE from Lovable AI Gateway (`google/gemini-3-flash-preview`)
- Handle 429/402 errors from gateway

## Step 3: Update `supabase/config.toml`

Add:
```toml
[functions.dividend-coach]
verify_jwt = false
```

## Step 4: Create `src/components/DividendCoach.tsx`

Single-file component containing:

**State**: messages array, isLoading, isOpen, remainingQuestions (default 5), portfolioSummary

**On mount effects**:
- Fetch today's usage count from `ai_coach_usage`
- Fetch portfolio summary (stock count + avg yield) from `user_stocks`

**Floating button**: Fixed bottom-6 right-6, z-50, Sparkles icon + "AI Coach", pulse animation, only shown when authenticated

**Chat panel** (~400x520px, full-width on mobile):
- Header: title, portfolio summary, remaining badge (X/5), close button
- Welcome message with Bot icon, personalized greeting, portfolio stats
- 4 quick action buttons (context-aware based on portfolio presence)
- Message bubbles with avatars (User/Bot icons)
- Typing indicator (animated dots)
- SSE streaming with line-by-line parsing for token-by-token rendering
- Input bar disabled while loading
- Limit reached state replacing input with upgrade CTA to /pricing
- Error handling with specific messages for 429, 401, generic errors

**Quick action buttons**:
- With portfolio: FIRE Timeline, Portfolio Analysis, Get Recommendations, Safety Check
- Without portfolio: FIRE Number, SCHD vs JEPI, Growth vs Yield, Retire at 55

## Step 5: Update `src/App.tsx`

Import and render `<DividendCoach />` inside `AuthProvider` but outside `Routes`.

## File Summary

| File | Action |
|------|--------|
| Database migration (ai_coach_usage + index + RLS) | Create |
| `supabase/functions/dividend-coach/index.ts` | Create |
| `supabase/config.toml` | Edit (add function entry) |
| `src/components/DividendCoach.tsx` | Create |
| `src/App.tsx` | Edit (add DividendCoach) |

