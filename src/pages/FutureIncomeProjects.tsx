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
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Brain, 
  BarChart3,
  Zap,
  Star,
  Home,
  LogOut
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
  const [chartMode, setChartMode] = useState<"dividend" | "growth">("dividend");
  const [yearRange, setYearRange] = useState<5 | 10 | 15>(5);
  

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
    
    for (let year = 0; year <= 15; year++) {
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

        {/* Main Chart - Full Width */}
        <Card className="card-elevated gradient-card mb-8">
          <CardHeader className={`pb-4 ${chartMode === "dividend" ? "hidden" : ""}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="card-title flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Portfolio Growth Projection
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Portfolio value and annual dividend income over 15 years
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
          {chartMode === "dividend" && (
            <div className="flex justify-between items-center p-4 pb-2">
              <div></div>
              <Tabs value={chartMode} onValueChange={(value) => setChartMode(value as "dividend" | "growth")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dividend" className="text-xs">Monthly Income</TabsTrigger>
                  <TabsTrigger value="growth" className="text-xs">Portfolio Growth</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          <CardContent className="pb-4 relative">
            <div className="h-[280px] md:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                 {chartMode === "dividend" ? (
                   <BarChart 
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
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         border: '1px solid hsl(var(--primary))',
                         borderRadius: '8px',
                         boxShadow: 'var(--shadow-card)',
                         fontSize: 12
                       }}
                       formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Income']}
                       labelFormatter={(label) => `Year ${label}`}
                       labelStyle={{ fontSize: 12, color: 'hsl(var(--primary))' }}
                     />
                    <Bar 
                      dataKey="monthlyIncome" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={12}
                    />
                  </BarChart>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <button 
                onClick={() => setYearRange(5)}
                className={`text-center p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                  yearRange === 5 
                    ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                    : 'bg-card border-border hover:bg-secondary/50'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">5 Years</div>
                <div className={`text-lg font-bold ${yearRange === 5 ? 'text-primary' : 'text-foreground'}`}>
                  ${projectionData[5]?.portfolioValue?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-financial-green font-medium">
                  ${projectionData[5]?.monthlyIncome?.toLocaleString() || '0'}/mo
                </div>
              </button>
              
              <button 
                onClick={() => setYearRange(10)}
                className={`text-center p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                  yearRange === 10 
                    ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                    : 'bg-card border-border hover:bg-secondary/50'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">10 Years</div>
                <div className={`text-lg font-bold ${yearRange === 10 ? 'text-primary' : 'text-foreground'}`}>
                  ${projectionData[10]?.portfolioValue?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-financial-green font-medium">
                  ${projectionData[10]?.monthlyIncome?.toLocaleString() || '0'}/mo
                </div>
              </button>
              
              <button 
                onClick={() => setYearRange(15)}
                className={`text-center p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                  yearRange === 15 
                    ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                    : 'bg-card border-border hover:bg-secondary/50'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">15 Years</div>
                <div className={`text-lg font-bold ${yearRange === 15 ? 'text-primary' : 'text-foreground'}`}>
                  ${projectionData[15]?.portfolioValue?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-financial-green font-medium">
                  ${projectionData[15]?.monthlyIncome?.toLocaleString() || '0'}/mo
                </div>
              </button>
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

        {/* Next Steps Strip */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center p-4 bg-card/50 border border-border rounded-lg">
          <div className="text-sm font-medium text-muted-foreground">Next steps:</div>
          <div className="flex gap-3">
            <Button asChild className="h-8 px-4 text-sm">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-3 w-3" />
                {currentMetrics.uniqueStocks === 0 ? "Add your first stock" : "Go to Dashboard"}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-8 px-4 text-sm">
              <Link to="/learn-dividend-snowball">
                Learn Dividend Snowball
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};