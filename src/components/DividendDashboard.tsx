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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex flex-col items-center">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-8 w-auto mb-1"
              />
              <span className="text-sm font-medium text-foreground">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
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
        <section className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              Bank Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            {/* Add Stock Form */}
            <StockSymbolForm onStockFound={handleStockFound} />

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