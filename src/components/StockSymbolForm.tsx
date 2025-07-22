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
      console.log('Calling edge function with symbol:', symbol.trim().toUpperCase());
      
      const { data, error } = await supabase.functions.invoke('get-dividend-data', {
        body: { symbol: symbol.trim().toUpperCase() }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Stock data received:', data);
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
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 justify-center">
          <span className="text-sm font-semibold text-foreground">Add Stock to Track:</span>
          <Input
            type="text"
            placeholder="AAPL"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={loading}
            className="w-16 h-8 text-center text-xs px-2"
            maxLength={5}
          />
          <Button type="submit" disabled={loading || !symbol.trim()} size="sm" className="h-8 px-3">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Search className="h-3 w-3" />
            )}
            <span className="ml-1 text-xs">{loading ? 'Searching...' : 'Search'}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};