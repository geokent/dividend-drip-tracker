import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link } from 'lucide-react';

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: (connectionData?: { accounts_connected?: number, institution_name?: string }) => void;
  disabled?: boolean;
  limitMessage?: string;
  size?: "default" | "sm" | "lg";
  isConnected?: boolean;
  connectedItemId?: string;
  onDisconnect?: () => void;
  hasInactiveAccounts?: boolean;
}

export const PlaidLinkButton = ({ userId, onSuccess, disabled = false, limitMessage, size = "default", isConnected = false, connectedItemId, onDisconnect, hasInactiveAccounts = false }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const { open, ready, error } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      setIsLoading(true);
      toast.loading('Finalizing your account connection...', { id: 'plaid-exchange' });
      
      try {
        console.log('Plaid Link successful, exchanging token...');
        
        const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
          body: {
            public_token: public_token,
            user_id: userId
          }
        });

        if (error) {
          console.error('Token exchange error:', error);
          toast.error('Account connection failed during final setup. Please try reconnecting.', { id: 'plaid-exchange' });
          return;
        }

        console.log('Token exchange successful:', data);
        toast.success('🎉 Investment account successfully connected!', { id: 'plaid-exchange' });
        
        // Clear token and reset state to prevent loop
        setLinkToken(null);
        setHasOpened(false);
        
        // Pass connection data to parent
        onSuccess?.({
          accounts_connected: data?.accounts_connected || 1,
          institution_name: data?.institution_name || 'your bank'
        });
      } catch (error) {
        console.error('Error exchanging token:', error);
        toast.error('Connection setup incomplete. Please try connecting again.', { id: 'plaid-exchange' });
      } finally {
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Bank connection interrupted. Please try again if you want to connect your account.');
      } else {
        console.log('Plaid Link exited:', metadata);
        if (metadata.status !== 'connected') {
          toast.info('Connection cancelled. You can try connecting again anytime.');
        }
      }
      
      // Clear token and reset state to prevent loop
      setLinkToken(null);
      setHasOpened(false);
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', eventName, metadata);
    },
  });

  // Log Plaid Link state for debugging
  console.log('Plaid Link state:', { 
    linkToken: linkToken ? 'SET' : 'NOT_SET', 
    ready, 
    error: error ? error.message : 'NONE',
    isLoading 
  });

  // Auto-open when token is set and ready (but only once)
  useEffect(() => {
    if (linkToken && ready && !isLoading && !hasOpened) {
      console.log('Auto-opening Plaid Link...');
      setHasOpened(true);
      open();
    }
  }, [linkToken, ready, open, isLoading, hasOpened]);

  // Handle Plaid Link errors
  useEffect(() => {
    if (error) {
      console.error('Plaid Link initialization error:', error);
      toast.error(`Plaid Link error: ${error.message}`);
      setIsLoading(false);
    }
  }, [error]);

  const createLinkToken = async () => {
    setIsLoading(true);
    toast.loading('Preparing connection to your bank...', { id: 'plaid-init' });
    
    try {
      console.log('Creating link token for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Link token creation error:', error);
        
        // Try to extract the actual error message from the edge function response
        let errorMessage = 'Failed to initialize bank connection. Please try again.';
        
        try {
          // For FunctionsHttpError, check the context for response body
          if (error.context?.response) {
            const responseBody = await error.context.response.json();
            if (responseBody?.error === 'Free tier limit reached' || 
                responseBody?.message?.includes('one institution') ||
                responseBody?.error?.includes('Free tier')) {
              errorMessage = 'Free tier allows only one connected institution. Please disconnect your current institution first.';
            }
          }
        } catch (parseError) {
          // Fallback to checking error message string or status code
          if (error.message?.includes('Free tier limit reached') || 
              error.message?.includes('403') ||
              error.message?.includes('one institution')) {
            errorMessage = 'Free tier allows only one connected institution. Please disconnect your current institution first.';
          }
        }
        
        toast.error(errorMessage, { id: 'plaid-init' });
        return;
      }

      console.log('Link token created successfully');
      toast.success('Ready to connect! Opening bank selection...', { id: 'plaid-init' });
      setLinkToken(data.link_token);
    } catch (error: any) {
      console.error('Error creating link token:', error);
      
      // Check if this is a tier limit error
      const errorStr = error?.message || error?.toString() || '';
      if (errorStr.includes('Free tier') || errorStr.includes('one institution')) {
        toast.error('Free tier allows only one connected institution. Please disconnect your current institution first.', { id: 'plaid-init' });
      } else {
        toast.error('Connection setup failed. Please check your internet and try again.', { id: 'plaid-init' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (!connectedItemId) {
      console.error('Missing connectedItemId - cannot disconnect account');
      toast.error('Unable to disconnect: Missing account information. Please refresh the page and try again.');
      return;
    }
    
    // Call the onDisconnect callback - let parent handle the actual disconnection
    onDisconnect?.();
  };

  const handleClick = () => {
    if (isConnected) {
      handleDisconnect();
    } else {
      if (disabled) {
        if (limitMessage) {
          toast.info(limitMessage);
        }
        return;
      }
      
      if (linkToken && ready) {
        open();
      } else {
        createLinkToken();
      }
    }
  };

  const getButtonVariant = () => {
    if (disabled) return "secondary";
    if (isConnected) return "destructive";
    return "default";
  };

  const getButtonText = () => {
    if (isLoading) {
      return isConnected ? 'Disconnecting...' : hasInactiveAccounts ? 'Reconnecting...' : 'Connecting...';
    }
    if (disabled) return 'Account Limit Reached';
    if (isConnected) return 'Unlink Account';
    if (hasInactiveAccounts) return 'Reconnect Account';
    return 'Connect Account';
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || disabled}
      variant={getButtonVariant()}
      size={size}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Link className="h-4 w-4" />
      )}
      {getButtonText()}
    </Button>
  );
};