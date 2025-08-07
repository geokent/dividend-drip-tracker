import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { StockSymbolForm } from "./StockSymbolForm";
import { DividendPortfolioChart } from "./DividendPortfolioChart";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Header } from "./Header";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
  const { signOut, user } = useAuth();

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
      }
    };

    loadStocks();
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

  const calculateStats = () => {
    const totalAnnualDividends = trackedStocks.reduce((sum, stock) => {
      if (stock.annualDividend && stock.shares > 0) {
        return sum + (stock.annualDividend * stock.shares);
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
          {/* Add Stock Form and Plaid Link */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-4">
              <StockSymbolForm onStockFound={handleStockFound} />
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-foreground mb-2">Or Connect Your Brokerage Account</p>
                <PlaidLinkButton onSuccess={() => {
                  toast({
                    title: "Account Connected",
                    description: "Your brokerage account has been linked successfully",
                  });
                }} />
                <button
                  onClick={async () => {
                    try {
                      console.log('Starting sync process...');
                      toast({
                        title: "Syncing...",
                        description: "Fetching holdings and dividend data from your accounts",
                      });
                      
                      const { data, error } = await supabase.functions.invoke('sync-investments');
                      
                      if (error) {
                        console.error('Sync error:', error);
                        throw error;
                      }
                      
                      console.log('Sync result:', data);
                      toast({
                        title: "Sync Complete",
                        description: `Synced ${data.syncedStocks} dividend-paying stocks from your brokerage accounts`,
                      });
                      
                      // Reload the stocks after sync
                      window.location.reload();
                    } catch (error) {
                      console.error('Sync error:', error);
                      toast({
                        title: "Sync Failed",
                        description: error?.message || "Unable to sync your brokerage data. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  🔄 Sync Holdings from Linked Accounts
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!user?.id) return;
                      
                      // Get the list of connected accounts to show which one is being unlinked
                      const { data: accounts } = await supabase
                        .from('plaid_accounts')
                        .select('id, account_name')
                        .eq('user_id', user.id)
                        .eq('is_active', true);

                      if (!accounts || accounts.length === 0) {
                        toast({
                          title: "No Account Found",
                          description: "No linked brokerage accounts found.",
                          variant: "destructive"
                        });
                        return;
                      }

                      const accountName = accounts[0].account_name || 'your brokerage account';
                      
                      toast({
                        title: "Unlinking...",
                        description: `Removing ${accountName} and its synced stocks`,
                      });
                      
                      // First, delete stocks linked to these Plaid accounts
                      const { error: stocksError } = await supabase
                        .from('user_stocks')
                        .delete()
                        .eq('user_id', user.id)
                        .not('plaid_account_id', 'is', null);
                      
                      if (stocksError) {
                        console.error('Error removing synced stocks:', stocksError);
                        // Continue anyway to unlink the account
                      }
                      
                      // Then delete the Plaid account connections
                      const { error: accountError } = await supabase
                        .from('plaid_accounts')
                        .delete()
                        .eq('user_id', user.id);
                      
                      if (accountError) throw accountError;
                      
                      toast({
                        title: "Account Unlinked",
                        description: `${accountName} and its synced stocks have been removed. Manually added stocks were preserved.`,
                      });
                      
                      // Reload the page to update the UI
                      window.location.reload();
                    } catch (error) {
                      console.error('Unlink error:', error);
                      toast({
                        title: "Unlink Failed",
                        description: "Unable to unlink your account. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full px-4 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
                >
                  🔗 Unlink Brokerage Account
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Dividend Portfolio</h3>
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