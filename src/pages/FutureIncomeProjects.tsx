import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
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
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useAuth } from "@/components/AuthProvider";

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
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(5);
  const [additionalYearlyContribution, setAdditionalYearlyContribution] = useState(0);
  const [reinvestDividends, setReinvestDividends] = useState(true);

  // Load tracked stocks from localStorage
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

  // Calculate current portfolio metrics
  const calculateCurrentMetrics = () => {
    const totalAnnualDividends = trackedStocks.reduce((sum, stock) => {
      if (stock.annualDividend && stock.shares > 0) {
        return sum + (stock.annualDividend * stock.shares);
      }
      return sum;
    }, 0);
    
    const totalPortfolioValue = trackedStocks.reduce((sum, stock) => {
      if (stock.currentPrice && stock.shares > 0) {
        return sum + (stock.currentPrice * stock.shares);
      }
      return sum;
    }, 0);

    const averageYield = totalPortfolioValue > 0 ? (totalAnnualDividends / totalPortfolioValue) * 100 : 0;

    return {
      totalAnnualDividends,
      totalPortfolioValue,
      averageYield,
      uniqueStocks: trackedStocks.length
    };
  };

  // Generate projection data for charts
  const generateProjectionData = () => {
    const currentMetrics = calculateCurrentMetrics();
    const data = [];
    
    let currentPortfolioValue = currentMetrics.totalPortfolioValue;
    let currentAnnualDividends = currentMetrics.totalAnnualDividends;
    
    // Use current yield or default to 4% if no stocks
    const assumedYield = currentMetrics.averageYield > 0 ? currentMetrics.averageYield / 100 : 0.04;
    
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover-scale">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">DividendTracker</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Dashboard
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

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="h-4 w-4" />
            <span>AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Future Dividend 
            <span className="gradient-text block">Income Projections</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered projections based on your current portfolio of {currentMetrics.uniqueStocks} dividend stocks. 
            Customize parameters below to see how different strategies affect your long-term income.
          </p>
        </div>

        {/* Current Portfolio Summary */}
        {trackedStocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  ${currentMetrics.totalPortfolioValue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Current Portfolio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ${currentMetrics.totalAnnualDividends.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Annual Dividends</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentMetrics.averageYield.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">Portfolio Yield</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {currentMetrics.uniqueStocks}
                </div>
                <div className="text-sm text-muted-foreground">Dividend Stocks</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Parameter Controls */}
          <Card className="shadow-elegant hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Projection Parameters</CardTitle>
              </div>
              <CardDescription>
                Adjust these values to see how they impact your projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly Investment: ${monthlyInvestment}</Label>
                <Slider
                  value={[monthlyInvestment]}
                  onValueChange={([value]) => setMonthlyInvestment(value)}
                  max={5000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendGrowth">Expected Dividend Growth: {dividendGrowthRate}%</Label>
                <Slider
                  value={[dividendGrowthRate]}
                  onValueChange={([value]) => setDividendGrowthRate(value)}
                  max={15}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearlyContribution">Additional Yearly Investment: ${additionalYearlyContribution}</Label>
                <Slider
                  value={[additionalYearlyContribution]}
                  onValueChange={([value]) => setAdditionalYearlyContribution(value)}
                  max={50000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reinvest"
                  checked={reinvestDividends}
                  onChange={(e) => setReinvestDividends(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="reinvest">Reinvest Dividends</Label>
              </div>
            </CardContent>
          </Card>

          {/* Key Projections */}
          <Card className="shadow-elegant lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Key Milestones</CardTitle>
              </div>
              <CardDescription>
                Based on your current portfolio and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 10, 15].map((targetYear) => {
                  const yearData = projectionData[targetYear];
                  return (
                    <Card key={targetYear} className="bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg">{targetYear} Year{targetYear > 1 ? 's' : ''}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary mb-1">
                          ${yearData?.monthlyIncome.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">Monthly Income</div>
                        <div className="text-lg font-semibold text-foreground">
                          ${yearData?.portfolioValue.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Portfolio</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Line Chart - Portfolio Growth */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Portfolio Growth Projection</CardTitle>
              </div>
              <CardDescription>
                Expected portfolio value and dividend income over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name === 'portfolioValue' ? 'Portfolio Value' : 'Annual Dividends'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="portfolioValue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Portfolio Value"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="annualDividends" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Annual Dividends"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Income Breakdown */}
          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Dividend Income Timeline</CardTitle>
              </div>
              <CardDescription>
                Monthly dividend income projections by year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData.filter((_, index) => index % 2 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Monthly Income']}
                    />
                    <Bar dataKey="monthlyIncome" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assumptions and Recommendations */}
        <Card className="shadow-elegant mb-12">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Projection Assumptions & Recommendations</CardTitle>
            </div>
            <CardDescription>
              Key assumptions used in calculations and suggestions for optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="assumptions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assumptions">Key Assumptions</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assumptions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Market Assumptions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Portfolio Yield</span>
                        <span className="font-medium">{currentMetrics.averageYield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Market Growth</span>
                        <span className="font-medium">7.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dividend Growth Rate</span>
                        <span className="font-medium">{dividendGrowthRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inflation Rate</span>
                        <span className="font-medium">2.5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Your Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Investment</span>
                        <span className="font-medium">${monthlyInvestment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Additional Yearly</span>
                        <span className="font-medium">${additionalYearlyContribution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dividend Reinvestment</span>
                        <span className="font-medium">{reinvestDividends ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stocks</span>
                        <span className="font-medium">{currentMetrics.uniqueStocks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Optimization Suggestions</h4>
                  {[
                    'Consider increasing your monthly investment to accelerate growth',
                    'Enable dividend reinvestment to leverage compound growth',
                    'Add more dividend growth stocks to improve long-term yields',
                    'Diversify across different sectors to reduce risk',
                    'Consider adding international dividend exposure'
                  ].map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-accent/50 rounded-lg">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-primary shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Want to Optimize Your Portfolio?</h3>
              <p className="text-slate-800 mb-6 text-lg">
                Add more dividend stocks to your portfolio to improve these projections.
              </p>
              <Button variant="secondary" size="lg" className="px-8" asChild>
                <Link to="/dashboard">
                  Manage Portfolio
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t bg-background mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-6 w-auto mr-3 hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground mb-2">
                © 2024 DivTrkr. Building wealth through dividend investing.
              </p>
              <p className="text-xs text-muted-foreground">
                This is not investment advice. We are not investment professionals. All data is provided for educational and entertainment purposes only.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};