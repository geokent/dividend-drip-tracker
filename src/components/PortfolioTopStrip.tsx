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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="metric-card">
        <p className="metric-label">Total Value</p>
        <p className="metric-value mt-2">{formatCurrency(totalValue)}</p>
      </div>
      <div className="metric-card">
        <p className="metric-label">Total Yield</p>
        <p className="metric-value mt-2">{totalYield.toFixed(2)}%</p>
      </div>
      <div className="metric-card">
        <p className="metric-label">Monthly Dividends</p>
        <p className="metric-value mt-2">{formatCurrency(totalMonthlyDividends)}</p>
      </div>
      <div className="metric-card">
        <p className="metric-label">Annual Dividends</p>
        <p className="metric-value mt-2">{formatCurrency(totalAnnualDividends)}</p>
      </div>
    </div>
  );
};