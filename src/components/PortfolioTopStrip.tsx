import { Card } from "./ui/card";
import { formatCurrency } from "@/lib/utils";

interface PortfolioTopStripProps {
  totalValue: number;
  totalYield: number;
  totalMonthlyDividends: number;
  totalAnnualDividends: number;
}

export const PortfolioTopStrip = ({ totalValue, totalYield, totalMonthlyDividends, totalAnnualDividends }: PortfolioTopStripProps) => {
  return (
    <Card className="p-5 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Value</p>
          <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className="text-center pl-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Yield</p>
          <p className="text-lg font-semibold text-foreground mt-1">{totalYield.toFixed(2)}%</p>
        </div>
        <div className="text-center pl-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Monthly Dividends</p>
          <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalMonthlyDividends)}</p>
        </div>
        <div className="text-center pl-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Annual Dividends</p>
          <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalAnnualDividends)}</p>
        </div>
      </div>
    </Card>
  );
};