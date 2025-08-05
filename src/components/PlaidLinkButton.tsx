import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
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
    onExit: (err, metadata) => {
      console.log('Plaid Link Exit:', { err, metadata });
      setLinkToken(null);
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link Event:', { eventName, metadata });
    },
  });

  const handleLinkAccount = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to link your account",
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

  // Open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <Button
      onClick={handleLinkAccount}
      disabled={isLoading || !ready}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <Link className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Link Bank Account"}
    </Button>
  );
};