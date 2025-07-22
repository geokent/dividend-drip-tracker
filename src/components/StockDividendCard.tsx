import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Calendar, DollarSign, Building2, Trash2 } from 'lucide-react';

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

interface StockDividendCardProps {
  stockData: StockData;
  onRemove: (symbol: string) => void;
  onUpdateShares?: (symbol: string, shares: number) => void;
  shares?: number;
}

export const StockDividendCard = ({ 
  stockData, 
  onRemove, 
  onUpdateShares, 
  shares = 0 
}: StockDividendCardProps) => {
  const [shareCount, setShareCount] = useState(shares);
  const { toast } = useToast();

  const handleSharesUpdate = () => {
    if (shareCount >= 0 && onUpdateShares) {
      onUpdateShares(stockData.symbol, shareCount);
      toast({
        title: "Updated",
        description: `Share count updated for ${stockData.symbol}`,
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatMarketCap = (value: string | null) => {
    if (!value) return 'N/A';
    const num = parseInt(value);
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  const calculateAnnualDividend = () => {
    if (!stockData.annualDividend || shareCount <= 0) return 0;
    return stockData.annualDividend * shareCount;
  };

  const calculateQuarterlyDividend = () => {
    return calculateAnnualDividend() / 4;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {stockData.symbol}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {stockData.companyName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(stockData.symbol)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {stockData.sector && (
            <Badge variant="secondary">{stockData.sector}</Badge>
          )}
          {stockData.industry && (
            <Badge variant="outline">{stockData.industry}</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stock Price and Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="font-semibold">{formatCurrency(stockData.currentPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-semibold">{formatMarketCap(stockData.marketCap)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">P/E Ratio</p>
            <p className="font-semibold">{stockData.peRatio || 'N/A'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Div Yield</p>
            <p className="font-semibold flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {formatPercentage(stockData.dividendYield)}
            </p>
          </div>
        </div>

        {/* Dividend Information */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Dividend Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Annual Dividend/Share</p>
              <p className="font-semibold">{formatCurrency(stockData.annualDividend)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dividend Per Share</p>
              <p className="font-semibold">{formatCurrency(stockData.dividendPerShare)}</p>
            </div>
          </div>

          {(stockData.exDividendDate || stockData.dividendDate) && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold text-sm">Important Dates</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {stockData.exDividendDate && (
                  <div>
                    <span className="text-muted-foreground">Ex-Dividend: </span>
                    <span className="font-medium">{stockData.exDividendDate}</span>
                  </div>
                )}
                {stockData.dividendDate && (
                  <div>
                    <span className="text-muted-foreground">Pay Date: </span>
                    <span className="font-medium">{stockData.dividendDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Share Count Input */}
        <div className="space-y-3">
          <Label htmlFor={`shares-${stockData.symbol}`}>
            Number of Shares You Own
          </Label>
          <div className="flex gap-2">
            <Input
              id={`shares-${stockData.symbol}`}
              type="number"
              min="0"
              step="1"
              value={shareCount}
              onChange={(e) => setShareCount(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="flex-1"
            />
            <Button onClick={handleSharesUpdate} variant="outline">
              Update
            </Button>
          </div>
        </div>

        {/* Projected Dividends */}
        {shareCount > 0 && stockData.annualDividend && (
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-3 text-primary">Your Projected Dividends</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Quarterly</p>
                <p className="font-bold text-lg">{formatCurrency(calculateQuarterlyDividend())}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Annual</p>
                <p className="font-bold text-lg">{formatCurrency(calculateAnnualDividend())}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};