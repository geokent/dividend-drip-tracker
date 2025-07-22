import { useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard } from 'lucide-react';

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      try {
        setLoading(true);
        
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
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast({
          title: "Connection Cancelled",
          description: "Account connection was cancelled.",
          variant: "destructive",
        });
      }
    },
  });

  const createLinkToken = async () => {
    try {
      setLoading(true);
      
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

      setLinkToken(data.link_token);
      
      // Open Plaid Link after token is created
      setTimeout(() => {
        if (ready) {
          open();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating link token:', error);
      toast({
        title: "Connection Error",
        description: "Failed to initialize bank connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (linkToken && ready) {
      open();
    } else {
      createLinkToken();
    }
  };

  return (
    <Button 
      onClick={handleConnect}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Connecting...' : 'Connect Bank Account'}
    </Button>
  );
};