import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { StockSymbolForm } from "./StockSymbolForm";
import { StockDividendCard } from "./StockDividendCard";
// import { PlaidLinkButton } from "./PlaidLinkButton";
// import { PlaidAccountsList } from "./PlaidAccountsList";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LogOut, TrendingUp } from "lucide-react";
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
      // Add new stock
      setTrackedStocks(prev => [...prev, { ...stockData, shares: 0 }]);
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            {user?.email && (
              <span className="text-muted-foreground">({user.email})</span>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div
            className="h-64 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Dividend Tracker
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  Track and manage your dividend income with ease
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Stock Tracker
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              Bank Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            {/* Add Stock Form */}
            <StockSymbolForm onStockFound={handleStockFound} />

            {/* Tracked Stocks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Dividend Stocks</h3>
              {trackedStocks.length === 0 ? (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stocks tracked yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add a stock symbol above to start tracking dividend information
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {trackedStocks.map((stock) => (
                    <StockDividendCard
                      key={stock.symbol}
                      stockData={stock}
                      shares={stock.shares}
                      onRemove={handleRemoveStock}
                      onUpdateShares={handleUpdateShares}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {/* Plaid Integration - Temporarily Disabled */}
            <div className="space-y-4">
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Bank Account Integration</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Bank account integration is temporarily disabled during build. 
                  This will be available once deployed.
                </p>
                <p className="text-xs text-muted-foreground">
                  You can still track dividends manually using the Stock Tracker tab.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};