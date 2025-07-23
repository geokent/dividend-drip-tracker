import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, Building, Lock } from "lucide-react";

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
      {/* Portfolio Metrics with Premium Features */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{formatCurrency(totalPortfolioValue)}</p>
            <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-accent">
              {totalPortfolioValue > 0 ? 
                formatPercentage((trackedStocks.reduce((sum, stock) => {
                  const stockValue = calculatePortfolioValue(stock);
                  return sum + (stockValue * (stock.dividendYield || 0) / 100);
                }, 0) / totalPortfolioValue) * 100) : 
                "0.00%"
              }
            </p>
            <p className="text-xs text-muted-foreground">Weighted Avg Yield</p>
          </div>
          <div className="text-center opacity-60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Premium</p>
            </div>
            <p className="text-xs text-muted-foreground">Yield on Cost</p>
          </div>
          
          {/* Premium Features */}
          <div className="text-center opacity-60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
            </div>
            <p className="text-xs text-muted-foreground">Dividend Growth Rate</p>
          </div>
          <div className="text-center opacity-60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Premium</p>
            </div>
            <p className="text-xs text-muted-foreground">Dividend Safety Score</p>
          </div>
          <div className="text-center opacity-60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Pro Feature</p>
            </div>
            <p className="text-xs text-muted-foreground">Tax Efficiency Score</p>
          </div>
        </div>
      </Card>

      {/* Compact Stock Holdings */}
      <div className="space-y-2">
        {trackedStocks
          .sort((a, b) => calculatePortfolioValue(b) - calculatePortfolioValue(a))
          .map((stock) => {
            const portfolioValue = calculatePortfolioValue(stock);
            const annualIncome = calculateAnnualIncome(stock);
            const portfolioPercentage = totalPortfolioValue > 0 ? (portfolioValue / totalPortfolioValue) * 100 : 0;

            return (
              <Card key={stock.symbol} className="p-3 hover:shadow-md transition-all duration-200 border-l-2 border-l-primary/30">
                <div className="flex items-center justify-between gap-4">
                  {/* Stock Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="font-mono text-sm font-bold px-2 py-1 bg-primary/5 shrink-0">
                      {stock.symbol}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
                        {stock.companyName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stock.currentPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6">
                    {/* Shares */}
                    <div className="text-center">
                      {editingShares === stock.symbol ? (
                        <Input
                          type="number"
                          defaultValue={stock.shares}
                          className="h-6 w-16 text-xs text-center font-medium"
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
                          className="text-sm font-semibold cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setEditingShares(stock.symbol)}
                        >
                          {stock.shares.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>

                    {/* Value */}
                    <div className="text-center">
                      <p className="text-sm font-bold text-primary">{formatCurrency(portfolioValue)}</p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>

                    {/* Yield */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-accent">
                        {formatPercentage(stock.dividendYield)}
                      </p>
                      <p className="text-xs text-muted-foreground">Yield</p>
                    </div>

                    {/* Annual Income */}
                    <div className="text-center">
                      <p className="text-sm font-bold text-accent">{formatCurrency(annualIncome)}</p>
                      <p className="text-xs text-muted-foreground">Annual</p>
                    </div>

                    {/* Ex-Div Date */}
                    <div className="text-center">
                      <p className="text-xs font-medium">
                        {stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Ex-Div</p>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStock(stock.symbol)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
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