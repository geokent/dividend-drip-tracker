import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building2, User, ArrowRight, Info } from "lucide-react";

interface ReconciliationNotificationProps {
  reconciledStocks: Array<{
    symbol: string;
    previousSource: string;
    currentSource: string;
    reconciledAt: string;
  }>;
  onDismiss?: () => void;
}

export const ReconciliationNotification = ({ 
  reconciledStocks, 
  onDismiss 
}: ReconciliationNotificationProps) => {
  if (reconciledStocks.length === 0) return null;

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">
            Successfully reconciled {reconciledStocks.length} stock{reconciledStocks.length > 1 ? 's' : ''} with your brokerage data:
          </p>
          <div className="space-y-1">
            {reconciledStocks.slice(0, 5).map((stock) => (
              <div key={stock.symbol} className="flex items-center gap-2 text-sm">
                <span className="font-mono font-medium">{stock.symbol}</span>
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Manual
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  Synced
                </Badge>
              </div>
            ))}
            {reconciledStocks.length > 5 && (
              <p className="text-sm text-muted-foreground">
                ...and {reconciledStocks.length - 5} more
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Your manually added stocks now show live data from your connected brokerage account.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};