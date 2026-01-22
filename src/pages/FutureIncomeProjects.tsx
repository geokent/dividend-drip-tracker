import React, { useState, useEffect, useMemo } from 'react';
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
import { ProjectionParametersStrip } from "@/components/ProjectionParametersStrip";
import { toast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Brain, 
  BarChart3,
  Zap,
  Star,
  LogOut,
  Flame,
  Trophy,
  Coffee,
  Rocket,
  PartyPopper
} from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, ReferenceLine } from 'recharts';
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
  const [chartMode, setChartMode] = useState<"dividend" | "growth">("dividend");
  const [yearRange, setYearRange] = useState<5 | 10 | 15 | 30>(15);
  const [monthlyExpensesInRetirement, setMonthlyExpensesInRetirement] = useState(4000);
  

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
    
    let portfolioValue = currentMetrics.totalPortfolioValue;
    
    // Use current portfolio yield or default to 4% if no stocks
    const assumedYield = currentMetrics.portfolioYield > 0 ? currentMetrics.portfolioYield / 100 : 0.04;
    
    for (let year = 0; year <= 30; year++) {
      // For year 0, use current values
      if (year === 0) {
        const annualDividends = currentMetrics.totalAnnualDividends;
        data.push({
          year,
          portfolioValue: Math.round(portfolioValue),
          annualDividends: Math.round(annualDividends),
          monthlyIncome: Math.round(annualDividends / 12),
          quarterlyIncome: Math.round(annualDividends / 4)
        });
        continue;
      }

      // Add yearly investments (monthly + additional)
      const yearlyInvestment = monthlyInvestment * 12 + additionalYearlyContribution;
      portfolioValue += yearlyInvestment;
      
      // Apply portfolio growth
      portfolioValue *= (1 + portfolioGrowthRate);
      
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
        quarterlyIncome: Math.round(annualDividends / 4)
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

  // FIRE calculations
  // Custom tooltip for the income chart
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-primary mb-2">Year {label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Monthly Income:</span>
              <span className="font-medium text-financial-green">${data.monthlyIncome?.toLocaleString()}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Annual Income:</span>
              <span className="font-medium">${data.annualDividends?.toLocaleString()}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted-foreground">Portfolio Value:</span>
              <span className="font-medium">${data.portfolioValue?.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
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
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Brain className="h-4 w-4" />
            <span>AI-Powered Analysis</span>
          </div>
          <h1 className="page-title mb-4">
            Future Dividend Income Projections
          </h1>
        </div>

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

            {/* FIRE Year Highlight */}
            {fireCalculations.yearsToFire !== null && fireCalculations.yearsToFire > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-full">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-800 dark:text-green-200">
                      🎯 You'll reach FIRE in Year {fireCalculations.yearsToFire}!
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
        <Card className="card-elevated gradient-card mb-8">
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
          <CardContent className="pb-4 relative">
            <div className="h-[280px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                  {chartMode === "dividend" ? (
                   <AreaChart 
                     key={chartKey}
                     data={chartData}
                     margin={{ top: 24, right: 16, left: 20, bottom: 24 }}
                   >
                     <defs>
                       <linearGradient id="monthlyIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
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
                     <Area 
                       type="monotone" 
                       dataKey="monthlyIncome" 
                       stroke="hsl(var(--primary))"
                       strokeWidth={2}
                       fill="url(#monthlyIncomeGradient)"
                       dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                       activeDot={{ r: 6, strokeWidth: 2 }}
                     />
                  </AreaChart>
                ) : (
                   <LineChart 
                     key={chartKey}
                     data={chartData}
                     margin={{ top: 8, right: 16, left: 20, bottom: 24 }}
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
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         border: '1px solid hsl(var(--primary))',
                         borderRadius: '8px',
                         boxShadow: 'var(--shadow-card)',
                         fontSize: 12
                       }}
                       formatter={(value: number, name: string) => [
                         `$${value.toLocaleString()}`, 
                         name === 'portfolioValue' ? 'Portfolio Value' : 'Annual Dividends'
                       ]}
                       labelFormatter={(label) => `Year ${label}`}
                       labelStyle={{ fontSize: 12, color: 'hsl(var(--primary))' }}
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
                       stroke="#2563eb" 
                       strokeWidth={2}
                       strokeDasharray="5 5"
                       dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                     />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
          
          {/* Year Range Selector integrated into chart footer */}
          <CardFooter className="pt-4 border-t border-border bg-secondary/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {([5, 10, 15, 30] as const).map((years) => (
                <button 
                  key={years}
                  onClick={() => setYearRange(years)}
                  className={`text-center p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                    yearRange === years 
                      ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                      : 'bg-card border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-sm font-medium text-muted-foreground mb-1">{years} Years</div>
                  <div className={`text-lg font-bold ${yearRange === years ? 'text-primary' : 'text-foreground'}`}>
                    ${projectionData[years]?.portfolioValue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-financial-green font-medium">
                    ${projectionData[years]?.monthlyIncome?.toLocaleString() || '0'}/mo
                  </div>
                </button>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* Explanatory Text - moved from header */}
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <span className="block">AI-powered projections based on your current portfolio.</span>
            <span className="block">Customize parameters below to see how different strategies affect your long-term income.</span>
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
                        <Badge>{(portfolioGrowthRate * 100).toFixed(1)}%</Badge>
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

      </div>

      <Footer />
    </div>
  );
};