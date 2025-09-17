import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AffectedStock {
  symbol: string;
  company_name: string;
  shares: number;
  current_price: number | null;
  annual_dividend: number | null;
  source: string;
}

interface PlaidDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institutionName: string;
  itemId: string;
  affectedStocks: AffectedStock[];
  onConfirmDisconnect: (itemId: string, institutionName: string, cleanupAction: 'keep' | 'remove' | 'convert') => void;
  isDisconnecting?: boolean;
}

export const PlaidDisconnectDialog = ({
  open,
  onOpenChange,
  institutionName,
  itemId,
  affectedStocks,
  onConfirmDisconnect,
  isDisconnecting = false
}: PlaidDisconnectDialogProps) => {
  const [selectedAction, setSelectedAction] = useState<'keep' | 'remove' | 'convert'>('convert');

  const totalValue = affectedStocks.reduce((sum, stock) => 
    sum + (stock.current_price ? stock.current_price * stock.shares : 0), 0
  );
  
  const totalAnnualDividends = affectedStocks.reduce((sum, stock) => 
    sum + (stock.annual_dividend ? stock.annual_dividend * stock.shares : 0), 0
  );

  const handleConfirm = () => {
    onConfirmDisconnect(itemId, institutionName, selectedAction);
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'convert':
        return 'Convert to manual tracking - keeps all stock data but stops automatic syncing';
      case 'remove':
        return 'Remove all stocks from portfolio - permanently deletes all holdings from this account';
      case 'keep':
        return 'Keep as-is - stocks remain unchanged (may cause sync issues)';
      default:
        return '';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Disconnect {institutionName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect your {institutionName} account. You have {affectedStocks.length} stock{affectedStocks.length !== 1 ? 's' : ''} from this account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Impact Summary */}
          {affectedStocks.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Holdings Impact
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Affected stocks:</span>
                  <div className="font-medium">{affectedStocks.length} holdings</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total value:</span>
                  <div className="font-medium">{formatCurrency(totalValue)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Annual dividends:</span>
                  <div className="font-medium">{formatCurrency(totalAnnualDividends)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Affected Stocks List */}
          {affectedStocks.length > 0 && (
            <div className="max-h-32 overflow-y-auto border rounded-lg">
              <div className="grid gap-2 p-3">
                {affectedStocks.map((stock) => (
                  <div key={stock.symbol} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-muted-foreground ml-2">{stock.shares} shares</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      Plaid
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">What should happen to your holdings?</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="cleanup-action"
                  value="convert"
                  checked={selectedAction === 'convert'}
                  onChange={() => setSelectedAction('convert')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Convert to Manual (Recommended)</div>
                  <div className="text-sm text-muted-foreground">
                    {getActionDescription('convert')}
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="cleanup-action"
                  value="keep"
                  checked={selectedAction === 'keep'}
                  onChange={() => setSelectedAction('keep')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Keep Unchanged</div>
                  <div className="text-sm text-muted-foreground">
                    {getActionDescription('keep')}
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="cleanup-action"
                  value="remove"
                  checked={selectedAction === 'remove'}
                  onChange={() => setSelectedAction('remove')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-destructive">Remove All Holdings</div>
                  <div className="text-sm text-muted-foreground">
                    {getActionDescription('remove')}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisconnecting}
            className={selectedAction === 'remove' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};