import { useState, useEffect, useRef } from "react";
import { StatsCard } from "./StatsCard";
import { StockSymbolForm } from "./StockSymbolForm";
import { DividendPortfolioChart } from "./DividendPortfolioChart";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Header } from "./Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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

export const DividendDashboard = () => {
  const [trackedStocks, setTrackedStocks] = useState<TrackedStock[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load tracked stocks from database on component mount
  useEffect(() => {
    const loadStocks = async () => {
      if (!user?.id) return;
      
      const { data: stocks, error } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading stocks:', error);
        toast({
          title: "Error",
          description: "Failed to load your stocks",
          variant: "destructive"
        });
        return;
      }

      if (stocks) {
        const formattedStocks = stocks.map(stock => ({
          symbol: stock.symbol,
          companyName: stock.company_name || '',
          currentPrice: stock.current_price,
          dividendYield: stock.dividend_yield,
          dividendPerShare: stock.dividend_per_share,
          annualDividend: stock.annual_dividend,
          exDividendDate: stock.ex_dividend_date,
          dividendDate: stock.dividend_date,
          sector: stock.sector,
          industry: stock.industry,
          marketCap: stock.market_cap?.toString() || null,
          peRatio: stock.pe_ratio?.toString() || null,
          shares: Number(stock.shares) || 0
        }));
        setTrackedStocks(formattedStocks);
        
        // Update last synced timestamp from the latest stock sync
        const latestSync = stocks.reduce((latest, stock) => {
          const stockSync = new Date(stock.last_synced);
          return stockSync > latest ? stockSync : latest;
        }, new Date(0));
        if (latestSync.getTime() > 0) {
          setLastSyncedAt(latestSync);
        }
      }
    };

    loadStocks();

    // Auto-refresh prices every 5 minutes
    if (user?.id) {
      refreshStockPrices(); // Initial refresh
      autoRefreshInterval.current = setInterval(() => {
        refreshStockPrices();
      }, 5 * 60 * 1000); // 5 minutes
    }

    // Cleanup interval on unmount
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [user?.id, toast]);

  const handleStockFound = async (stockData: StockData) => {
    if (!user?.id) return;
    
    const existingIndex = trackedStocks.findIndex(stock => stock.symbol === stockData.symbol);
    
    try {
      if (existingIndex >= 0) {
        // Update existing stock in database
        const { error } = await supabase
          .from('user_stocks')
          .update({
            company_name: stockData.companyName,
            current_price: stockData.currentPrice,
            dividend_yield: stockData.dividendYield,
            dividend_per_share: stockData.dividendPerShare,
            annual_dividend: stockData.annualDividend,
            ex_dividend_date: stockData.exDividendDate,
            dividend_date: stockData.dividendDate,
            sector: stockData.sector,
            industry: stockData.industry,
            market_cap: stockData.marketCap ? parseFloat(stockData.marketCap) : null,
            pe_ratio: stockData.peRatio ? parseFloat(stockData.peRatio) : null,
            last_synced: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('symbol', stockData.symbol);

        if (error) throw error;

        // Update local state
        setTrackedStocks(prev => 
          prev.map((stock, index) => 
            index === existingIndex 
              ? { ...stockData, shares: stock.shares }
              : stock
          )
        );
        setLastSyncedAt(new Date());
        
        toast({
          title: "Stock Updated!",
          description: `Updated dividend data for ${stockData.symbol}`,
        });
      } else {
        // Add new stock to database
        const { error } = await supabase
          .from('user_stocks')
          .insert({
            user_id: user.id,
            symbol: stockData.symbol,
            company_name: stockData.companyName,
            current_price: stockData.currentPrice,
            dividend_yield: stockData.dividendYield,
            dividend_per_share: stockData.dividendPerShare,
            annual_dividend: stockData.annualDividend,
            ex_dividend_date: stockData.exDividendDate,
            dividend_date: stockData.dividendDate,
            sector: stockData.sector,
            industry: stockData.industry,
            market_cap: stockData.marketCap ? parseFloat(stockData.marketCap) : null,
            pe_ratio: stockData.peRatio ? parseFloat(stockData.peRatio) : null,
            shares: 0,
            last_synced: new Date().toISOString()
          });

        if (error) throw error;

        // Add to local state
        setTrackedStocks(prev => [{ ...stockData, shares: 0 }, ...prev]);
        setLastSyncedAt(new Date());
        
        toast({
          title: "Stock Added!",
          description: `${stockData.symbol} is now being tracked and saved`,
        });
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      toast({
        title: "Error",
        description: "Failed to save stock data",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setTrackedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    toast({
      title: "Stock Removed",
      description: `${symbol} has been removed from tracking`,
    });
  };

  const handleUpdateShares = async (symbol: string, shares: number) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_stocks')
        .update({ shares })
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;

      // Update local state
      setTrackedStocks(prev => 
        prev.map(stock => 
          stock.symbol === symbol 
            ? { ...stock, shares }
            : stock
        )
      );
    } catch (error) {
      console.error('Error updating shares:', error);
      toast({
        title: "Error",
        description: "Failed to save share count",
        variant: "destructive"
      });
    }
  };

  const handleSyncInvestments = async () => {
    if (!user?.id) return;
    
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-dividends', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Sync error:', error);
        toast({
          title: "Sync Failed",
          description: "Failed to sync your investment accounts. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Sync successful:', data);
      toast({
        title: "Sync Complete!",
        description: data.message || "Successfully synced your investment accounts",
      });

      // Reload stocks after sync
      const { data: stocks } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (stocks) {
        const formattedStocks = stocks.map(stock => ({
          symbol: stock.symbol,
          companyName: stock.company_name || '',
          currentPrice: stock.current_price,
          dividendYield: stock.dividend_yield,
          dividendPerShare: stock.dividend_per_share,
          annualDividend: stock.annual_dividend,
          exDividendDate: stock.ex_dividend_date,
          dividendDate: stock.dividend_date,
          sector: stock.sector,
          industry: stock.industry,
          marketCap: stock.market_cap?.toString() || null,
          peRatio: stock.pe_ratio?.toString() || null,
          shares: Number(stock.shares) || 0
        }));
        setTrackedStocks(formattedStocks);
        
        // Update last synced timestamp from the latest stock sync
        const latestSync = stocks.reduce((latest, stock) => {
          const stockSync = new Date(stock.last_synced);
          return stockSync > latest ? stockSync : latest;
        }, new Date(0));
        if (latestSync.getTime() > 0) {
          setLastSyncedAt(latestSync);
        }
      }
    } catch (error) {
      console.error('Error syncing investments:', error);
      toast({
        title: "Sync Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePlaidSuccess = () => {
    toast({
      title: "Account Connected!",
      description: "You can now sync your investment holdings to track dividends automatically.",
    });
  };

  const refreshStockPrices = async () => {
    if (!user?.id || trackedStocks.length === 0) return;
    
    setIsRefreshingPrices(true);
    try {
      console.log('Refreshing stock prices...');
      const { data, error } = await supabase.functions.invoke('refresh-stock-prices', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Price refresh error:', error);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh stock prices. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Price refresh response:', data);
      
      // Reload stocks to get updated prices
      const { data: stocks } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (stocks) {
        const formattedStocks = stocks.map(stock => ({
          symbol: stock.symbol,
          companyName: stock.company_name || '',
          currentPrice: stock.current_price,
          dividendYield: stock.dividend_yield,
          dividendPerShare: stock.dividend_per_share,
          annualDividend: stock.annual_dividend,
          exDividendDate: stock.ex_dividend_date,
          dividendDate: stock.dividend_date,
          sector: stock.sector,
          industry: stock.industry,
          marketCap: stock.market_cap?.toString() || null,
          peRatio: stock.pe_ratio?.toString() || null,
          shares: Number(stock.shares) || 0
        }));
        setTrackedStocks(formattedStocks);
        
        // Update last synced timestamp from the latest stock sync
        const latestSync = stocks.reduce((latest, stock) => {
          const stockSync = new Date(stock.last_synced);
          return stockSync > latest ? stockSync : latest;
        }, new Date(0));
        if (latestSync.getTime() > 0) {
          setLastSyncedAt(latestSync);
        }
      }

      if (data?.updated > 0) {
        toast({
          title: "Prices Updated!",
          description: `Updated prices for ${data.updated} stocks`,
        });
      }
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast({
        title: "Refresh Failed",
        description: "An unexpected error occurred while refreshing prices.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const calculateStats = () => {
    const totalAnnualDividends = trackedStocks.reduce((sum, stock) => {
      if (stock.shares > 0) {
        // Use annualDividend if available, otherwise derive from yield and price
        if (stock.annualDividend) {
          return sum + (stock.annualDividend * stock.shares);
        } else if (stock.dividendYield && stock.currentPrice) {
          const annualDividend = (stock.dividendYield / 100) * stock.currentPrice;
          return sum + (annualDividend * stock.shares);
        }
      }
      return sum;
    }, 0);
    
    const totalQuarterlyDividends = totalAnnualDividends / 4;
    const totalMonthlyDividends = totalAnnualDividends / 12;
    const uniqueStocks = trackedStocks.length;

    return {
      totalAnnualDividends,
      totalQuarterlyDividends,
      totalMonthlyDividends,
      uniqueStocks
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Stats Grid */}
        <section className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Annual Dividends"
              value={`$${stats.totalAnnualDividends.toFixed(2)}`}
              subtitle="Projected yearly income"
              trend="up"
            />
            <StatsCard
              title="Quarterly Dividends"
              value={`$${stats.totalQuarterlyDividends.toFixed(2)}`}
              subtitle="Projected quarterly income"
              trend="up"
            />
            <StatsCard
              title="Monthly Estimate"
              value={`$${stats.totalMonthlyDividends.toFixed(2)}`}
              subtitle="Average monthly income"
              trend="neutral"
            />
            <StatsCard
              title="Portfolio"
              value={stats.uniqueStocks.toString()}
              subtitle="Tracked dividend stocks"
              trend="neutral"
            />
          </div>
        </section>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Plaid Integration and Manual Stock Entry */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border text-center">
              <h3 className="text-lg font-semibold mb-4">Connect Your Investment Accounts</h3>
              <p className="text-muted-foreground mb-4">
                Automatically track your dividend stocks by connecting your investment accounts through Plaid.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {user?.id && (
                  <PlaidLinkButton 
                    userId={user.id} 
                    onSuccess={handlePlaidSuccess}
                  />
                )}
                <Button
                  onClick={handleSyncInvestments}
                  disabled={isSyncing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isSyncing ? 'Syncing...' : 'Sync Holdings'}
                </Button>
                <Button
                  onClick={refreshStockPrices}
                  disabled={isRefreshingPrices}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isRefreshingPrices ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border text-center">
              <h3 className="text-lg font-semibold mb-4">Add Stocks Manually</h3>
              <p className="text-muted-foreground mb-4">
                Search and add dividend stocks manually to track their performance.
              </p>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <StockSymbolForm onStockFound={handleStockFound} />
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Chart */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Your Dividend Portfolio</h3>
              {lastSyncedAt && (
                <p className="text-sm text-muted-foreground">
                  Last synced: {lastSyncedAt.toLocaleString()}
                </p>
              )}
            </div>
            <DividendPortfolioChart
              trackedStocks={trackedStocks}
              onRemoveStock={handleRemoveStock}
              onUpdateShares={handleUpdateShares}
            />
          </div>
        </div>
      </div>
    </div>
  );
};