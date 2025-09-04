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
    <Card className="shadow-card p-6 mb-8 gradient-secondary">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/30">
        <div className="p-0 text-center">
          <p className="metric-label">Total Value</p>
          <p className="metric-value mt-2">{formatCurrency(totalValue)}</p>
        </div>
        <div className="p-0 text-center pt-6 md:pt-0">
          <p className="metric-label">Total Yield</p>
          <p className="metric-value mt-2">{totalYield.toFixed(2)}%</p>
        </div>
        <div className="p-0 text-center pt-6 md:pt-0">
          <p className="metric-label">Monthly Dividends</p>
          <p className="metric-value mt-2">{formatCurrency(totalMonthlyDividends)}</p>
        </div>
        <div className="p-0 text-center pt-6 md:pt-0">
          <p className="metric-label">Annual Dividends</p>
          <p className="metric-value mt-2">{formatCurrency(totalAnnualDividends)}</p>
        </div>
      </div>
    </Card>
  );
};