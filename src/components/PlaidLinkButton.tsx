import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load Plaid Link script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch link token on component mount
  useEffect(() => {
    const generateToken = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase.functions.invoke('plaid-link', {
          body: { user_id: user.id }
        });

        if (error) {
          throw error;
        }

        if (data?.link_token) {
          setLinkToken(data.link_token);
        }
      } catch (error) {
        console.error('Error creating link token:', error);
        toast({
          title: "Connection Failed",
          description: "Unable to prepare bank connection. Please try again.",
          variant: "destructive"
        });
      }
    };

    generateToken();
  }, [user?.id, toast]);

  const handlePlaidLink = useCallback(() => {
    if (!linkToken || isLoading) return;

    setIsLoading(true);

    const handler = (window as any).Plaid.create({
      token: linkToken,
      onSuccess: async (public_token: string, metadata: any) => {
        console.log('Plaid Link Success:', { public_token, metadata });
        
        try {
          const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
            body: { public_token, metadata }
          });

          if (error) {
            throw error;
          }

          toast({
            title: "Account Linked Successfully",
            description: `Connected ${data.accounts} account(s) from your brokerage`,
          });
          
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error('Token exchange error:', error);
          toast({
            title: "Connection Error", 
            description: "Failed to complete account linking. Please try again.",
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
      },
      onExit: (err: any, metadata: any) => {
        console.log('Plaid Link Exit:', { err, metadata });
        if (err) {
          toast({
            title: "Connection Cancelled",
            description: "Bank account connection was cancelled",
            variant: "destructive"
          });
        }
        setIsLoading(false);
      },
    });

    handler.open();
  }, [linkToken, isLoading, toast, onSuccess]);

  if (!user?.id) {
    return (
      <Button
        disabled
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Link className="h-4 w-4" />
        Sign in to Link Account
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePlaidLink}
      disabled={!linkToken || isLoading}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <Link className="h-4 w-4" />
      {!linkToken || isLoading ? "Loading..." : "Link Account"}
    </Button>
  );
};