import { useState, useEffect, useRef } from "react";
import { StatsCard } from "./StatsCard";
import { StockSymbolForm } from "./StockSymbolForm";
import { DividendPortfolioChart } from "./DividendPortfolioChart";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Header } from "./Header";
import { Footer } from "./Footer";
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
  const [connectedAccounts, setConnectedAccounts] = useState<number>(0);
  const [connectedInstitutions, setConnectedInstitutions] = useState<Array<{item_id: string, institution_name: string, account_count: number}>>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load tracked stocks and connection status from database on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      // Load stocks
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

      // Load connected accounts and institutions
      const { data: accounts, error: accountsError } = await supabase
        .from('plaid_accounts')
        .select('id, account_name, institution_name, is_active, item_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!accountsError && accounts) {
        setConnectedAccounts(accounts.length);
        
        // Group by institution
        const institutionMap = new Map();
        accounts.forEach(account => {
          const key = account.item_id;
          if (institutionMap.has(key)) {
            institutionMap.get(key).account_count++;
          } else {
            institutionMap.set(key, {
              item_id: account.item_id,
              institution_name: account.institution_name || 'Unknown Institution',
              account_count: 1
            });
          }
        });
        
        setConnectedInstitutions(Array.from(institutionMap.values()));
      }

      // Load recent activity
      const { data: activity, error: activityError } = await supabase
        .from('plaid_access_logs')
        .select('action, created_at, account_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!activityError && activity) {
        setRecentActivity(activity);
      }
    };

    loadData();

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

  const handleRemoveStock = async (symbol: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_stocks')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;

      setTrackedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
      toast({
        title: "Stock Removed",
        description: `${symbol} has been permanently removed from tracking`,
      });
    } catch (error) {
      console.error('Error removing stock:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock",
        variant: "destructive"
      });
    }
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
    
    // Perform a fresh check for connected accounts before blocking
    console.log('Checking for connected accounts before sync...');
    const { data: freshAccounts, error: accountsError } = await supabase
      .from('plaid_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    const actualConnectedAccounts = freshAccounts?.length || 0;
    console.log('Fresh account count:', actualConnectedAccounts);
    
    if (actualConnectedAccounts === 0) {
      toast({
        title: "No Connected Accounts",
        description: "Please connect an investment account first before syncing.",
        variant: "destructive"
      });
      return;
    }
    
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
      const stockCount = data.syncedStocks ?? data.stocksProcessed ?? 0;
      toast({
        title: "Sync Complete!",
        description: `Synced ${stockCount} stocks from your connected accounts`,
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

      // Refresh connected accounts count after successful sync
      const { data: updatedAccounts } = await supabase
        .from('plaid_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (updatedAccounts) {
        console.log('Updated connected accounts count:', updatedAccounts.length);
        setConnectedAccounts(updatedAccounts.length);
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

  const handlePlaidSuccess = async (connectionData?: { accounts_connected?: number, institution_name?: string }) => {
    const accountsConnected = connectionData?.accounts_connected || 1;
    const institutionName = connectionData?.institution_name || 'your bank';
    
    toast({
      title: "Account Connected!",
      description: `Connected ${accountsConnected} account${accountsConnected > 1 ? 's' : ''} from ${institutionName}. Syncing holdings...`,
    });
    
    // Poll for connected accounts with a timeout (up to 5 attempts, 1s apart)
    if (user?.id) {
      let attempts = 0;
      const maxAttempts = 5;
      
      const pollForAccounts = async (): Promise<void> => {
        attempts++;
        console.log(`Polling for accounts, attempt ${attempts}/${maxAttempts}`);
        
        const { data: accounts } = await supabase
          .from('plaid_accounts')
          .select('id, item_id, institution_name')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        const accountCount = accounts?.length || 0;
        console.log('Polling result - accounts found:', accountCount);
        
        if (accountCount > 0) {
          setConnectedAccounts(accountCount);
          
          // Update institutions
          const institutionMap = new Map();
          accounts.forEach(account => {
            const key = account.item_id;
            if (institutionMap.has(key)) {
              institutionMap.get(key).account_count++;
            } else {
              institutionMap.set(key, {
                item_id: account.item_id,
                institution_name: account.institution_name || 'Unknown Institution',
                account_count: 1
              });
            }
          });
          setConnectedInstitutions(Array.from(institutionMap.values()));
          
          // Trigger sync immediately after finding accounts
          console.log('Accounts found, triggering immediate sync...');
          handleSyncInvestments();
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(pollForAccounts, 1000); // Wait 1 second before next attempt
        } else {
          console.log('Polling timeout - will try sync anyway');
          // Try sync anyway, the fresh check in handleSyncInvestments will catch it
          handleSyncInvestments();
        }
      };
      
      pollForAccounts();
    }
  };

  const handleDisconnectInstitution = async (itemId: string, institutionName: string) => {
    if (!user) return;
    
    try {
      toast({
        title: "Disconnecting...",
        description: `Disconnecting ${institutionName}...`,
      });
      
      const { data, error } = await supabase.functions.invoke('plaid-disconnect-item', {
        body: {
          user_id: user.id,
          item_id: itemId
        }
      });

      if (error) {
        console.error('Disconnect error:', error);
        toast({
          title: "Disconnect Failed",
          description: "Failed to disconnect account. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Disconnected!",
        description: `Successfully disconnected ${institutionName}`,
      });
      
      // Refresh the accounts list
      const { data: accounts } = await supabase
        .from('plaid_accounts')
        .select('id, item_id, institution_name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (accounts) {
        setConnectedAccounts(accounts.length);
        
        // Update institutions
        const institutionMap = new Map();
        accounts.forEach(account => {
          const key = account.item_id;
          if (institutionMap.has(key)) {
            institutionMap.get(key).account_count++;
          } else {
            institutionMap.set(key, {
              item_id: account.item_id,
              institution_name: account.institution_name || 'Unknown Institution',
              account_count: 1
            });
          }
        });
        setConnectedInstitutions(Array.from(institutionMap.values()));
      }
    } catch (error) {
      console.error('Error disconnecting institution:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    }
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
          {/* Connection Status and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connected Accounts Status */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Connected Accounts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (user?.id) {
                      const { data: accounts } = await supabase
                        .from('plaid_accounts')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('is_active', true);
                      
                      if (accounts) {
                        console.log('Refreshed connected accounts count:', accounts.length);
                        setConnectedAccounts(accounts.length);
                      }
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{connectedAccounts}</div>
                <p className="text-muted-foreground mb-4">
                  {connectedAccounts === 0 ? 'No accounts connected' : 
                   connectedAccounts === 1 ? 'Investment account connected' : 
                   'Investment accounts connected'}
                </p>
                
                {/* Connected Institutions List */}
                {connectedInstitutions.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Connected Institutions:</p>
                    {connectedInstitutions.map((institution) => (
                      <div key={institution.item_id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="text-left">
                          <p className="text-sm font-medium">{institution.institution_name}</p>
                          <p className="text-xs text-muted-foreground">{institution.account_count} account{institution.account_count > 1 ? 's' : ''}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectInstitution(institution.item_id, institution.institution_name)}
                          className="text-destructive hover:text-destructive"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {user?.id && (
                  <PlaidLinkButton 
                    userId={user.id} 
                    onSuccess={handlePlaidSuccess}
                    disabled={connectedInstitutions.length >= 1}
                    limitMessage={connectedInstitutions.length >= 1 ? "Free tier allows only 1 institution" : undefined}
                  />
                )}
              </div>
            </div>

            {/* Sync Controls */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Sync Holdings</h3>
              <div className="text-center space-y-3">
                <p className="text-muted-foreground text-sm">
                  Sync your investment holdings to automatically track dividend stocks
                </p>
                <Button
                  onClick={handleSyncInvestments}
                  disabled={isSyncing}
                  className="w-full"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSyncing ? 'Syncing...' : 'Sync Holdings'}
                </Button>
                <Button
                  onClick={refreshStockPrices}
                  disabled={isRefreshingPrices}
                  variant="outline"
                  className="w-full"
                >
                  {isRefreshingPrices ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Manual Stock Entry */}
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

      <Footer />
    </div>
  );
};