import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Upload, Link } from 'lucide-react';
import { BulkUploadStocksDialog } from './BulkUploadStocksDialog';
import { PlaidLinkButton } from './PlaidLinkButton';

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

interface StockSymbolFormProps {
  onStockFound: (stockData: StockData) => void;
  userId?: string;
  onBulkUploadSuccess?: () => void;
  onPlaidSuccess?: (connectionData?: { accounts_connected?: number, institution_name?: string }) => void;
  onPlaidDisconnect?: () => void;
  isConnected?: boolean;
  connectedItemId?: string;
  connectedInstitutions?: Array<{item_id: string, institution_name: string, account_count: number}>;
}

export const StockSymbolForm = ({ 
  onStockFound, 
  userId, 
  onBulkUploadSuccess, 
  onPlaidSuccess, 
  onPlaidDisconnect, 
  isConnected = false, 
  connectedItemId, 
  connectedInstitutions = [] 
}: StockSymbolFormProps) => {
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
      <CardHeader>
        <CardTitle className="text-lg">Manage Your Stocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manual Stock Entry */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Add Individual Stock</span>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={loading}
              className="flex-1"
              maxLength={5}
            />
            <Button type="submit" disabled={loading || !symbol.trim()} size="sm">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">{loading ? 'Searching...' : 'Add Stock'}</span>
            </Button>
          </form>
        </div>

        <Separator />

        {/* Bulk Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Bulk Upload from CSV</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Upload multiple stocks at once using a CSV file
            </p>
            {onBulkUploadSuccess && (
              <BulkUploadStocksDialog onSuccess={onBulkUploadSuccess} />
            )}
          </div>
        </div>

        <Separator />

        {/* Investment Account Connection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Connect Investment Account</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Automatically sync your dividend stocks from your brokerage
              </p>
              {isConnected && connectedInstitutions.length > 0 && (
                <p className="text-xs text-green-600">
                  Connected to {connectedInstitutions[0].institution_name}
                </p>
              )}
            </div>
            {userId && onPlaidSuccess && onPlaidDisconnect && (
              <PlaidLinkButton
                userId={userId}
                onSuccess={onPlaidSuccess}
                size="sm"
                isConnected={isConnected}
                connectedItemId={connectedItemId}
                onDisconnect={onPlaidDisconnect}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};