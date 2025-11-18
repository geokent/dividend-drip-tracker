import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';

export const FIRECalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>('');
  const [currentSavings, setCurrentSavings] = useState<string>('');
  const [monthlySavings, setMonthlySavings] = useState<string>('');
  const [expectedReturn, setExpectedReturn] = useState<string>('7');

  const calculateFIRE = () => {
    const expenses = parseFloat(monthlyExpenses);
    const savings = parseFloat(currentSavings);
    const monthly = parseFloat(monthlySavings);
    const returnRate = parseFloat(expectedReturn) / 100;
    
    if (expenses > 0 && returnRate > 0) {
      // Using the 4% rule: need 25x annual expenses
      const annualExpenses = expenses * 12;
      const fireNumber = annualExpenses * 25;
      const remainingNeeded = Math.max(0, fireNumber - savings);
      
      // Calculate years to FIRE with monthly contributions
      let yearsToFIRE = 0;
      if (remainingNeeded > 0 && monthly > 0) {
        let currentValue = savings;
        const monthlyReturn = returnRate / 12;
        
        while (currentValue < fireNumber && yearsToFIRE < 100) {
          currentValue = currentValue * (1 + monthlyReturn) + monthly;
          yearsToFIRE += 1/12;
        }
      }
      
      return {
        fireNumber: fireNumber.toFixed(0),
        remainingNeeded: remainingNeeded.toFixed(0),
        yearsToFIRE: yearsToFIRE > 0 && yearsToFIRE < 100 ? yearsToFIRE.toFixed(1) : null,
        monthlyDividendIncome: (fireNumber * (returnRate / 12)).toFixed(0),
        safeWithdrawal: (fireNumber * 0.04 / 12).toFixed(0)
      };
    }
    return null;
  };

  const results = calculateFIRE();

  return (
    <Card className="hover:shadow-hover transition-smooth">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>FIRE Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate your Financial Independence Retire Early number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="expenses">Monthly Expenses ($)</Label>
            <Input
              id="expenses"
              type="number"
              placeholder="e.g., 4000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              step="100"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current">Current Savings ($)</Label>
            <Input
              id="current"
              type="number"
              placeholder="e.g., 50000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              step="1000"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly-save">Monthly Savings ($)</Label>
            <Input
              id="monthly-save"
              type="number"
              placeholder="e.g., 2000"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(e.target.value)}
              step="100"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="return">Expected Annual Return (%)</Label>
            <Input
              id="return"
              type="number"
              placeholder="e.g., 7"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              step="0.5"
              min="0"
              max="20"
            />
          </div>
        </div>

        {results && (
          <div className="space-y-3 pt-4 border-t">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Your FIRE Number</p>
              <p className="text-3xl font-bold gradient-text">${parseFloat(results.fireNumber).toLocaleString()}</p>
            </div>
            
            {results.yearsToFIRE && (
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Years to FIRE</p>
                <p className="text-2xl font-bold text-primary">{results.yearsToFIRE} years</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Still Need to Save</p>
                <p className="text-lg font-semibold text-foreground">${parseFloat(results.remainingNeeded).toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Safe Monthly Withdrawal (4% Rule)</p>
                <p className="text-lg font-semibold text-primary">${parseFloat(results.safeWithdrawal).toLocaleString()}</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              Based on the 4% safe withdrawal rule. Your FIRE number is 25x your annual expenses.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
