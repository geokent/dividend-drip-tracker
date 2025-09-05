import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const demoStocks = [
  { symbol: 'MSFT', company: 'Microsoft', shares: 50, yield: '0.72%', annualIncome: 166.00 },
  { symbol: 'JNJ', company: 'Johnson & Johnson', shares: 25, yield: '2.93%', annualIncome: 118.00 },
  { symbol: 'KO', company: 'Coca-Cola', shares: 75, yield: '3.07%', annualIncome: 141.00 },
  { symbol: 'PG', company: 'Procter & Gamble', shares: 20, yield: '2.38%', annualIncome: 87.60 },
  { symbol: 'VZ', company: 'Verizon', shares: 60, yield: '6.87%', annualIncome: 158.40 }
];

const totalValue = 32450;
const totalAnnualIncome = demoStocks.reduce((sum, stock) => sum + stock.annualIncome, 0);
const totalYield = (totalAnnualIncome / totalValue) * 100;

export const DemoPortfolio = () => {
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
            </div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Annual Income</p>
            </div>
            <p className="text-2xl font-bold text-green-500">${totalAnnualIncome.toFixed(0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Avg Yield</p>
            </div>
            <p className="text-2xl font-bold text-blue-500">{totalYield.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demoStocks.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stock.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {stock.yield}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stock.company}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{stock.shares} shares</p>
                  <p className="text-sm text-green-500">+${stock.annualIncome}/year</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Monthly Income:</span>
              <span className="text-xl font-bold text-primary">
                ${(totalAnnualIncome / 12).toFixed(0)}/month
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};