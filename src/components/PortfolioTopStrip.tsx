import { Card } from "./ui/card";
import { formatCurrency } from "@/lib/utils";

interface PortfolioTopStripProps {
  totalValue: number;
  connectedAccounts: number;
}

export const PortfolioTopStrip = ({ totalValue, connectedAccounts }: PortfolioTopStripProps) => {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Connected Accounts</p>
            <p className="text-lg font-semibold text-foreground">{connectedAccounts}</p>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};