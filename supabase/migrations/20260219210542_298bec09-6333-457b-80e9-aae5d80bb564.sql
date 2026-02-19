
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
