import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp } from 'lucide-react';

export const DividendYieldCalculator = () => {
  const [stockPrice, setStockPrice] = useState<string>('');
  const [annualDividend, setAnnualDividend] = useState<string>('');

  const calculateYield = () => {
    const price = parseFloat(stockPrice);
    const dividend = parseFloat(annualDividend);
    
    if (price && dividend && price > 0) {
      return ((dividend / price) * 100).toFixed(2);
    }
    return null;
  };

  const calculateAnnualIncome = (shares: number) => {
    const dividend = parseFloat(annualDividend);
    if (dividend && shares > 0) {
      return (dividend * shares).toFixed(2);
    }
    return null;
  };

  const yieldPercentage = calculateYield();
  const income100 = calculateAnnualIncome(100);
  const income1000 = calculateAnnualIncome(1000);

  return (
    <Card className="hover:shadow-hover transition-smooth">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Dividend Yield Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate the dividend yield and potential income from any stock
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock-price">Stock Price ($)</Label>
            <Input
              id="stock-price"
              type="number"
              placeholder="e.g., 150.00"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="annual-dividend">Annual Dividend per Share ($)</Label>
            <Input
              id="annual-dividend"
              type="number"
              placeholder="e.g., 6.00"
              value={annualDividend}
              onChange={(e) => setAnnualDividend(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {yieldPercentage && (
          <div className="space-y-4 pt-4 border-t">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Dividend Yield</p>
              <p className="text-3xl font-bold gradient-text">{yieldPercentage}%</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Annual Income Projections:</p>
              <div className="grid grid-cols-2 gap-3">
                {income100 && (
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">100 shares</p>
                    <p className="text-lg font-semibold text-foreground">${income100}</p>
                  </div>
                )}
                {income1000 && (
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">1,000 shares</p>
                    <p className="text-lg font-semibold text-foreground">${income1000}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
