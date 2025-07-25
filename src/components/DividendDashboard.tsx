import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { StockSymbolForm } from "./StockSymbolForm";
import { DividendPortfolioChart } from "./DividendPortfolioChart";
// import { PlaidLinkButton } from "./PlaidLinkButton";
// import { PlaidAccountsList } from "./PlaidAccountsList";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LogOut, TrendingUp, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/dividend-hero.jpg";

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

  // Load tracked stocks from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('trackedStocks');
    if (saved) {
      try {
        setTrackedStocks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved tracked stocks:', e);
      }
    }
  }, []);

  // Save to localStorage whenever tracked stocks change
  useEffect(() => {
    localStorage.setItem('trackedStocks', JSON.stringify(trackedStocks));
  }, [trackedStocks]);

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
      {/* Header - Match Landing Page Style */}
      <header className="border-b border-border/5 backdrop-blur-lg bg-white/95 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/learn-dividends" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Learn
              </Link>
              {user?.email && (
                <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              )}
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

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

        {/* Main Content Tabs */}
        <Tabs defaultValue="stocks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Stock Tracker
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Link Brokerage Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            {/* Add Stock Form */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <StockSymbolForm onStockFound={handleStockFound} />
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
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {/* Plaid Integration - Temporarily Disabled */}
            <div className="space-y-4">
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Brokerage Account</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Automatically sync your dividend-paying stocks and track your portfolio performance. 
                  Account linking is temporarily disabled during development.
                </p>
                <p className="text-xs text-muted-foreground">
                  For now, you can manually add stocks using the Stock Tracker tab above.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};