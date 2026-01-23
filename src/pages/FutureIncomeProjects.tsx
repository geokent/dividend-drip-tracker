import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectionParametersStrip } from "@/components/ProjectionParametersStrip";
import { toast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Brain, 
  BarChart3,
  Flame,
  Trophy,
  RefreshCw,
  Check,
  ZoomIn,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, Brush } from 'recharts';
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
  const { user } = useAuth();
  const [trackedStocks, setTrackedStocks] = useState<TrackedStock[]>([]);
  const [monthlyInvestment, setMonthlyInvestment] = useState(0);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(5);
  const [portfolioGrowthRate, setPortfolioGrowthRate] = useState(0.07); // 7% default
  const [additionalYearlyContribution, setAdditionalYearlyContribution] = useState(0);
  const [reinvestDividends, setReinvestDividends] = useState(true);
  const [chartMode, setChartMode] = useState<"dividend" | "growth">("dividend");
  const [yearRange, setYearRange] = useState<5 | 10 | 15 | 30>(15);
  const [monthlyExpensesInRetirement, setMonthlyExpensesInRetirement] = useState(4000);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Chart interactivity state
  const [visibleSeries, setVisibleSeries] = useState({
    monthlyIncome: true,
    portfolioValue: true,
    contributions: false,
    sp500Comparison: false
  });
  const [chartZoomRange, setChartZoomRange] = useState<{ startIndex?: number; endIndex?: number }>({});
  
  // Confetti celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  // Scenario configurations
  const scenarios = [
    {
      id: 'conservative',
      name: 'Conservative',
      portfolioGrowth: 0.05,  // 5%
      dividendGrowth: 3,       // 3%
      description: 'Lower risk, steady growth'
    },
    {
      id: 'moderate',
      name: 'Moderate',
      portfolioGrowth: 0.07,  // 7%
      dividendGrowth: 5,       // 5%
      description: 'Balanced approach'
    },
    {
      id: 'aggressive',
      name: 'Aggressive',
      portfolioGrowth: 0.10,  // 10%
      dividendGrowth: 7,       // 7%
      description: 'Higher risk, higher potential'
    }
  ];
  

  // Load tracked stocks and connected accounts from Supabase database
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        // Load tracked stocks
        const { data: stocksData, error: stocksError } = await supabase
          .from('user_stocks')
          .select('*')
          .eq('user_id', user.id);

        if (stocksError) {
          console.error('Error loading tracked stocks:', stocksError);
        } else if (stocksData) {
          // Find the most recent updated_at timestamp
          if (stocksData.length > 0) {
            const mostRecent = stocksData.reduce((latest, stock) => {
              const stockDate = new Date(stock.updated_at || stock.created_at);
              return stockDate > latest ? stockDate : latest;
            }, new Date(0));
            setLastUpdated(mostRecent);
          }
          
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

      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
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
    
    let portfolioValue = currentMetrics.totalPortfolioValue;
    
    // Use current portfolio yield or default to 4% if no stocks
    const assumedYield = currentMetrics.portfolioYield > 0 ? currentMetrics.portfolioYield / 100 : 0.04;
    
    // Track S&P 500 benchmark and cumulative contributions
    let sp500Value = currentMetrics.totalPortfolioValue;
    let cumulativeContributions = 0;
    const SP500_GROWTH_RATE = 0.07; // 7% historical average
    
    for (let year = 0; year <= 30; year++) {
      // For year 0, use current values
      if (year === 0) {
        const annualDividends = currentMetrics.totalAnnualDividends;
        data.push({
          year,
          portfolioValue: Math.round(portfolioValue),
          annualDividends: Math.round(annualDividends),
          monthlyIncome: Math.round(annualDividends / 12),
          quarterlyIncome: Math.round(annualDividends / 4),
          cumulativeContributions: Math.round(currentMetrics.totalPortfolioValue),
          sp500Value: Math.round(sp500Value)
        });
        continue;
      }

      // Add yearly investments (monthly + additional)
      const yearlyInvestment = monthlyInvestment * 12 + additionalYearlyContribution;
      portfolioValue += yearlyInvestment;
      cumulativeContributions += yearlyInvestment;
      
      // Apply portfolio growth
      portfolioValue *= (1 + portfolioGrowthRate);
      
      // S&P 500 benchmark calculation (same contributions, 7% growth, no dividends)
      sp500Value += yearlyInvestment;
      sp500Value *= (1 + SP500_GROWTH_RATE);
      
      // Calculate dividends based on new portfolio value
      let annualDividends = portfolioValue * assumedYield;
      
      // Apply dividend growth
      annualDividends *= Math.pow(1 + dividendGrowthRate / 100, year);
      
      // Add reinvested dividends to portfolio for next year
      if (reinvestDividends) {
        portfolioValue += annualDividends;
      }

      data.push({
        year,
        portfolioValue: Math.round(portfolioValue),
        annualDividends: Math.round(annualDividends),
        monthlyIncome: Math.round(annualDividends / 12),
        quarterlyIncome: Math.round(annualDividends / 4),
        cumulativeContributions: Math.round(currentMetrics.totalPortfolioValue + cumulativeContributions),
        sp500Value: Math.round(sp500Value)
      });
    }
    
    return data;
  };

  const projectionData = useMemo(() => {
    return generateProjectionData();
  }, [trackedStocks, monthlyInvestment, dividendGrowthRate, portfolioGrowthRate, additionalYearlyContribution, reinvestDividends]);
  
  // Filter out Year 0 and limit to selected year range for chart display
  const chartData = useMemo(() => {
    return projectionData.filter(data => data.year > 0 && data.year <= yearRange);
  }, [projectionData, yearRange]);
  
  // Create a key for forcing chart re-renders
  const chartKey = `${monthlyInvestment}-${dividendGrowthRate}-${portfolioGrowthRate}-${additionalYearlyContribution}-${reinvestDividends}`;
  
  const currentMetrics = calculateCurrentMetrics();

  // Custom tooltip for the income chart - enhanced with all visible series
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-lg min-w-[220px]">
          <p className="font-semibold text-primary mb-2">Year {label}</p>
          <div className="space-y-1.5 text-sm">
            {visibleSeries.monthlyIncome && (
              <p className="flex justify-between gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-muted-foreground">Monthly Income:</span>
                </span>
                <span className="font-medium text-financial-green">${data.monthlyIncome?.toLocaleString()}</span>
              </p>
            )}
            {visibleSeries.portfolioValue && (
              <p className="flex justify-between gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-blue-500" />
                  <span className="text-muted-foreground">Portfolio Value:</span>
                </span>
                <span className="font-medium">${data.portfolioValue?.toLocaleString()}</span>
              </p>
            )}
            {visibleSeries.contributions && (
              <p className="flex justify-between gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                  <span className="text-muted-foreground">Contributions:</span>
                </span>
                <span className="font-medium">${data.cumulativeContributions?.toLocaleString()}</span>
              </p>
            )}
            {visibleSeries.sp500Comparison && (
              <p className="flex justify-between gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm border border-dashed border-orange-500" />
                  <span className="text-muted-foreground">S&P 500:</span>
                </span>
                <span className="font-medium text-orange-500">${data.sp500Value?.toLocaleString()}</span>
              </p>
            )}
          </div>
          {/* Comparison insight */}
          {visibleSeries.sp500Comparison && visibleSeries.portfolioValue && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className={`text-xs font-medium ${
                data.portfolioValue > data.sp500Value ? 'text-green-600' : 'text-orange-600'
              }`}>
                {data.portfolioValue > data.sp500Value 
                  ? `+$${(data.portfolioValue - data.sp500Value).toLocaleString()} vs S&P 500`
                  : `-$${(data.sp500Value - data.portfolioValue).toLocaleString()} vs S&P 500`
                }
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Interactive legend toggle component
  const ChartLegendToggle = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setVisibleSeries(prev => ({ ...prev, monthlyIncome: !prev.monthlyIncome }))}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm ${
          visibleSeries.monthlyIncome 
            ? 'bg-primary/10 border-primary text-primary' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        <div className={`w-3 h-3 rounded-sm ${visibleSeries.monthlyIncome ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <span className="font-medium">Monthly Income</span>
        {visibleSeries.monthlyIncome && <Check className="h-3 w-3" />}
      </button>
      
      <button
        onClick={() => setVisibleSeries(prev => ({ ...prev, portfolioValue: !prev.portfolioValue }))}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm ${
          visibleSeries.portfolioValue 
            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        <div className={`w-3 h-3 rounded-sm ${visibleSeries.portfolioValue ? 'bg-blue-500' : 'bg-muted-foreground/30'}`} />
        <span className="font-medium">Portfolio Value</span>
        {visibleSeries.portfolioValue && <Check className="h-3 w-3" />}
      </button>
      
      <button
        onClick={() => setVisibleSeries(prev => ({ ...prev, contributions: !prev.contributions }))}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm ${
          visibleSeries.contributions 
            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        <div className={`w-3 h-3 rounded-sm ${visibleSeries.contributions ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
        <span className="font-medium">Contributions</span>
        {visibleSeries.contributions && <Check className="h-3 w-3" />}
      </button>
      
      <button
        onClick={() => setVisibleSeries(prev => ({ ...prev, sp500Comparison: !prev.sp500Comparison }))}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm ${
          visibleSeries.sp500Comparison 
            ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400' 
            : 'bg-muted/50 border-muted-foreground/30 text-muted-foreground'
        }`}
      >
        <div className={`w-3 h-3 rounded-sm border-2 border-dashed ${visibleSeries.sp500Comparison ? 'border-orange-500' : 'border-muted-foreground/30'}`} />
        <span className="font-medium">S&P 500 (7%)</span>
        {visibleSeries.sp500Comparison && <Check className="h-3 w-3" />}
      </button>
    </div>
  );

  // Scroll to chart and set year range
  const handleMilestoneClick = (years: 5 | 10 | 15 | 30) => {
    setYearRange(years);
    setChartZoomRange({}); // Reset zoom when changing year range
    document.querySelector('[data-chart-container]')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  const fireCalculations = useMemo(() => {
    const annualExpenses = monthlyExpensesInRetirement * 12;
    
    // Traditional FIRE Number (4% rule = 25x annual expenses)
    const fireNumber = annualExpenses / 0.04;
    
    // Dividend FIRE Number (based on current portfolio yield)
    const currentYield = currentMetrics.portfolioYield > 0 ? currentMetrics.portfolioYield / 100 : 0.04;
    const dividendFireNumber = annualExpenses / currentYield;
    
    // Current monthly dividend income
    const currentMonthlyDividends = currentMetrics.totalAnnualDividends / 12;
    
    // Progress percentage
    const progressPercentage = Math.min((currentMonthlyDividends / monthlyExpensesInRetirement) * 100, 100);
    
    // Find year when FIRE is reached (monthly dividends >= monthly expenses)
    let yearsToFire: number | null = null;
    for (let i = 0; i < projectionData.length; i++) {
      if (projectionData[i].monthlyIncome >= monthlyExpensesInRetirement) {
        yearsToFire = projectionData[i].year;
        break;
      }
    }
    
    // Determine milestone badge
    let milestone: { label: string; emoji: string; color: string } | null = null;
    if (progressPercentage >= 100) {
      milestone = { label: "FIRE Achieved!", emoji: "🎉", color: "bg-yellow-500" };
    } else if (progressPercentage >= 75) {
      milestone = { label: "Almost There!", emoji: "🚀", color: "bg-purple-500" };
    } else if (progressPercentage >= 50) {
      milestone = { label: "Barista FIRE", emoji: "☕", color: "bg-orange-500" };
    } else if (progressPercentage >= 25) {
      milestone = { label: "Coast FIRE", emoji: "🏖️", color: "bg-blue-500" };
    }
    
    return {
      fireNumber,
      dividendFireNumber,
      currentMonthlyDividends,
      progressPercentage,
      yearsToFire,
      milestone,
      annualExpenses
    };
  }, [monthlyExpensesInRetirement, currentMetrics, projectionData]);

  // Trigger confetti when FIRE is first calculated
  useEffect(() => {
    if (fireCalculations.yearsToFire !== null && !hasShownConfetti && !isLoading) {
      setShowConfetti(true);
      setHasShownConfetti(true);
    }
  }, [fireCalculations.yearsToFire, hasShownConfetti, isLoading]);

  // Calculate projections for each scenario
  const scenarioCalculations = useMemo(() => {
    return scenarios.map(scenario => {
      const metrics = calculateCurrentMetrics();
      let portfolioValue = metrics.totalPortfolioValue;
      const assumedYield = metrics.portfolioYield > 0 ? metrics.portfolioYield / 100 : 0.04;
      
      // Calculate 10-year projection for this scenario
      for (let year = 1; year <= 10; year++) {
        const yearlyInvestment = monthlyInvestment * 12 + additionalYearlyContribution;
        portfolioValue += yearlyInvestment;
        portfolioValue *= (1 + scenario.portfolioGrowth);
        
        let annualDividends = portfolioValue * assumedYield;
        annualDividends *= Math.pow(1 + scenario.dividendGrowth / 100, year);
        
        if (reinvestDividends) {
          portfolioValue += annualDividends;
        }
      }
      
      // Calculate 10-year monthly income
      const finalAnnualDividends = portfolioValue * assumedYield * Math.pow(1 + scenario.dividendGrowth / 100, 10);
      const tenYearMonthlyIncome = Math.round(finalAnnualDividends / 12);
      
      // Calculate years to FIRE for this scenario
      let yearsToFire: number | null = null;
      let tempPortfolio = metrics.totalPortfolioValue;
      
      for (let year = 1; year <= 30; year++) {
        const yearlyInvestment = monthlyInvestment * 12 + additionalYearlyContribution;
        tempPortfolio += yearlyInvestment;
        tempPortfolio *= (1 + scenario.portfolioGrowth);
        
        let annualDividends = tempPortfolio * assumedYield;
        annualDividends *= Math.pow(1 + scenario.dividendGrowth / 100, year);
        
        if (reinvestDividends) {
          tempPortfolio += annualDividends;
        }
        
        if (annualDividends / 12 >= monthlyExpensesInRetirement && yearsToFire === null) {
          yearsToFire = year;
          break;
        }
      }
      
      // Check if this matches current user settings
      const isCurrentSettings = 
        Math.abs(scenario.portfolioGrowth - portfolioGrowthRate) < 0.001 &&
        scenario.dividendGrowth === dividendGrowthRate;
      
      return {
        ...scenario,
        tenYearMonthlyIncome,
        yearsToFire,
        isCurrentSettings
      };
    });
  }, [trackedStocks, monthlyInvestment, additionalYearlyContribution, reinvestDividends, portfolioGrowthRate, dividendGrowthRate, monthlyExpensesInRetirement]);

  // Apply scenario settings
  const applyScenario = (scenario: typeof scenarios[0]) => {
    setPortfolioGrowthRate(scenario.portfolioGrowth);
    setDividendGrowthRate(scenario.dividendGrowth);
    
    toast({
      title: `${scenario.name} Scenario Applied`,
      description: `Portfolio growth set to ${(scenario.portfolioGrowth * 100).toFixed(0)}% and dividend growth to ${scenario.dividendGrowth}%`,
    });
  };

  // Handle portfolio refresh
  const handleRefreshPortfolio = async () => {
    if (isRefreshing || !user) return;
    
    setIsRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('refresh-stock-prices', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      // Reload stock data
      const { data: stocksData, error: stocksError } = await supabase
        .from('user_stocks')
        .select('*')
        .eq('user_id', user.id);
        
      if (stocksError) throw stocksError;
      
      if (stocksData) {
        if (stocksData.length > 0) {
          const mostRecent = stocksData.reduce((latest, stock) => {
            const stockDate = new Date(stock.updated_at || stock.created_at);
            return stockDate > latest ? stockDate : latest;
          }, new Date(0));
          setLastUpdated(mostRecent);
        }
        
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
        title: "Portfolio Refreshed",
        description: "Your stock prices and dividend data have been updated.",
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh portfolio data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to format "X minutes ago"
  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <>
        <SEOHead
          title="Sign In Required | DivTrkr"
          description="Please sign in to access your dividend projections"
          noIndex={true}
        />
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
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Future Dividend Income Projections - Plan Your Financial Freedom | DivTrkr"
        description="Project your future dividend income with AI-powered analysis. Visualize portfolio growth, estimate passive income, and plan your path to financial independence."
        keywords="dividend projections, future income calculator, dividend growth forecast, passive income planning, portfolio projections, FIRE calculator"
        canonicalUrl="https://www.divtrkr.com/future-income-projections"
      />
      <Header />

      <div className="container section-y space-y-8">
        {/* Confetti Celebration */}
        <ConfettiCelebration show={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/20 via-purple-500/15 to-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-md border border-primary/20 cursor-help hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <Brain className="h-5 w-5" />
                    <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
                  </div>
                  <span>AI-Powered Analysis</span>
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 ml-1">
                    BETA
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-center p-3">
                <p className="font-medium mb-1">Intelligent Projections</p>
                <p className="text-sm text-muted-foreground">
                  Calculated using your actual portfolio holdings and historical dividend growth rates from your tracked stocks.
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <h1 className="page-title mb-4">
            Future Dividend Income Projections
          </h1>
        </div>

        {/* Current Portfolio Summary Card */}
        <Card className="card-elevated border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/5 mb-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="card-title flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Your Current Portfolio
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Where you are now — the starting point for your projections
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshPortfolio}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Starting Portfolio Value */}
              <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Starting Portfolio Value</div>
                <div className="text-xl md:text-2xl font-bold text-primary">
                  ${currentMetrics.totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              
              {/* Current Monthly Income */}
              <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Monthly Dividend Income</div>
                <div className="text-xl md:text-2xl font-bold text-financial-green">
                  ${(currentMetrics.totalAnnualDividends / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              
              {/* Current Annual Yield */}
              <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Annual Yield</div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {currentMetrics.portfolioYield.toFixed(2)}%
                </div>
              </div>
              
              {/* Total Holdings */}
              <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Total Holdings</div>
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {currentMetrics.uniqueStocks} stock{currentMetrics.uniqueStocks !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Last Updated */}
              <div className="p-4 bg-card rounded-lg border border-border shadow-sm col-span-2 md:col-span-1">
                <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                <div className="text-lg font-medium text-muted-foreground">
                  {formatTimeAgo(lastUpdated)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FIRE Calculator Section */}
        <Card className="card-elevated gradient-card mb-8 border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="card-title flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Your Path to Financial Independence
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Calculate when your dividends will cover your expenses
                </CardDescription>
              </div>
              {fireCalculations.milestone && (
                <Badge 
                  className={`${fireCalculations.milestone.color} text-white px-3 py-1 text-sm font-semibold`}
                >
                  {fireCalculations.milestone.emoji} {fireCalculations.milestone.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Expenses Input */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-secondary/30 rounded-lg">
              <Label htmlFor="monthly-expenses" className="text-sm font-medium whitespace-nowrap">
                Monthly Expenses in Retirement:
              </Label>
              <div className="relative flex-1 max-w-xs">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthly-expenses"
                  type="number"
                  value={monthlyExpensesInRetirement}
                  onChange={(e) => setMonthlyExpensesInRetirement(Math.max(0, parseInt(e.target.value) || 0))}
                  className="pl-8"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* FIRE Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-xs text-muted-foreground mb-1">FIRE Number (4% Rule)</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${fireCalculations.fireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">25× annual expenses</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">Dividend FIRE Number</div>
                <div className="text-2xl font-bold text-primary">
                  ${fireCalculations.dividendFireNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {currentMetrics.portfolioYield > 0 ? `${currentMetrics.portfolioYield.toFixed(1)}%` : '4%'} yield
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-xs text-muted-foreground mb-1">Years to FIRE</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {fireCalculations.yearsToFire !== null 
                    ? fireCalculations.yearsToFire === 0 
                      ? "Now! 🎉" 
                      : `${fireCalculations.yearsToFire} years`
                    : "15+ years"
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">Based on current projections</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-muted-foreground mb-1">Monthly Dividends Needed</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${monthlyExpensesInRetirement.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">To cover all expenses</div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress to FIRE</span>
                <span className="text-sm font-bold text-primary">
                  {fireCalculations.progressPercentage.toFixed(1)}%
                </span>
              </div>
              
              {/* Progress Bar with milestones */}
              <div className="relative">
                <Progress value={fireCalculations.progressPercentage} className="h-4" />
                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-4 pointer-events-none">
                  <div className="absolute left-[25%] top-0 h-full w-0.5 bg-blue-400/50" title="25% - Coast FIRE" />
                  <div className="absolute left-[50%] top-0 h-full w-0.5 bg-orange-400/50" title="50% - Barista FIRE" />
                  <div className="absolute left-[75%] top-0 h-full w-0.5 bg-purple-400/50" title="75% - Almost There" />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-semibold text-primary">
                    ${fireCalculations.currentMonthlyDividends.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Goal:</span>
                  <span className="font-semibold text-foreground">
                    ${monthlyExpensesInRetirement.toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* Milestone Badges */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className={`p-2 rounded-lg text-center transition-all ${
                  fireCalculations.progressPercentage >= 25 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400' 
                    : 'bg-muted/50 border border-border opacity-50'
                }`}>
                  <div className="text-lg">🏖️</div>
                  <div className="text-xs font-medium">Coast FIRE</div>
                  <div className="text-xs text-muted-foreground">25%</div>
                </div>
                <div className={`p-2 rounded-lg text-center transition-all ${
                  fireCalculations.progressPercentage >= 50 
                    ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400' 
                    : 'bg-muted/50 border border-border opacity-50'
                }`}>
                  <div className="text-lg">☕</div>
                  <div className="text-xs font-medium">Barista FIRE</div>
                  <div className="text-xs text-muted-foreground">50%</div>
                </div>
                <div className={`p-2 rounded-lg text-center transition-all ${
                  fireCalculations.progressPercentage >= 75 
                    ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400' 
                    : 'bg-muted/50 border border-border opacity-50'
                }`}>
                  <div className="text-lg">🚀</div>
                  <div className="text-xs font-medium">Almost There!</div>
                  <div className="text-xs text-muted-foreground">75%</div>
                </div>
                <div className={`p-2 rounded-lg text-center transition-all ${
                  fireCalculations.progressPercentage >= 100 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400' 
                    : 'bg-muted/50 border border-border opacity-50'
                }`}>
                  <div className="text-lg">🎉</div>
                  <div className="text-xs font-medium">FIRE Achieved!</div>
                  <div className="text-xs text-muted-foreground">100%</div>
                </div>
              </div>
            </div>

            {/* FIRE Year Highlight with Celebration */}
            {fireCalculations.yearsToFire !== null && fireCalculations.yearsToFire > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 border-2 border-green-500/30 animate-pulse-gentle">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg animate-bounce-gentle">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-green-800 dark:text-green-200 flex items-center gap-2 flex-wrap">
                      You'll reach FIRE in Year {fireCalculations.yearsToFire}!
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                        Milestone
                      </Badge>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Your projected monthly dividends will cover ${monthlyExpensesInRetirement.toLocaleString()} in expenses
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Chart - Full Width */}
        <Card className="card-elevated gradient-card mb-8" data-chart-container>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="card-title flex items-center gap-2">
                  {chartMode === "dividend" ? (
                    <>
                      <DollarSign className="h-5 w-5 text-primary" />
                      Monthly Income Projection
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Portfolio Growth Projection
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {chartMode === "dividend" 
                    ? "Monthly dividend income and growth over time"
                    : "Portfolio value and annual dividend income over time"
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
          <CardContent className="pb-4 relative">
            {/* Interactive Legend */}
            <ChartLegendToggle />
            
            <div className="h-[320px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "dividend" ? (
                   <AreaChart 
                     key={chartKey}
                     data={chartData}
                     margin={{ top: 24, right: 16, left: 20, bottom: 60 }}
                   >
                     <defs>
                       <linearGradient id="monthlyIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                       </linearGradient>
                       <linearGradient id="contributionsGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                     <XAxis 
                       dataKey="year" 
                       stroke="hsl(var(--primary))"
                       tick={{ fontSize: 12 }}
                       tickLine={{ stroke: 'hsl(var(--primary))' }}
                       axisLine={{ stroke: 'hsl(var(--primary))' }}
                       label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'hsl(var(--primary))' } }}
                       interval="preserveStartEnd"
                     />
                     <YAxis 
                       width={72}
                       tickMargin={4}
                       tick={{ fontSize: 10, fill: 'hsl(var(--primary))' }}
                       stroke="hsl(var(--primary))"
                       tickLine={{ stroke: 'hsl(var(--primary))' }}
                       axisLine={{ stroke: 'hsl(var(--primary))' }}
                       tickFormatter={(value) => `$${value.toLocaleString()}`}
                     />
                     
                     {/* FIRE Milestone Reference Line */}
                     {fireCalculations.yearsToFire !== null && fireCalculations.yearsToFire <= yearRange && (
                       <ReferenceLine 
                         x={fireCalculations.yearsToFire} 
                         stroke="#22c55e" 
                         strokeWidth={2}
                         strokeDasharray="4 4"
                          label={{ 
                            value: `FIRE (Year ${fireCalculations.yearsToFire})`, 
                            position: 'insideTopRight',
                            fill: '#22c55e',
                            fontSize: 11,
                            fontWeight: 600,
                            offset: 10
                          }}
                       />
                     )}
                     
                     <Tooltip content={<CustomChartTooltip />} />
                     
                     {/* Monthly Income - Primary data */}
                     {visibleSeries.monthlyIncome && (
                       <Area 
                         type="monotone" 
                         dataKey="monthlyIncome" 
                         stroke="hsl(var(--primary))"
                         strokeWidth={2}
                         fill="url(#monthlyIncomeGradient)"
                         dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                         activeDot={{ r: 6, strokeWidth: 2 }}
                       />
                     )}
                     
                     {/* S&P 500 Comparison - Dashed orange line */}
                     {visibleSeries.sp500Comparison && (
                       <Line 
                         type="monotone" 
                         dataKey="sp500Value" 
                         stroke="#f97316"
                         strokeWidth={2}
                         strokeDasharray="5 5"
                         dot={false}
                         name="S&P 500"
                       />
                     )}
                     
                     {/* Brush for zoom capability */}
                     <Brush 
                       dataKey="year" 
                       height={30} 
                       stroke="hsl(var(--primary))"
                       fill="hsl(var(--secondary))"
                       tickFormatter={(value) => `Y${value}`}
                     />
                  </AreaChart>
                ) : (
                   <LineChart 
                     key={chartKey}
                     data={chartData}
                     margin={{ top: 8, right: 16, left: 20, bottom: 60 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        stroke="hsl(var(--primary))"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--primary))' }}
                        axisLine={{ stroke: 'hsl(var(--primary))' }}
                        label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: 'hsl(var(--primary))' } }}
                      />
                     <YAxis 
                       width={72}
                       tickMargin={4}
                       tick={{ fontSize: 10, fill: 'hsl(var(--primary))' }}
                       stroke="hsl(var(--primary))"
                       tickLine={{ stroke: 'hsl(var(--primary))' }}
                       axisLine={{ stroke: 'hsl(var(--primary))' }}
                       tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                     />
                     <Tooltip content={<CustomChartTooltip />} />
                     
                     {/* Portfolio Value - Primary line */}
                     {visibleSeries.portfolioValue && (
                       <Line 
                         type="monotone" 
                         dataKey="portfolioValue" 
                         stroke="#3b82f6" 
                         strokeWidth={3}
                         dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                         name="Portfolio Value"
                       />
                     )}
                     
                     {/* Contributions Line */}
                     {visibleSeries.contributions && (
                       <Line 
                         type="monotone" 
                         dataKey="cumulativeContributions" 
                         stroke="#10b981"
                         strokeWidth={2}
                         dot={false}
                         name="Contributions"
                       />
                     )}
                     
                     {/* S&P 500 Comparison - Dashed orange line */}
                     {visibleSeries.sp500Comparison && (
                       <Line 
                         type="monotone" 
                         dataKey="sp500Value" 
                         stroke="#f97316"
                         strokeWidth={2}
                         strokeDasharray="5 5"
                         dot={false}
                         name="S&P 500"
                       />
                     )}
                     
                     {/* Monthly Income overlay */}
                     {visibleSeries.monthlyIncome && (
                       <Line 
                         type="monotone" 
                         dataKey="annualDividends" 
                         stroke="hsl(var(--primary))" 
                         strokeWidth={2}
                         strokeDasharray="3 3"
                         dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                         name="Annual Dividends"
                       />
                     )}
                     
                     {/* Brush for zoom capability */}
                     <Brush 
                       dataKey="year" 
                       height={30} 
                       stroke="hsl(var(--primary))"
                       fill="hsl(var(--secondary))"
                       tickFormatter={(value) => `Y${value}`}
                     />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* Zoom hint */}
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
              <ZoomIn className="h-3 w-3" />
              <span>Drag the slider below the chart to zoom into a specific time range</span>
            </div>
          </CardContent>
          
          {/* Year Range Selector integrated into chart footer */}
          <CardFooter className="pt-4 border-t border-border bg-secondary/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {([5, 10, 15, 30] as const).map((years) => {
                const getGradient = () => {
                  switch (years) {
                    case 5: return 'from-blue-500/15 via-blue-400/5 to-cyan-500/15 border-blue-300/50 dark:border-blue-600/50';
                    case 10: return 'from-green-500/15 via-emerald-400/5 to-teal-500/15 border-green-300/50 dark:border-green-600/50';
                    case 15: return 'from-purple-500/15 via-violet-400/5 to-indigo-500/15 border-purple-300/50 dark:border-purple-600/50';
                    case 30: return 'from-amber-500/15 via-orange-400/5 to-yellow-500/15 border-amber-300/50 dark:border-amber-600/50';
                    default: return '';
                  }
                };
                const getEmoji = () => {
                  switch (years) {
                    case 5: return '🎯';
                    case 10: return '📈';
                    case 15: return '🚀';
                    case 30: return '🏆';
                    default: return '';
                  }
                };
                return (
                  <button 
                    key={years}
                    onClick={() => handleMilestoneClick(years)}
                    className={`text-center p-4 rounded-xl border-2 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-gradient-to-br ${getGradient()} ${
                      yearRange === years 
                        ? 'ring-2 ring-primary/30 shadow-primary/20' 
                        : 'hover:border-opacity-80'
                    }`}
                  >
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-center gap-1">
                      <span>{getEmoji()}</span>
                      <span>{years} Years</span>
                    </div>
                    <div className={`text-lg font-bold ${yearRange === years ? 'text-primary' : 'text-foreground'}`}>
                      ${projectionData[years]?.portfolioValue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-financial-green font-medium">
                      ${projectionData[years]?.monthlyIncome?.toLocaleString() || '0'}/mo
                    </div>
                  </button>
                );
              })}
            </div>
          </CardFooter>
        </Card>

        {/* Explanatory Text - moved from header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 px-4 py-2 rounded-lg mb-3">
            <div className="flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-primary">Powered by your real portfolio data</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Customize the parameters below to explore different investment strategies and see their impact on your long-term dividend income.
          </p>
        </div>

        {/* Projection Parameters Strip */}
        <ProjectionParametersStrip
          monthlyInvestment={monthlyInvestment}
          setMonthlyInvestment={setMonthlyInvestment}
          portfolioGrowthRate={portfolioGrowthRate}
          setPortfolioGrowthRate={setPortfolioGrowthRate}
          dividendGrowthRate={dividendGrowthRate}
          setDividendGrowthRate={setDividendGrowthRate}
          additionalYearlyContribution={additionalYearlyContribution}
          setAdditionalYearlyContribution={setAdditionalYearlyContribution}
          reinvestDividends={reinvestDividends}
          setReinvestDividends={setReinvestDividends}
        />

        {/* Compare Scenarios Section */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <CardTitle className="card-title flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Compare Scenarios
            </CardTitle>
            <CardDescription>
              See how different growth assumptions affect your long-term income
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border">
                    <CardHeader className="pb-2 pt-4">
                      <Skeleton className="h-6 w-24 mx-auto" />
                      <Skeleton className="h-4 w-32 mx-auto mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-px w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-full mt-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {scenarioCalculations.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    className={`relative transition-all ${
                      scenario.isCurrentSettings 
                        ? 'border-2 border-primary ring-2 ring-primary/20 bg-primary/5' 
                        : 'border border-border hover:border-primary/50'
                    }`}
                  >
                    {scenario.isCurrentSettings && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                        Your Current Settings
                      </Badge>
                    )}
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-lg text-center">
                        {scenario.name}
                      </CardTitle>
                      <CardDescription className="text-center text-xs">
                        {scenario.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Portfolio Growth:</span>
                          <span className="font-medium">{(scenario.portfolioGrowth * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Growth:</span>
                          <span className="font-medium">{scenario.dividendGrowth}%</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">10 Year Income:</span>
                          <span className="font-bold text-financial-green">
                            ${scenario.tenYearMonthlyIncome.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Years to FIRE:</span>
                          <span className="font-bold text-primary">
                            {scenario.yearsToFire !== null ? `${scenario.yearsToFire} years` : '30+ years'}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        variant={scenario.isCurrentSettings ? "secondary" : "outline"}
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => applyScenario(scenario)}
                        disabled={scenario.isCurrentSettings}
                      >
                        {scenario.isCurrentSettings ? 'Currently Active' : 'Use This Scenario'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Range explanation */}
            <div className="bg-secondary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Based on historical data</span>, your actual results will likely fall between the Conservative and Aggressive scenarios. 
                The Moderate scenario reflects typical long-term market averages.
              </p>
            </div>
          </CardContent>
        </Card>


      </div>

      <Footer />
    </div>
  );
};