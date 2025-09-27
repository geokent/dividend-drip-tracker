import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface StaleDataCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staleAccounts: Array<{
    item_id: string;
    institution_name: string;
    account_count: number;
    last_sync: string;
    affected_stocks: string[];
  }>;
  onCleanupComplete: () => void;
}

export const StaleDataCleanupDialog = ({ 
  open, 
  onOpenChange, 
  staleAccounts, 
  onCleanupComplete 
}: StaleDataCleanupDialogProps) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleCleanup = async () => {
    if (staleAccounts.length === 0) return;

    setIsRemoving(true);
    toast.loading('Removing stale data...', { id: 'cleanup-stale' });

    try {
      // Remove stocks associated with stale accounts
      for (const account of staleAccounts) {
        const { error: stocksError } = await supabase
          .from('user_stocks')
          .delete()
          .eq('plaid_item_id', account.item_id);

        if (stocksError) {
          console.error(`Error removing stocks for ${account.institution_name}:`, stocksError);
          toast.error(`Failed to remove stocks for ${account.institution_name}`, { id: 'cleanup-stale' });
          return;
        }

        // Mark plaid accounts as inactive
        const { error: accountError } = await supabase
          .from('plaid_accounts')
          .update({ is_active: false })
          .eq('item_id', account.item_id);

        if (accountError) {
          console.error(`Error deactivating accounts for ${account.institution_name}:`, accountError);
        }
      }

      toast.success('Stale data successfully removed', { id: 'cleanup-stale' });
      onCleanupComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error('Failed to clean up stale data', { id: 'cleanup-stale' });
    } finally {
      setIsRemoving(false);
    }
  };

  const totalAffectedStocks = staleAccounts.reduce((sum, account) => sum + account.affected_stocks.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Clean Up Stale Data
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              The following accounts have been disconnected for more than 30 days. 
              Their stock data may be outdated and no longer accurate.
            </p>
            
            <div className="space-y-2">
              {staleAccounts.map((account) => (
                <div key={account.item_id} className="bg-muted p-3 rounded-md">
                  <div className="font-medium">{account.institution_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Last sync: {new Date(account.last_sync).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {account.affected_stocks.length} stocks affected: {account.affected_stocks.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <p className="text-sm font-medium text-destructive">
                ⚠️ This will permanently remove {totalAffectedStocks} stock{totalAffectedStocks !== 1 ? 's' : ''} from your portfolio.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You can always reconnect your accounts and re-sync your data later.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Keep Data
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={isRemoving}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isRemoving ? 'Removing...' : 'Remove Stale Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};