import { Card } from "./ui/card";
import { formatCurrency } from "@/lib/utils";
import { Lock } from "lucide-react";

interface TrackedStock {
  symbol: string;
  currentPrice: number | null;
  dividendYield: number | null;
  annualDividend: number | null;
  shares: number;
}

interface PortfolioTopStripProps {
  totalValue: number;
  connectedAccounts: number;
  trackedStocks: TrackedStock[];
}

export const PortfolioTopStrip = ({ totalValue, connectedAccounts, trackedStocks }: PortfolioTopStripProps) => {
  // Calculate portfolio metrics
  const calculateTotalYield = () => {
    if (!trackedStocks.length || totalValue === 0) return 0;
    
    const totalAnnualIncome = trackedStocks.reduce((sum, stock) => {
      if (stock.annualDividend && stock.shares > 0) {
        return sum + (stock.annualDividend * stock.shares);
      } else if (stock.dividendYield && stock.currentPrice && stock.shares > 0) {
        const annualDividend = (stock.dividendYield / 100) * stock.currentPrice;
        return sum + (annualDividend * stock.shares);
      }
      return sum;
    }, 0);
    
    return (totalAnnualIncome / totalValue) * 100;
  };

  const calculateTotalAnnualIncome = () => {
    return trackedStocks.reduce((sum, stock) => {
      if (stock.annualDividend && stock.shares > 0) {
        return sum + (stock.annualDividend * stock.shares);
      } else if (stock.dividendYield && stock.currentPrice && stock.shares > 0) {
        const annualDividend = (stock.dividendYield / 100) * stock.currentPrice;
        return sum + (annualDividend * stock.shares);
      }
      return sum;
    }, 0);
  };

  const totalYield = calculateTotalYield();
  const totalAnnualIncome = calculateTotalAnnualIncome();
  const totalMonthlyIncome = totalAnnualIncome / 12;

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Connected Accounts */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Connected Accounts</p>
          <p className="text-2xl font-bold text-foreground">{connectedAccounts}</p>
        </div>

        {/* Total Value */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Value</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
        </div>

        {/* Total Yield - Coming Soon */}
        <div className="text-center opacity-60">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Total Yield</p>
          </div>
          <p className="text-2xl font-bold text-muted-foreground">{totalYield.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>

        {/* Monthly Income - Coming Soon */}
        <div className="text-center opacity-60">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
          </div>
          <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(totalMonthlyIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>

        {/* Annual Income - Coming Soon */}
        <div className="text-center opacity-60">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Annual Income</p>
          </div>
          <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(totalAnnualIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>
      </div>
    </Card>
  );
};