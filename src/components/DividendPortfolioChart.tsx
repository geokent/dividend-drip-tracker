import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Trash2, TrendingUp } from "lucide-react";

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
  onUpdateShares,
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

  const abbreviateCompanyName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  const calculatePortfolioValue = (stock: TrackedStock) => {
    if (!stock.currentPrice || stock.shares === 0) return 0;
    return stock.currentPrice * stock.shares;
  };

  const calculateAnnualIncome = (stock: TrackedStock) => {
    if (stock.shares === 0) return 0;
    // Use annualDividend if available, otherwise derive from yield and price
    if (stock.annualDividend) {
      return stock.annualDividend * stock.shares;
    } else if (stock.dividendYield && stock.currentPrice) {
      const annualDividend = (stock.dividendYield / 100) * stock.currentPrice;
      return annualDividend * stock.shares;
    }
    return 0;
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
    <TooltipProvider>
      <div className="space-y-3">
        {trackedStocks
          .sort((a, b) => calculatePortfolioValue(b) - calculatePortfolioValue(a))
          .map((stock) => {
            const portfolioValue = calculatePortfolioValue(stock);
            const annualIncome = calculateAnnualIncome(stock);
            const monthlyIncome = annualIncome / 12;
            const portfolioPercentage = totalPortfolioValue > 0 ? (portfolioValue / totalPortfolioValue) * 100 : 0;
            const valueProgress = maxPortfolioValue > 0 ? (portfolioValue / maxPortfolioValue) * 100 : 0;

            return (
              <Card key={stock.symbol} className="p-4 hover:shadow-md transition-all duration-200 border border-border/50">
                {/* Mobile Layout */}
                <div className="block lg:hidden space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-foreground">{stock.symbol}</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                     {/* Shares */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Shares</p>
                      {editingShares === stock.symbol ? (
                        <Input
                          type="number"
                          defaultValue={stock.shares}
                          className="h-8 text-sm text-center"
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
                    </div>

                     {/* Price */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Price</p>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(stock.currentPrice)}</p>
                    </div>

                     {/* Value */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Value</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
                    </div>

                     {/* Yield */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Yield</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercentage(stock.dividendYield)}
                      </p>
                    </div>

                     {/* Monthly Income */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Monthly</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(monthlyIncome)}</p>
                    </div>

                     {/* Annual Income */}
                     <div className="text-center">
                       <p className="text-xs text-primary font-medium mb-1">Annual</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(annualIncome)}</p>
                    </div>
                 </div>

                  {/* Bottom Row: Dates and Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="text-left">
                      <p className="text-xs text-primary font-medium mb-1">Ex-Div / Last Div</p>
                      <p className="text-xs text-muted-foreground">
                        {stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : "N/A"} / {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : "N/A"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStock(stock.symbol)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                  {/* Stock identification - 2 columns */}
                  <div className="col-span-2 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-foreground">{stock.symbol}</span>
                    </div>
                  </div>

                  {/* Shares - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Shares</p>
                   {editingShares === stock.symbol ? (
                     <Input
                       type="number"
                       defaultValue={stock.shares}
                       className="h-8 text-sm text-center"
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
                 </div>

                  {/* Price - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Price</p>
                   <p className="text-sm font-semibold text-foreground">{formatCurrency(stock.currentPrice)}</p>
                 </div>

                  {/* Value - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Value</p>
                   <p className="text-sm font-bold text-foreground">{formatCurrency(portfolioValue)}</p>
                 </div>

                  {/* Yield - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Yield</p>
                   <p className="text-sm font-semibold text-foreground">
                     {formatPercentage(stock.dividendYield)}
                   </p>
                 </div>

                  {/* Monthly Income - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Monthly</p>
                   <p className="text-sm font-bold text-foreground">{formatCurrency(monthlyIncome)}</p>
                 </div>

                  {/* Annual Income - 1 column */}
                  <div className="col-span-1 text-center">
                    <p className="text-xs text-primary font-medium mb-1">Annual</p>
                   <p className="text-sm font-bold text-foreground">{formatCurrency(annualIncome)}</p>
                 </div>

                  {/* Ex-Dividend Date with Action - 3 columns */}
                  <div className="col-span-3 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-primary font-medium mb-1">Ex-Div / Last Div</p>
                      <p className="text-xs text-muted-foreground">
                        {stock.exDividendDate ? new Date(stock.exDividendDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : "N/A"} / {stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : "N/A"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStock(stock.symbol)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </TooltipProvider>
  );
};