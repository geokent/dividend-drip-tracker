import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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

  const onPlaidSuccess = useCallback((public_token: string, metadata: any) => {
    console.log('Plaid Link Success:', { public_token, metadata });
    
    // TODO: Exchange public_token for access_token on the backend
    // For now, just show success message
    toast({
      title: "Account Linked Successfully",
      description: "Your bank account has been connected",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  }, [toast, onSuccess]);

  const onPlaidExit = useCallback((err: any, metadata: any) => {
    console.log('Plaid Link Exit:', { err, metadata });
    if (err) {
      toast({
        title: "Connection Cancelled",
        description: "Bank account connection was cancelled",
        variant: "destructive"
      });
    }
  }, [toast]);

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  };

  const { open, ready } = usePlaidLink(config);

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
      onClick={() => open()}
      disabled={!ready || !linkToken}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <Link className="h-4 w-4" />
      {!ready || !linkToken ? "Loading..." : "Link Bank Account"}
    </Button>
  );
};