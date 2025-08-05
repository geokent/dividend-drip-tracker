import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "lucide-react";

interface PlaidLinkButtonProps {
  onSuccess?: () => void;
}

export const PlaidLinkButton = ({ onSuccess }: PlaidLinkButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
        // For now, just show the token was created successfully
        // We'll implement the actual Plaid Link flow in the next step
        toast({
          title: "Link Token Created",
          description: "Ready to connect your bank account",
        });
        
        if (onSuccess) {
          onSuccess();
        }
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
      disabled={isLoading}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <Link className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Link Bank Account"}
    </Button>
  );
};