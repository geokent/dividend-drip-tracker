import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, Building } from "lucide-react";

interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number | null;
  dividendYield: number | null;
  dividendPerShare: number | null;
  annualDividend: number | null;
  exDividendDate: string | null;
  dividendDate: string | null;
  sector: string | null;
  industry: string | null;
  marketCap: string | null;
  peRatio: string | null;
}

interface TrackedStock extends StockData {
  shares: number;
}

interface DividendPortfolioChartProps {
  trackedStocks: TrackedStock[];
  onRemoveStock: (symbol: string) => void;
  onUpdateShares: (symbol: string, shares: number) => void;
}

export const DividendPortfolioChart = ({ 
  trackedStocks, 
  onRemoveStock, 
  onUpdateShares 
}: DividendPortfolioChartProps) => {
  const [editingShares, setEditingShares] = useState<string | null>(null);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number | null) => {
    if (percentage === null) return "N/A";
    return `${percentage.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap: string | null) => {
    if (!marketCap) return "N/A";
    const num = parseFloat(marketCap);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return formatCurrency(num);
  };

  const calculatePortfolioValue = (stock: TrackedStock) => {
    if (!stock.currentPrice || stock.shares === 0) return 0;
    return stock.currentPrice * stock.shares;
  };

  const calculateAnnualIncome = (stock: TrackedStock) => {
    if (!stock.annualDividend || stock.shares === 0) return 0;
    return stock.annualDividend * stock.shares;
  };

  const totalPortfolioValue = trackedStocks.reduce((sum, stock) => sum + calculatePortfolioValue(stock), 0);
  const maxPortfolioValue = Math.max(...trackedStocks.map(calculatePortfolioValue));

  const handleSharesChange = (symbol: string, value: string) => {
    const shares = parseFloat(value) || 0;
    onUpdateShares(symbol, shares);
    setEditingShares(null);
  };

  if (trackedStocks.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Stocks Tracked Yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first dividend stock above to start building your portfolio visualization
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Portfolio Overview */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPortfolioValue)}</p>
            <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-accent">
              {formatCurrency(trackedStocks.reduce((sum, stock) => sum + calculateAnnualIncome(stock), 0))}
            </p>
            <p className="text-xs text-muted-foreground">Annual Dividend Income</p>
          </div>
        </div>
      </Card>

      {/* Stock Holdings Chart */}
      <div className="grid gap-4">
        {trackedStocks
          .sort((a, b) => calculatePortfolioValue(b) - calculatePortfolioValue(a))
          .map((stock) => {
            const portfolioValue = calculatePortfolioValue(stock);
            const annualIncome = calculateAnnualIncome(stock);
            const portfolioPercentage = totalPortfolioValue > 0 ? (portfolioValue / totalPortfolioValue) * 100 : 0;
            const valueProgress = maxPortfolioValue > 0 ? (portfolioValue / maxPortfolioValue) * 100 : 0;

            return (
              <Card key={stock.symbol} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                <div className="flex items-center justify-between">
                  {/* Left section - Primary stock identification */}
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-lg font-bold px-3 py-1 min-w-20 justify-center bg-primary/5">
                        {stock.symbol}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground leading-tight">
                          {stock.companyName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(stock.currentPrice)} per share
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center section - Financial metrics with visual separation */}
                  <div className="flex items-center gap-12">
                    {/* Holdings group */}
                    <div className="flex items-center gap-6 px-4 py-2 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Shares</p>
                        {editingShares === stock.symbol ? (
                          <Input
                            type="number"
                            defaultValue={stock.shares}
                            className="h-8 w-20 text-sm text-center font-medium"
                            onBlur={(e) => handleSharesChange(stock.symbol, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSharesChange(stock.symbol, e.currentTarget.value);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <p 
                            className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setEditingShares(stock.symbol)}
                          >
                            {stock.shares.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Value</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(portfolioValue)}</p>
                      </div>
                    </div>

                    {/* Dividend group */}
                    <div className="flex items-center gap-6 px-4 py-2 bg-accent/10 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Yield</p>
                        <p className="text-lg font-semibold text-accent">
                          {formatPercentage(stock.dividendYield)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Annual Income</p>
                        <p className="text-lg font-bold text-accent">{formatCurrency(annualIncome)}</p>
                      </div>
                    </div>

                    {/* Dates group */}
                    <div className="flex items-center gap-6 px-4 py-2 bg-secondary/20 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Ex-Dividend</p>
                        <p className="text-sm font-medium">
                          {stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          }) : "N/A"}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Last Dividend</p>
                        <p className="text-sm font-medium">
                          {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          }) : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right section - Actions */}
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStock(stock.symbol)}
                      className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};