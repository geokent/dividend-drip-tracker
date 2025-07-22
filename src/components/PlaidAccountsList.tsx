import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Trash2, Building2 } from 'lucide-react';

interface PlaidAccount {
  id: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  mask: string;
  is_active: boolean;
  created_at: string;
}

export const PlaidAccountsList = () => {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('plaid_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch connected accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncDividends = async () => {
    try {
      setSyncing(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('sync-dividends', {
        body: { user_id: session.session.user.id },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: data.message || "Dividends synced successfully",
      });
    } catch (error) {
      console.error('Error syncing dividends:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync dividends. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('plaid_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Disconnected",
        description: "Account has been disconnected successfully",
      });

      fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading accounts...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Accounts</h3>
        <Button 
          onClick={syncDividends}
          disabled={syncing || accounts.length === 0}
          variant="outline"
          size="sm"
        >
          {syncing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sync Dividends
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No accounts connected yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Connect your bank or investment accounts to automatically track dividends
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {account.account_name || 'Unknown Account'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectAccount(account.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {account.account_type}
                      </Badge>
                      <Badge variant="outline">
                        {account.account_subtype}
                      </Badge>
                    </div>
                    {account.mask && (
                      <p className="text-sm text-muted-foreground">
                        ••••{account.mask}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connected {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};