import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";

// Declare Plaid global variable
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

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plaidLoaded, setPlaidLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load Plaid script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => setPlaidLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleLinkAccount = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to link your account",
        variant: "destructive"
      });
      return;
    }

    if (!plaidLoaded) {
      toast({
        title: "Loading...",
        description: "Plaid is still loading, please try again",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call our edge function to create a link token
      const { data, error } = await supabase.functions.invoke('plaid-link', {
        body: { user_id: user.id }
      });

      if (error) {
        throw error;
      }

      if (data?.link_token) {
        setLinkToken(data.link_token);
        
        // Create and open Plaid Link
        const handler = window.Plaid.create({
          token: data.link_token,
          onSuccess: (public_token: string, metadata: any) => {
            console.log('Plaid Link Success:', { public_token, metadata });
            toast({
              title: "Account Linked Successfully",
              description: "Your bank account has been connected",
            });
            if (onSuccess) {
              onSuccess();
            }
            // TODO: Send public_token to backend to exchange for access_token
          },
          onExit: (err: any, metadata: any) => {
            console.log('Plaid Link Exit:', { err, metadata });
            setLinkToken(null);
          },
          onEvent: (eventName: string, metadata: any) => {
            console.log('Plaid Link Event:', { eventName, metadata });
          },
        });

        handler.open();
      }
    } catch (error) {
      console.error('Error creating link token:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to your bank account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLinkAccount}
      disabled={isLoading || !plaidLoaded}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <Link className="h-4 w-4" />
      {!plaidLoaded ? "Loading Plaid..." : isLoading ? "Connecting..." : "Link Bank Account"}
    </Button>
  );
};