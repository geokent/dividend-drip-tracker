import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompactToolbar } from "@/components/CompactToolbar";
import { PlaidLinkButton } from "@/components/PlaidLinkButton";
import { StockSymbolForm } from "@/components/StockSymbolForm";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calculator, 
  Brain, 
  ArrowRight, 
  Calendar, 
  PieChart,
  BarChart3,
  Zap,
  Star,
  Home,
  LogOut,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useAuth } from "@/components/AuthProvider";
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

export const FutureIncomeProjects = () => {
  const { user, signOut } = useAuth();
  const [trackedStocks, setTrackedStocks] = useState<TrackedStock[]>([]);
  const [monthlyInvestment, setMonthlyInvestment] = useState(0);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(5);
  const [portfolioGrowthRate, setPortfolioGrowthRate] = useState(0.07); // 7% default
  const [additionalYearlyContribution, setAdditionalYearlyContribution] = useState(0);
  const [reinvestDividends, setReinvestDividends] = useState(true);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [chartMode, setChartMode] = useState<"dividend" | "growth">("dividend");
  
  // Dashboard-compatible state for CompactToolbar
  const [connectedAccountsData, setConnectedAccountsData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Load tracked stocks and connected accounts from Supabase database
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load tracked stocks
        const { data: stocksData, error: stocksError } = await supabase
          .from('user_stocks')
          .select('*')
          .eq('user_id', user.id);

        if (stocksError) {
          console.error('Error loading tracked stocks:', stocksError);
        } else if (stocksData) {
          const formattedStocks = stocksData.map(stock => ({
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
            marketCap: stock.market_cap?.toString(),
            peRatio: stock.pe_ratio?.toString(),
            shares: Number(stock.shares)
          }));
          setTrackedStocks(formattedStocks);
        }

        // Load connected accounts (for toolbar display)
        const { data: accountsData, error: accountsError } = await supabase
          .from('plaid_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (accountsError) {
          console.error('Error loading connected accounts:', accountsError);
        } else if (accountsData) {
          setConnectedAccountsData(accountsData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [user]);

  // Calculate current portfolio metrics
  const calculateCurrentMetrics = () => {
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
    
    const totalPortfolioValue = trackedStocks.reduce((sum, stock) => {
      if (stock.currentPrice && stock.shares > 0) {
        return sum + (stock.currentPrice * stock.shares);
      }
      return sum;
    }, 0);

    const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualDividends / totalPortfolioValue) * 100 : 0;
    
    const weightedAvgYield = totalPortfolioValue > 0 ? 
      (trackedStocks.reduce((sum, stock) => {
        if (stock.currentPrice && stock.shares > 0 && stock.dividendYield) {
          const stockValue = stock.currentPrice * stock.shares;
          return sum + (stockValue * stock.dividendYield / 100);
        }
        return sum;
      }, 0) / totalPortfolioValue) * 100 : 0;

    return {
      totalAnnualDividends,
      totalPortfolioValue,
      portfolioYield,
      weightedAvgYield,
      uniqueStocks: trackedStocks.length
    };
  };

  // Generate projection data for charts
  const generateProjectionData = () => {
    const currentMetrics = calculateCurrentMetrics();
    const data = [];
    
    let currentPortfolioValue = currentMetrics.totalPortfolioValue;
    let currentAnnualDividends = currentMetrics.totalAnnualDividends;
    
    // Use current portfolio yield or default to 4% if no stocks
    const assumedYield = currentMetrics.portfolioYield > 0 ? currentMetrics.portfolioYield / 100 : 0.04;
    
    for (let year = 0; year <= 15; year++) {
      // Add monthly investments
      const yearlyInvestment = monthlyInvestment * 12 + additionalYearlyContribution;
      currentPortfolioValue += yearlyInvestment;
      
      // Add dividend reinvestment if enabled
      if (reinvestDividends && year > 0) {
        currentPortfolioValue += currentAnnualDividends;
      }
      
      // Apply market growth (7% average)
      if (year > 0) {
        currentPortfolioValue *= 1.07;
      }
      
      // Calculate new annual dividends with growth
      currentAnnualDividends = currentPortfolioValue * assumedYield;
      if (year > 0) {
        currentAnnualDividends *= Math.pow(1 + dividendGrowthRate / 100, year);
      }

      data.push({
        year,
        portfolioValue: Math.round(currentPortfolioValue),
        annualDividends: Math.round(currentAnnualDividends),
        monthlyIncome: Math.round(currentAnnualDividends / 12),
        quarterlyIncome: Math.round(currentAnnualDividends / 4)
      });
    }
    
    return data;
  };

  const projectionData = generateProjectionData();
  const currentMetrics = calculateCurrentMetrics();

  // Dashboard-compatible handlers for CompactToolbar
  const handleStockFound = async (stockData: any) => {
    try {
      const { error } = await supabase
        .from('user_stocks')
        .upsert({
          user_id: user?.id,
          symbol: stockData.symbol,
          company_name: stockData.companyName,
          current_price: stockData.currentPrice,
          dividend_yield: stockData.dividendYield,
          dividend_per_share: stockData.dividendPerShare,
          annual_dividend: stockData.annualDividend,
          sector: stockData.sector,
          industry: stockData.industry,
          market_cap: stockData.marketCap,
          pe_ratio: stockData.peRatio,
          shares: 1, // Default to 1 share
          last_synced: new Date().toISOString()
        });

      if (error) throw error;

      // Reload data
      const { data: stocksData } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user?.id);

      if (stocksData) {
        const formattedStocks = stocksData.map(stock => ({
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
          marketCap: stock.market_cap?.toString(),
          peRatio: stock.pe_ratio?.toString(),
          shares: Number(stock.shares)
        }));
        setTrackedStocks(formattedStocks);
      }

      toast({
        title: "Stock Added",
        description: `${stockData.symbol} has been added to your portfolio.`,
      });
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSyncInvestments = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-dividends', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: "Your investment accounts have been synced successfully.",
      });
      
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshStockPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      const { data, error } = await supabase.functions.invoke('refresh-stock-prices', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: "Prices Updated",
        description: "Stock prices and dividend data have been refreshed.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Update Failed",
        description: "Unable to refresh prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const handleUpdatePortfolio = async () => {
    await handleSyncInvestments();
    await refreshStockPrices();
  };

  const handlePlaidSuccess = async (data?: any) => {
    toast({
      title: "Account Connected",
      description: "Your account has been connected successfully.",
    });
    
    // Reload connected accounts
    const { data: accountsData } = await supabase
      .from('plaid_accounts')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true);
    
    if (accountsData) {
      setConnectedAccountsData(accountsData);
    }
  };

  const handleDisconnectInstitution = async (itemId: string, institutionName: string) => {
    try {
      const { error } = await supabase.functions.invoke('plaid-disconnect-item', {
        body: { item_id: itemId, user_id: user?.id }
      });

      if (error) throw error;

      // Reload connected accounts
      const { data: accountsData } = await supabase
        .from('plaid_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);
      
      if (accountsData) {
        setConnectedAccountsData(accountsData);
      }

      toast({
        title: "Account Disconnected",
        description: `${institutionName} has been disconnected.`,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Disconnect Failed",
        description: "Unable to disconnect account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isMaintenanceWindow = () => {
    const currentHour = new Date().getUTCHours();
    return currentHour >= 2 && currentHour < 4;
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your dividend projections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">
                Go to Home Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            <span>AI-Powered Analysis</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Future Dividend Income Projections
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="block">AI-powered projections based on your current portfolio.</span>
            <span className="block">Customize parameters below to see how different strategies affect your long-term income.</span>
          </p>
        </div>

        {/* Compact Toolbar */}
        <CompactToolbar
          connectedAccounts={connectedAccountsData.length}
          connectedInstitutions={connectedAccountsData.reduce((acc, account) => {
            const existing = acc.find(inst => inst.item_id === account.item_id);
            if (existing) {
              existing.account_count++;
            } else {
              acc.push({
                item_id: account.item_id,
                institution_name: account.institution_name || 'Unknown',
                account_count: 1
              });
            }
            return acc;
          }, [] as Array<{item_id: string, institution_name: string, account_count: number}>)}
          recentActivity={[]}
          stats={{
            totalAnnualDividends: currentMetrics.totalAnnualDividends,
            totalQuarterlyDividends: currentMetrics.totalAnnualDividends / 4,
            totalMonthlyDividends: currentMetrics.totalAnnualDividends / 12,
            uniqueStocks: currentMetrics.uniqueStocks
          }}
          userId={user?.id}
          isSyncing={isSyncing}
          isRefreshingPrices={isRefreshingPrices}
          lastSyncedAt={lastSyncedAt}
          centered={true}
          isMaintenanceWindow={isMaintenanceWindow()}
          onUpdate={handleUpdatePortfolio}
          onPlaidSuccess={handlePlaidSuccess}
          onStockFound={handleStockFound}
          onDisconnectInstitution={handleDisconnectInstitution}
        />

        {/* Main Content Flex Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Chart Section - Main Content */}
          <div className="flex-1">
            <Card className="shadow-card hover:shadow-hover transition-smooth gradient-card">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      {chartMode === "dividend" ? (
                        <BarChart3 className="h-5 w-5 text-primary" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      )}
                      {chartMode === "dividend" ? "Monthly Dividend Income" : "Portfolio Growth Projection"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {chartMode === "dividend" 
                        ? "Projected monthly dividend income over time" 
                        : "Portfolio value and annual dividend income over 15 years"
                      }
                    </CardDescription>
                  </div>
                  <Tabs value={chartMode} onValueChange={(value) => setChartMode(value as "dividend" | "growth")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="dividend" className="text-xs">Monthly Income</TabsTrigger>
                      <TabsTrigger value="growth" className="text-xs">Portfolio Growth</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === "dividend" ? (
                       <BarChart 
                         data={projectionData.filter((_, index) => index % 2 === 0)}
                         margin={{ top: 8, right: 16, left: 28, bottom: 24 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis 
                           dataKey="year" 
                           stroke="hsl(var(--muted-foreground))"
                           label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                         />
                         <YAxis 
                           width={40}
                           tickMargin={4}
                           tick={{ fontSize: 12 }}
                           stroke="hsl(var(--muted-foreground))"
                           tickFormatter={(value) => `$${value.toLocaleString()}`}
                         />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-card)'
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Income']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Bar 
                          dataKey="monthlyIncome" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                       <LineChart 
                         data={projectionData}
                         margin={{ top: 8, right: 16, left: 28, bottom: 24 }}
                       >
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis 
                           dataKey="year" 
                           stroke="hsl(var(--muted-foreground))"
                           label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                         />
                         <YAxis 
                           width={40}
                           tickMargin={4}
                           tick={{ fontSize: 12 }}
                           stroke="hsl(var(--muted-foreground))"
                           tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                         />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-card)'
                          }}
                          formatter={(value: number, name: string) => [
                            `$${value.toLocaleString()}`, 
                            name === 'portfolioValue' ? 'Portfolio Value' : 'Annual Dividends'
                          ]}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="portfolioValue" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="annualDividends" 
                          stroke="hsl(var(--financial-green))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--financial-green))', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
              
              {/* Key Milestones integrated into chart footer */}
              <CardFooter className="pt-4 border-t border-border bg-secondary/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div className="text-center p-3 rounded-lg bg-card border border-border shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground mb-1">2 Years</div>
                    <div className="text-lg font-bold text-foreground">
                      ${projectionData[1]?.portfolioValue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-financial-green font-medium">
                      ${projectionData[1]?.monthlyIncome?.toLocaleString() || '0'}/mo
                    </div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground mb-1">10 Years</div>
                    <div className="text-lg font-bold text-primary">
                      ${projectionData[10]?.portfolioValue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-financial-green font-medium">
                      ${projectionData[10]?.monthlyIncome?.toLocaleString() || '0'}/mo
                    </div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20 shadow-sm">
                    <div className="text-sm font-medium text-muted-foreground mb-1">15 Years</div>
                    <div className="text-lg font-bold text-accent">
                      ${projectionData[15]?.portfolioValue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-financial-green font-medium">
                      ${projectionData[15]?.monthlyIncome?.toLocaleString() || '0'}/mo
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Parameters Panel - Sticky on Desktop */}
          <div className="lg:w-80 lg:sticky lg:top-6 lg:self-start">
            <Card className="shadow-card gradient-card border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Projection Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Monthly Investment: ${monthlyInvestment.toLocaleString()}
                    </label>
                    <Slider
                      min={0}
                      max={5000}
                      step={100}
                      value={[monthlyInvestment]}
                      onValueChange={([value]) => setMonthlyInvestment(value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Additional monthly contribution</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Portfolio Growth: {(portfolioGrowthRate * 100).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%
                    </label>
                    <Slider
                      min={0}
                      max={20}
                      step={0.5}
                      value={[portfolioGrowthRate * 100]}
                      onValueChange={([value]) => {
                        const halfStep = Math.round(value * 2) / 2;
                        setPortfolioGrowthRate(halfStep / 100);
                      }}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Expected annual portfolio appreciation</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Dividend Growth: {dividendGrowthRate}%
                    </label>
                    <Slider
                      min={0}
                      max={15}
                      step={0.5}
                      value={[dividendGrowthRate]}
                      onValueChange={([value]) => setDividendGrowthRate(value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Expected annual dividend increase</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Additional Yearly: ${additionalYearlyContribution.toLocaleString()}
                    </label>
                    <Slider
                      min={0}
                      max={50000}
                      step={1000}
                      value={[additionalYearlyContribution]}
                      onValueChange={([value]) => setAdditionalYearlyContribution(value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Extra annual contribution</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={reinvestDividends}
                      onCheckedChange={(checked) => setReinvestDividends(checked as boolean)}
                    />
                    <label className="text-sm font-medium text-foreground">
                      Reinvest Dividends
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p><strong>Key Assumptions:</strong></p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Dividends reinvested automatically</li>
                      <li>Tax implications not included</li>
                      <li>Historical market averages ~7-10%</li>
                      <li>No inflation adjustments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How These Numbers Are Calculated - Now below charts */}
        <Collapsible open={isCalculationOpen} onOpenChange={setIsCalculationOpen} className="mb-8">
          <Card className="border-none shadow-none bg-transparent max-w-3xl mx-auto">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer rounded-md px-0 py-1">
                <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2 justify-center">
                  {isCalculationOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  How these numbers are calculated
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-2 px-0 text-sm text-muted-foreground">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Portfolio Growth Formula
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <strong>Year N Portfolio Value =</strong><br />
                        Previous Year Value × 1.07 (market growth) +<br />
                        Monthly Investment × 12 +<br />
                        Additional Yearly Contribution +<br />
                        Reinvested Dividends (if enabled)
                      </div>
                      <p>
                        We assume a 7% average annual market growth, which is based on historical S&P 500 performance over long periods.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Dividend Calculation
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="bg-muted/30 p-2 rounded-md">
                        <strong>Annual Dividends =</strong><br />
                        Portfolio Value × Current Yield × <br />
                        (1 + Growth Rate)^Year
                      </div>
                      <p>
                        Current yield is calculated from your tracked stocks or defaults to 4% if you haven't added any dividend-paying stocks yet.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Key Assumptions
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-muted/30 p-2 rounded-md">
                      <strong className="text-foreground">Market Growth</strong>
                      <p className="text-muted-foreground mt-1">7% annual average based on historical data</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md">
                      <strong className="text-foreground">Dividend Growth</strong>
                      <p className="text-muted-foreground mt-1">Customizable rate (default 5% annually)</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md">
                      <strong className="text-foreground">Reinvestment</strong>
                      <p className="text-muted-foreground mt-1">Optional dividend reinvestment at market value</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong className="text-amber-800 dark:text-amber-200">Disclaimer:</strong>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        These projections are estimates based on historical patterns and your input parameters. 
                        Actual results will vary due to market volatility, changes in dividend policies, economic conditions, and other factors. 
                        This tool is for educational purposes and should not be considered financial advice.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Projection Assumptions & Recommendations */}
        <Tabs defaultValue="assumptions" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assumptions">Projection Assumptions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="assumptions" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Key Assumptions Used in Projections
                </CardTitle>
                <CardDescription>
                  Understanding the mathematical foundations of your projections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Market & Growth Assumptions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Average Annual Market Growth</span>
                        <Badge>7%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Dividend Growth Rate</span>
                        <Badge>{dividendGrowthRate}%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Initial Portfolio Yield</span>
                        <Badge>{currentMetrics.portfolioYield > 0 ? `${currentMetrics.portfolioYield.toFixed(2)}%` : '4% (Default)'}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Investment Strategy Assumptions</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Monthly Contributions</span>
                        <Badge>${monthlyInvestment.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Annual Bonus Investments</span>
                        <Badge>${additionalYearlyContribution.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Dividend Reinvestment</span>
                        <Badge variant={reinvestDividends ? "default" : "secondary"}>
                          {reinvestDividends ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Data Sources & Methodology</h5>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Market growth: Based on historical S&P 500 performance (1957-2023)</li>
                    <li>• Dividend yields: Real-time data from financial APIs for your holdings</li>
                    <li>• Growth rates: Conservative estimates based on dividend aristocrats</li>
                    <li>• Reinvestment: Assumes immediate reinvestment at current market price</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Portfolio Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-900 dark:text-green-100">✓ Diversification</h5>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Spread investments across sectors and company sizes to reduce risk
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-900 dark:text-green-100">✓ Dollar-Cost Averaging</h5>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Invest consistently regardless of market conditions to smooth out volatility
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-900 dark:text-green-100">✓ Dividend Growth Focus</h5>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Prioritize companies with a history of growing dividends over time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {trackedStocks.length === 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h5 className="font-medium text-yellow-900 dark:text-yellow-100">📈 Add Your First Stock</h5>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          Start tracking dividend-paying stocks to get personalized projections
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100">🔄 Review Regularly</h5>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Update your projections monthly as your portfolio grows
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h5 className="font-medium text-purple-900 dark:text-purple-100">💰 Increase Contributions</h5>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                        Every $100 increase in monthly investment significantly impacts long-term results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20 shadow-elegant">
          <CardContent className="text-center py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Ready to Build Your Dividend Portfolio?</h2>
                <p className="text-muted-foreground">
                  Start tracking your investments and get personalized projections based on real dividend data.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="min-w-[200px]">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Manage Portfolio
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" onClick={signOut} className="min-w-[150px]">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};