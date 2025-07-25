import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Home
} from "lucide-react";
import { Link } from "react-router-dom";

export const FutureIncomeProjects = () => {
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [currentPortfolio, setCurrentPortfolio] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('');
  const [projectionGenerated, setProjectionGenerated] = useState(false);

  const handleGenerateProjection = () => {
    if (currentAge && retirementAge && monthlyInvestment && currentPortfolio && riskTolerance) {
      setProjectionGenerated(true);
    }
  };

  // Mock projection data - in real app this would come from AI analysis
  const projectionData = {
    tenYear: { income: '$2,340', portfolio: '$125,000' },
    twentyYear: { income: '$4,850', portfolio: '$285,000' },
    retirement: { income: '$8,920', portfolio: '$520,000' },
    confidence: 85,
    riskLevel: 'Moderate',
    recommendedAdjustments: [
      'Consider increasing allocation to dividend growth stocks',
      'Add international dividend exposure for diversification',
      'Maintain 3-6 month emergency fund alongside investments'
    ]
  };

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
            <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
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
            Future Income 
            <span className="gradient-text block">Projections</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our AI-powered algorithms analyze your current portfolio and market trends to project 
            your future dividend income. Plan your retirement and financial goals with confidence 
            using our advanced modeling tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Input Section */}
          <Card className="shadow-elegant hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <CardTitle>Investment Profile</CardTitle>
              </div>
              <CardDescription>
                Tell us about your current situation to generate personalized projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    placeholder="35"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    placeholder="65"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyInvestment">Monthly Investment ($)</Label>
                <Input
                  id="monthlyInvestment"
                  type="number"
                  placeholder="1000"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPortfolio">Current Portfolio Value ($)</Label>
                <Input
                  id="currentPortfolio"
                  type="number"
                  placeholder="50000"
                  value={currentPortfolio}
                  onChange={(e) => setCurrentPortfolio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateProjection}
                className="w-full h-12" 
                variant="gradient"
                disabled={!currentAge || !retirementAge || !monthlyInvestment || !currentPortfolio || !riskTolerance}
              >
                <Brain className="mr-2 h-5 w-5" />
                Generate AI Projection
              </Button>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="shadow-elegant hover-scale">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered Features</CardTitle>
              </div>
              <CardDescription>
                Advanced algorithms for accurate projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Market Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time analysis of dividend trends and market conditions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Portfolio Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations for dividend portfolio allocation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Goal-Based Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Scenario modeling for different retirement and income goals
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Risk Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Dynamic risk analysis with confidence intervals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {projectionGenerated && (
          <Card className="shadow-elegant animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <CardTitle>Your Dividend Income Projection</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {projectionData.confidence}% Confidence
                </Badge>
              </div>
              <CardDescription>
                Based on your investment profile and current market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                  <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <CardTitle className="text-lg">10 Years</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-500 mb-1">
                          {projectionData.tenYear.income}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">Monthly Income</div>
                        <div className="text-lg font-semibold text-foreground">
                          {projectionData.tenYear.portfolio}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Portfolio</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <CardTitle className="text-lg">20 Years</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-500 mb-1">
                          {projectionData.twentyYear.income}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">Monthly Income</div>
                        <div className="text-lg font-semibold text-foreground">
                          {projectionData.twentyYear.portfolio}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Portfolio</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <CardTitle className="text-lg">Retirement</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-500 mb-1">
                          {projectionData.retirement.income}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">Monthly Income</div>
                        <div className="text-lg font-semibold text-foreground">
                          {projectionData.retirement.portfolio}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Portfolio</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="breakdown" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Risk Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Level</span>
                            <span className="font-medium">{projectionData.riskLevel}</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Confidence</span>
                            <span className="font-medium">{projectionData.confidence}%</span>
                          </div>
                          <Progress value={projectionData.confidence} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Key Assumptions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Dividend Yield</span>
                          <span className="font-medium">4.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Growth Rate</span>
                          <span className="font-medium">7.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dividend Growth Rate</span>
                          <span className="font-medium">5.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inflation Rate</span>
                          <span className="font-medium">2.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">AI Recommendations</h4>
                    {projectionData.recommendedAdjustments.map((recommendation, index) => (
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
        )}

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-primary text-white shadow-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Building Your Future?</h3>
              <p className="text-white/90 mb-6 text-lg">
                Connect your investment accounts and get real-time tracking of your dividend journey.
              </p>
              <Button variant="secondary" size="lg" className="px-8" asChild>
                <Link to="/dashboard">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};