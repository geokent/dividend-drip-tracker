import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard } from 'lucide-react';

interface CustomPlaidLinkButtonProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void;
        exit: () => void;
      };
    };
  }
}

export const CustomPlaidLinkButton = ({ onSuccess }: CustomPlaidLinkButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [plaidLoaded, setPlaidLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Plaid script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => setPlaidLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const createLinkToken = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('plaid-link-token', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;
      return data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initialize bank connection. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleConnect = async () => {
    if (!plaidLoaded) {
      toast({
        title: "Loading...",
        description: "Plaid is still loading, please wait a moment.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const linkToken = await createLinkToken();
      if (!linkToken) {
        setLoading(false);
        return;
      }

      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (public_token: string) => {
          try {
            const { data: session } = await supabase.auth.getSession();
            if (!session?.session?.access_token) {
              throw new Error('Not authenticated');
            }

            const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
              body: { public_token },
              headers: {
                Authorization: `Bearer ${session.session.access_token}`,
              },
            });

            if (error) throw error;

            toast({
              title: "Account Connected",
              description: `Successfully connected ${data.accounts?.length || 0} account(s)`,
            });

            onSuccess?.();
          } catch (error) {
            console.error('Error exchanging token:', error);
            toast({
              title: "Connection Failed",
              description: "Failed to connect your account. Please try again.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        onExit: (err: any) => {
          if (err) {
            console.error('Plaid Link error:', err);
            toast({
              title: "Connection Cancelled",
              description: "Account connection was cancelled.",
              variant: "destructive",
            });
          }
          setLoading(false);
        },
      });

      handler.open();
    } catch (error) {
      console.error('Error opening Plaid Link:', error);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      disabled={loading || !plaidLoaded}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Connecting...' : !plaidLoaded ? 'Loading...' : 'Link Brokerage Account'}
    </Button>
  );
};