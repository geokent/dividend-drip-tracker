-- Add reconciliation metadata column to track merge history
ALTER TABLE public.user_stocks 
ADD COLUMN reconciliation_metadata JSONB DEFAULT NULL;

-- Add index for better performance on reconciliation queries
CREATE INDEX idx_user_stocks_symbol_user_id ON public.user_stocks(symbol, user_id);

-- Create function to update reconciliation metadata
CREATE OR REPLACE FUNCTION public.update_reconciliation_metadata(
  p_user_id UUID,
  p_symbol TEXT,
  p_reconciliation_type TEXT,
  p_previous_source TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_stocks 
  SET reconciliation_metadata = COALESCE(reconciliation_metadata, '{}'::jsonb) || 
    jsonb_build_object(
      'reconciled_at', now(),
      'reconciliation_type', p_reconciliation_type,
      'previous_source', p_previous_source
    )
  WHERE user_id = p_user_id AND symbol = p_symbol;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;