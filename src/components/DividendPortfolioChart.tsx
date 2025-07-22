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
              <Card key={stock.symbol} className="p-4 hover:shadow-md transition-shadow">
                {/* Single line layout with all information */}
                <div className="flex items-center justify-between">
                  {/* Left section - Stock info */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-sm font-bold min-w-16 justify-center">
                        {stock.symbol}
                      </Badge>
                      <span className="font-medium text-base max-w-40 truncate">{stock.companyName}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Price</p>
                        <p className="font-medium">{formatCurrency(stock.currentPrice)}</p>
                      </div>
                      
                      <div className="text-center min-w-16">
                        <p className="text-muted-foreground text-xs">Shares</p>
                        {editingShares === stock.symbol ? (
                          <Input
                            type="number"
                            defaultValue={stock.shares}
                            className="h-7 w-16 text-xs text-center"
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
                            className="font-medium cursor-pointer hover:text-primary"
                            onClick={() => setEditingShares(stock.symbol)}
                          >
                            {stock.shares.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Value</p>
                        <p className="font-medium text-primary">{formatCurrency(portfolioValue)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Dividend Income</p>
                        <p className="font-medium text-accent">{formatCurrency(annualIncome)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Dividend Yield</p>
                        <p className="font-medium">{formatPercentage(stock.dividendYield)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Ex-Dividend</p>
                        <p className="font-medium text-xs">
                          {stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Last Dividend</p>
                        <p className="font-medium text-xs">
                          {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right section - Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveStock(stock.symbol)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};