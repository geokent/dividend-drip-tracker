import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link } from 'lucide-react';

interface PlaidLinkButtonProps {
  userId: string;
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ userId, onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { open, ready, error } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      setIsLoading(true);
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
          toast.error('Failed to connect account. Please try again.');
          return;
        }

        console.log('Token exchange successful:', data);
        toast.success(data.message || 'Account connected successfully!');
        onSuccess?.();
      } catch (error) {
        console.error('Error exchanging token:', error);
        toast.error('Failed to connect account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Failed to connect account');
      } else {
        console.log('Plaid Link exited:', metadata);
      }
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

  // Auto-open when token is set and ready
  useEffect(() => {
    if (linkToken && ready && !isLoading) {
      console.log('Auto-opening Plaid Link...');
      open();
    }
  }, [linkToken, ready, open, isLoading]);

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
    try {
      console.log('Creating link token for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { user_id: userId }
      });

      if (error) {
        console.error('Link token creation error:', error);
        toast.error('Failed to initialize Plaid Link. Please try again.');
        return;
      }

      console.log('Link token created successfully');
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error('Failed to initialize Plaid Link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (linkToken && ready) {
      open();
    } else {
      createLinkToken();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Link className="h-4 w-4" />
      )}
      {isLoading ? 'Connecting...' : 'Connect Investment Account'}
    </Button>
  );
};