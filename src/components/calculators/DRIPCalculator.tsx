import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Repeat } from 'lucide-react';

export const DRIPCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState<string>('');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('');
  const [dividendYield, setDividendYield] = useState<string>('');
  const [years, setYears] = useState<string>('');

  const calculateDRIP = () => {
    const initial = parseFloat(initialInvestment);
    const monthly = parseFloat(monthlyContribution);
    const yieldRate = parseFloat(dividendYield) / 100;
    const timeYears = parseFloat(years);
    
    if (initial > 0 && yieldRate > 0 && timeYears > 0) {
      let portfolioValue = initial;
      let totalContributions = initial;
      let totalDividends = 0;
      
      for (let month = 1; month <= timeYears * 12; month++) {
        // Add monthly contribution
        if (monthly > 0) {
          portfolioValue += monthly;
          totalContributions += monthly;
        }
        
        // Calculate and reinvest monthly dividend
        const monthlyDividend = portfolioValue * (yieldRate / 12);
        totalDividends += monthlyDividend;
        portfolioValue += monthlyDividend;
      }
      
      return {
        finalValue: portfolioValue.toFixed(2),
        totalContributions: totalContributions.toFixed(2),
        totalDividends: totalDividends.toFixed(2),
        annualIncome: (portfolioValue * yieldRate).toFixed(2)
      };
    }
    return null;
  };

  const results = calculateDRIP();

  return (
    <Card className="hover:shadow-hover transition-smooth">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          <CardTitle>DRIP Calculator</CardTitle>
        </div>
        <CardDescription>
          See how dividend reinvestment grows your wealth over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="initial">Initial Investment ($)</Label>
            <Input
              id="initial"
              type="number"
              placeholder="e.g., 10000"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              step="100"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly">Monthly Contribution ($)</Label>
            <Input
              id="monthly"
              type="number"
              placeholder="e.g., 500"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              step="50"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="yield">Average Dividend Yield (%)</Label>
            <Input
              id="yield"
              type="number"
              placeholder="e.g., 4.0"
              value={dividendYield}
              onChange={(e) => setDividendYield(e.target.value)}
              step="0.1"
              min="0"
              max="20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="years">Investment Period (Years)</Label>
            <Input
              id="years"
              type="number"
              placeholder="e.g., 20"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              step="1"
              min="1"
              max="50"
            />
          </div>
        </div>

        {results && (
          <div className="space-y-3 pt-4 border-t">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Final Portfolio Value</p>
              <p className="text-3xl font-bold gradient-text">${parseFloat(results.finalValue).toLocaleString()}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Your Contributions</p>
                <p className="text-lg font-semibold text-foreground">${parseFloat(results.totalContributions).toLocaleString()}</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Dividends Earned</p>
                <p className="text-lg font-semibold text-primary">${parseFloat(results.totalDividends).toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Annual Income at End</p>
                <p className="text-lg font-semibold text-primary">${parseFloat(results.annualIncome).toLocaleString()}/year</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
