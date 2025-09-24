import { useState, useEffect, useRef } from "react";
import { PortfolioTable } from "./PortfolioTable";
import { UpcomingDividendsCard } from "./UpcomingDividendsCard";
import { GettingStartedCard } from "./GettingStartedCard";
import { PortfolioTopStrip } from "./PortfolioTopStrip";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { StockSymbolForm } from "./StockSymbolForm";
import { BulkUploadStocksDialog } from "./BulkUploadStocksDialog";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PlaidDisconnectDialog } from "./PlaidDisconnectDialog";

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
  const [disconnectDialog, setDisconnectDialog] = useState<{
    open: boolean;
    itemId: string;
    institutionName: string;
    affectedStocks: any[];
  }>({
    open: false,
    itemId: '',
    institutionName: '',
    affectedStocks: []
  });
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load user stocks from database
  const loadUserStocks = async () => {
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
        nextExDividendDate: stock.next_ex_dividend_date,
        dividendFrequency: stock.dividend_frequency,
        sector: stock.sector,
        industry: stock.industry,
        marketCap: stock.market_cap?.toString() || null,
        peRatio: stock.pe_ratio?.toString() || null,
        shares: Number(stock.shares) || 0,
        source: stock.source,
        plaid_item_id: stock.plaid_item_id,
        last_synced: stock.last_synced
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

  // Load connected accounts from database
  const loadConnectedAccounts = async () => {
    if (!user?.id) return;
    
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
  };

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
          nextExDividendDate: stock.next_ex_dividend_date,
          dividendFrequency: stock.dividend_frequency,
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
          nextExDividendDate: stock.next_ex_dividend_date,
          dividendFrequency: stock.dividend_frequency,
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

  const handleDisconnectInstitution = async (itemId: string, institutionName: string, affectedStocks?: any[]) => {
    if (!user) return;
    
    // If no affected stocks provided, this came from the toolbar button
    // We need to show the dialog to let user choose what to do
    if (!affectedStocks) {
      // Query affected stocks for this item
      const { data: stocks } = await supabase
        .from('user_stocks')
        .select('symbol, company_name, shares, current_price, annual_dividend, source, plaid_item_id')
        .eq('user_id', user.id)
        .eq('plaid_item_id', itemId)
        .eq('source', 'plaid_sync');

      setDisconnectDialog({
        open: true,
        itemId,
        institutionName,
        affectedStocks: stocks || []
      });
      return;
    }

    // This comes from the dialog with a cleanup action
    setIsDisconnecting(true);
    
    try {
      toast({
        title: "Disconnecting...",
        description: `Disconnecting ${institutionName}...`,
      });
      
      const { data, error } = await supabase.functions.invoke('plaid-disconnect-item', {
        body: {
          user_id: user.id,
          item_id: itemId,
          cleanup_action: 'keep' // Default cleanup action
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
        description: data.message || `Successfully disconnected ${institutionName}`,
      });
      
      // Refresh both accounts and stocks
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
      
      // Refresh stocks to reflect any cleanup
      await loadUserStocks();
    } catch (error) {
      console.error('Error disconnecting institution:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
      setDisconnectDialog({ open: false, itemId: '', institutionName: '', affectedStocks: [] });
    }
  };

  const handleConfirmDisconnect = async (itemId: string, institutionName: string, cleanupAction: 'keep' | 'remove' | 'convert') => {
    if (!user) return;
    
    setIsDisconnecting(true);
    
    try {
      toast({
        title: "Disconnecting...",
        description: `Disconnecting ${institutionName}...`,
      });
      
      const { data, error } = await supabase.functions.invoke('plaid-disconnect-item', {
        body: {
          user_id: user.id,
          item_id: itemId,
          cleanup_action: cleanupAction
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
        description: data.message || `Successfully disconnected ${institutionName}`,
      });
      
      // Refresh both accounts and stocks
      await Promise.all([loadConnectedAccounts(), loadUserStocks()]);
    } catch (error) {
      console.error('Error disconnecting institution:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
      setDisconnectDialog({ open: false, itemId: '', institutionName: '', affectedStocks: [] });
    }
  };

  const handlePlaidDisconnect = async () => {
    // Refresh connection status after disconnect
    if (!user?.id) return;
    
    const { data: accounts } = await supabase
      .from('plaid_accounts')
      .select('id, item_id, institution_name')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (accounts) {
      setConnectedAccounts(accounts.length);
      
      // Update institutions list
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
  };

  const refreshStockPrices = async () => {
    if (!user?.id) return;
    
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
      await loadUserStocks();

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

  const fetchDividendDataForStocks = async () => {
    if (!user?.id) return;
    
    // Get stocks that need dividend data (null dividend_yield or last_synced > 7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: stocksNeedingData } = await supabase
      .from('user_stocks')
      .select('*')
      .eq('user_id', user.id)
      .or(`dividend_yield.is.null,last_synced.lt.${sevenDaysAgo.toISOString()}`);
    
    if (!stocksNeedingData || stocksNeedingData.length === 0) return;
    
    console.log(`Fetching dividend data for ${stocksNeedingData.length} stocks...`);
    
    for (const stock of stocksNeedingData) {
      try {
        const { data, error } = await supabase.functions.invoke('get-dividend-data', {
          body: { symbol: stock.symbol }
        });

        if (error) {
          console.error(`Error fetching dividend data for ${stock.symbol}:`, error);
          continue;
        }

        if (data.error) {
          console.error(`API error for ${stock.symbol}:`, data.error);
          continue;
        }

        // Update the stock with dividend data
        await supabase
          .from('user_stocks')
          .update({
            company_name: data.companyName,
            current_price: data.currentPrice,
            dividend_yield: data.dividendYield,
            dividend_per_share: data.dividendPerShare,
            annual_dividend: data.annualDividend,
            ex_dividend_date: data.exDividendDate,
            dividend_date: data.dividendDate,
            next_ex_dividend_date: data.nextExDividendDate,
            dividend_frequency: data.dividendFrequency,
            sector: data.sector,
            industry: data.industry,
            market_cap: data.marketCap ? parseFloat(data.marketCap) : null,
            pe_ratio: data.peRatio ? parseFloat(data.peRatio) : null,
            last_synced: new Date().toISOString()
          })
          .eq('id', stock.id);

        console.log(`Updated dividend data for ${stock.symbol}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error processing ${stock.symbol}:`, error);
      }
    }
  };

  const handleBulkUploadSuccess = async () => {
    toast({
      title: "Upload Complete!",
      description: "Fetching stock prices and dividend data...",
    });
    
    await loadUserStocks();
    await fetchDividendDataForStocks();
    await loadUserStocks(); // Reload to show updated data
    
    toast({
      title: "Complete!",
      description: "All stock data has been updated with current prices and dividends.",
    });
  };

  const handleUpdatePortfolio = async () => {
    // First sync connected accounts, then refresh prices
    await handleSyncInvestments();
    await refreshStockPrices();
  };

  // Check if we're in maintenance window (02:00-04:00 UTC)
  const isMaintenanceWindow = () => {
    const currentHour = new Date().getUTCHours();
    return currentHour >= 2 && currentHour < 4;
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

  // Calculate total portfolio value
  const totalPortfolioValue = trackedStocks.reduce((sum, stock) => {
    if (!stock.currentPrice || stock.shares === 0) return sum;
    return sum + (stock.currentPrice * stock.shares);
  }, 0);

  // Calculate total yield percentage
  const totalYield = totalPortfolioValue > 0 ? (stats.totalAnnualDividends / totalPortfolioValue) * 100 : 0;

  const headerActions = (
    <div className="flex items-center gap-2">
      <BulkUploadStocksDialog onSuccess={handleBulkUploadSuccess} />
      {user?.id && (
        <PlaidLinkButton
          userId={user.id}
          onSuccess={handlePlaidSuccess}
          size="sm"
          isConnected={connectedInstitutions.length > 0}
          connectedItemId={connectedInstitutions.length > 0 ? connectedInstitutions[0].item_id : undefined}
          onDisconnect={handlePlaidDisconnect}
          data-plaid-link-button
        />
      )}
    </div>
  );

  return (
    <AppLayout>
      <PageHeader 
        title="Your Dividend Portfolio"
        icon={TrendingUp}
        actions={headerActions}
      />
      
      {/* Portfolio Top Strip */}
      <PortfolioTopStrip 
        totalValue={totalPortfolioValue}
        totalYield={totalYield}
        totalMonthlyDividends={stats.totalMonthlyDividends}
        totalAnnualDividends={stats.totalAnnualDividends}
      />

      {/* Always visible Stock Form */}
      <div className="mb-6">
        <StockSymbolForm onStockFound={handleStockFound} />
      </div>

      {/* Getting Started Card - Prominent at top */}
      {(trackedStocks.length === 0 || connectedAccounts === 0) && (
        <div className="mb-8">
          <GettingStartedCard
            hasStocks={trackedStocks.length > 0}
            hasConnectedAccounts={connectedAccounts > 0}
            onConnectAccount={() => {
              // The PlaidLinkButton in header actions will handle this
              const plaidButton = document.querySelector('[data-plaid-link-button]');
              if (plaidButton) {
                (plaidButton as HTMLElement).click();
              }
            }}
            onAddStock={() => {}}
          />
        </div>
      )}

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Main Content */}
        <PortfolioTable
          stocks={trackedStocks}
          onRemoveStock={handleRemoveStock}
          onUpdateShares={handleUpdateShares}
        />
        
        {/* Upcoming Dividends - Below the chart */}
        <UpcomingDividendsCard stocks={trackedStocks} />
      </div>
      
      <PlaidDisconnectDialog
        open={disconnectDialog.open}
        onOpenChange={(open) => setDisconnectDialog({ ...disconnectDialog, open })}
        institutionName={disconnectDialog.institutionName}
        itemId={disconnectDialog.itemId}
        affectedStocks={disconnectDialog.affectedStocks}
        onConfirmDisconnect={handleConfirmDisconnect}
        isDisconnecting={isDisconnecting}
      />
    </AppLayout>
  );
};