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

  const handleStockFound = (stockData: StockData) => {
    const existingIndex = trackedStocks.findIndex(stock => stock.symbol === stockData.symbol);
    
    if (existingIndex >= 0) {
      // Update existing stock data
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
      // Add new stock to the top of the list
      setTrackedStocks(prev => [{ ...stockData, shares: 0 }, ...prev]);
      toast({
        title: "Stock Added!",
        description: `${stockData.symbol} is now being tracked`,
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

  const handleUpdateShares = (symbol: string, shares: number) => {
    setTrackedStocks(prev => 
      prev.map(stock => 
        stock.symbol === symbol 
          ? { ...stock, shares }
          : stock
      )
    );
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
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-2">Or connect your brokerage account</p>
                <PlaidLinkButton onSuccess={() => {
                  toast({
                    title: "Account Connected",
                    description: "Your brokerage account has been linked successfully",
                  });
                }} />
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