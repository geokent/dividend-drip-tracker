import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search } from 'lucide-react';

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

interface StockSymbolFormProps {
  onStockFound: (stockData: StockData) => void;
}

export const StockSymbolForm = ({ onStockFound }: StockSymbolFormProps) => {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-dividend-data', {
        body: { symbol: symbol.trim().toUpperCase() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onStockFound(data);
      
      toast({
        title: "Stock Found!",
        description: `Found dividend data for ${data.symbol}`,
      });
      
      setSymbol('');
    } catch (error: any) {
      console.error('Error fetching stock data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch stock data. Please check the symbol and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Add Stock to Track
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !symbol.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};