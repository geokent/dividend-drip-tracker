import { useState, useEffect, useRef } from "react";
import { DividendPortfolioChart } from "./DividendPortfolioChart";
import { CompactToolbar } from "./CompactToolbar";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lightbulb, Building2 } from "lucide-react";
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Portfolio Header and Compact Toolbar */}
        <div className="space-y-4 mb-6 text-center">
          <h1 className="text-2xl font-bold">Your Dividend Portfolio</h1>
          
          {/* First-time user help banner */}
          {connectedAccounts === 0 && trackedStocks.length === 0 && (
            <Alert className="max-w-2xl mx-auto text-left">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <div>
                  <p className="font-medium mb-2">Get started with your dividend portfolio:</p>
                  <div className="space-y-1 text-sm">
                    <p><Building2 className="h-3 w-3 inline mr-1" /> <strong>Connect account:</strong> Link your brokerage to automatically sync your holdings</p>
                    <p><strong>Or add stocks manually:</strong> Use "Add stock" to track specific dividend stocks</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <CompactToolbar
            centered={true}
            connectedAccounts={connectedAccounts}
            connectedInstitutions={connectedInstitutions}
            recentActivity={recentActivity}
            stats={stats}
            userId={user?.id}
            isSyncing={isSyncing}
            isRefreshingPrices={isRefreshingPrices}
            lastSyncedAt={lastSyncedAt}
            onSync={handleSyncInvestments}
            onRefresh={refreshStockPrices}
            onPlaidSuccess={handlePlaidSuccess}
            onStockFound={handleStockFound}
            onDisconnectInstitution={handleDisconnectInstitution}
          />
        </div>

        {/* Full-Width Portfolio Chart */}
        <DividendPortfolioChart
          trackedStocks={trackedStocks}
          onRemoveStock={handleRemoveStock}
          onUpdateShares={handleUpdateShares}
        />
      </div>

      <Footer />
    </div>
  );
};