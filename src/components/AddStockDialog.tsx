import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';

interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number | null;
  dividendYield: number | null;
  dividendPerShare: number | null;
  annualDividend: number | null;
  exDividendDate: string | null;
  dividendDate: string | null;
  nextExDividendDate: string | null;
  dividendFrequency: string | null;
  sector: string | null;
  industry: string | null;
  marketCap: string | null;
  peRatio: string | null;
}

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockData: StockData | null;
  onConfirm: (stockData: StockData, shares: number) => void;
  loading?: boolean;
}

export const AddStockDialog = ({ 
  open, 
  onOpenChange, 
  stockData, 
  onConfirm,
  loading = false 
}: AddStockDialogProps) => {
  const [shares, setShares] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleConfirm = () => {
    const sharesNum = parseFloat(shares);
    
    if (!shares.trim()) {
      setError('Please enter the number of shares');
      return;
    }
    
    if (isNaN(sharesNum) || sharesNum < 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (stockData) {
      onConfirm(stockData, sharesNum);
      setShares('');
      setError('');
    }
  };

  const handleCancel = () => {
    setShares('');
    setError('');
    onOpenChange(false);
  };

  const totalValue = stockData?.currentPrice && shares ? 
    (parseFloat(shares) * stockData.currentPrice).toFixed(2) : '0.00';
  
  const estimatedAnnualIncome = stockData?.annualDividend && shares ? 
    (parseFloat(shares) * stockData.annualDividend).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Enter the number of shares you own for {stockData?.symbol}
          </DialogDescription>
        </DialogHeader>
        
        {stockData && (
          <div className="space-y-4 py-4">
            {/* Stock Information */}
            <div className="metric-card space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{stockData.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stockData.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${stockData.currentPrice?.toFixed(2) || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Dividend Yield</p>
                  <p className="font-medium">{stockData.dividendYield?.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annual Dividend</p>
                  <p className="font-medium">${stockData.annualDividend?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Shares Input */}
            <div className="space-y-2">
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                placeholder="0"
                value={shares}
                onChange={(e) => {
                  setShares(e.target.value);
                  setError('');
                }}
                min="0"
                step="0.01"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Calculated Values */}
            {shares && parseFloat(shares) > 0 && (
              <div className="metric-card space-y-2 bg-accent/50">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Investment Value</span>
                  <span className="font-semibold">${totalValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Est. Annual Dividend Income</span>
                  <span className="font-semibold text-primary">${estimatedAnnualIncome}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Stock'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
