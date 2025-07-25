import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, TrendingUp, DollarSign, PieChart, Target, Shield, Zap, ArrowRight, Play, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { PWAInstallButton } from "@/components/PWAInstallButton";

// Import images
import snowball from "@/assets/snowball.jpg";
import fire from "@/assets/fire.jpg";
import sync from "@/assets/sync.jpg";
import future from "@/assets/future.jpg";
import whatdiv from "@/assets/whatdiv.jpg";

const LandingPageV2 = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Divtrkr - Track Your Dividend Income & Build Wealth";
    
    // Add meta tags for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Track your dividend income, monitor portfolio performance, and build passive wealth with our comprehensive dividend tracking platform. Start your journey to financial independence today.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Track your dividend income, monitor portfolio performance, and build passive wealth with our comprehensive dividend tracking platform. Start your journey to financial independence today.';
      document.head.appendChild(meta);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'dividend tracker, dividend investing, passive income, portfolio management, financial independence, FIRE, dividend income, wealth building');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'dividend tracker, dividend investing, passive income, portfolio management, financial independence, FIRE, dividend income, wealth building';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'Divtrkr - Your Path to Financial Independence';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'Transform your investment strategy with comprehensive dividend tracking, portfolio analysis, and passive income optimization.';
      document.head.appendChild(meta);
    }
  }, []);

  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !displayName)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Switch to sign-in form and show verification message
        setIsSignUp(false);
        setShowEmailVerification(true);
        // Clear the form
        setPassword('');
        setDisplayName('');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/5 backdrop-blur-lg bg-white/95 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-8 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="text-foreground/80 hover:text-primary transition-smooth story-link">
                Learn
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-elegant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2 space-y-1">
                  <Link to="/learn-dividends" className="block px-3 py-2 text-sm text-card-foreground hover:bg-accent/10 hover:text-accent rounded-md transition-colors">
                    Learn About Dividends
                  </Link>
                  <Link to="/learn-dividend-snowball" className="block px-3 py-2 text-sm text-card-foreground hover:bg-accent/10 hover:text-accent rounded-md transition-colors">
                    Dividend Snowball Strategy
                  </Link>
                  <Link to="/learn-fire" className="block px-3 py-2 text-sm text-card-foreground hover:bg-accent/10 hover:text-accent rounded-md transition-colors">
                    FIRE Movement
                  </Link>
                </div>
              </div>
            </div>
            {user && (
              <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-smooth story-link">
                Dashboard
              </Link>
            )}
            <PWAInstallButton />
            <Button variant="outline" size="sm" onClick={() => setIsSignUp(false)}>
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                #1 Dividend Tracking Platform
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Build Wealth Through
                <span className="gradient-text block">Dividend Investing</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform your investment strategy with comprehensive dividend tracking, 
                portfolio analysis, and passive income optimization. Start building your 
                financial independence today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button size="lg" className="px-8 py-4 text-lg" onClick={() => setIsSignUp(true)}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg opacity-50 cursor-not-allowed" disabled>
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Bank-Level Security
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-Time Data
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Free Forever Plan
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="animate-scale-in">
              <Card className="backdrop-blur-lg bg-card/80 shadow-elegant border-border/20">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">
                    {isSignUp ? "Start Your Journey" : "Welcome Back"}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {isSignUp 
                      ? "Join thousands building passive income" 
                      : "Sign in to your dividend portfolio"
                    }
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   {showEmailVerification && !isSignUp && (
                     <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                       <AlertDescription>
                         <strong>Check your email!</strong> We've sent you a verification link. 
                         Please check your email and click the link to verify your account, then sign in below.
                       </AlertDescription>
                     </Alert>
                   )}
                   <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <Input
                          type="text"
                          placeholder="Your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                    )}
                    
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 text-lg pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg" 
                      disabled={isLoading}
                      variant="gradient"
                    >
                      {isLoading 
                        ? "Please wait..." 
                        : isSignUp 
                          ? "Create Free Account" 
                          : "Sign In to Dashboard"
                      }
                    </Button>
                  </form>
                  
                   <div className="text-center mt-6">
                     <button
                       onClick={() => {
                         setIsSignUp(!isSignUp);
                         setShowEmailVerification(false);
                       }}
                       className="text-primary hover:underline transition-smooth"
                     >
                       {isSignUp 
                         ? "Already have an account? Sign in" 
                         : "Need an account? Sign up free"
                       }
                     </button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Your Command Center for
              <span className="gradient-text block">Dividend Success</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get a comprehensive view of your dividend portfolio with real-time tracking, 
              performance analytics, and future income projections.
            </p>
          </div>
          
          <div className="relative max-w-6xl mx-auto hover-scale">
            <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20"></div>
            <img 
              src="/lovable-uploads/ac4c76f1-85e1-4a10-aea3-ef432a91a3a6.png" 
              alt="Divtrkr Dashboard - Portfolio Overview and Analytics"
              className="relative rounded-3xl shadow-elegant w-full border border-border/20"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need to
              <span className="gradient-text block">Master Dividend Investing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform gives you all the tools to track, analyze, 
              and optimize your dividend portfolio for maximum returns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Real-Time Tracking",
                description: "Monitor your dividend income as it happens with live portfolio updates and instant notifications.",
                color: "text-blue-500"
              },
              {
                icon: PieChart,
                title: "Portfolio Analytics",
                description: "Deep insights into your holdings with advanced charts, performance metrics, and risk analysis.",
                color: "text-green-500"
              },
              {
                icon: DollarSign,
                title: "Income Projections",
                description: "Forecast your future dividend income with our AI-powered prediction algorithms.",
                color: "text-yellow-500"
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
                color: "text-purple-500"
              },
              {
                icon: Zap,
                title: "Auto-Sync Accounts",
                description: "Connect your brokerage accounts for automatic dividend tracking and portfolio updates.",
                color: "text-red-500"
              },
              {
                icon: Target,
                title: "Goal Setting",
                description: "Set and track your financial independence goals with personalized FIRE calculators.",
                color: "text-indigo-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover-scale border-border/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className={`inline-flex p-3 rounded-2xl bg-background/80 w-fit ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content Sections */}
      
      {/* What Are Dividends */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                New to Dividend Investing?
                <span className="gradient-text block">We'll Guide You</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Dividends are payments companies make to shareholders from their profits. 
                They're one of the most reliable ways to build passive income and long-term wealth. 
                Our platform makes it easy to track and optimize your dividend strategy.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Learn the fundamentals of dividend investing",
                  "Understand dividend yields and payout ratios",
                  "Build a diversified dividend portfolio",
                  "Track your progress toward financial goals"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/learn-dividends">
                <Button variant="outline" size="lg" className="px-8">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="hover-scale">
              <img 
                src={whatdiv} 
                alt="Understanding dividend investing concepts and strategies"
                className="rounded-3xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dividend Snowball Effect */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 hover-scale">
              <img 
                src={snowball} 
                alt="The compounding power of dividend reinvestment over time"
                className="rounded-3xl shadow-elegant w-full"
              />
            </div>
            <div className="order-1 lg:order-2 animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                The Power of the
                <span className="gradient-text block">Dividend Snowball</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Like a snowball rolling down a hill, your dividend income grows larger and 
                faster over time through the power of compounding. As you reinvest dividends 
                to buy more shares, those shares generate even more dividends, creating an 
                exponential growth effect.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 rounded-2xl bg-background/80 border border-border/20">
                  <div className="text-3xl font-bold text-primary mb-2">$500</div>
                  <div className="text-sm text-muted-foreground">Monthly Investment</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-background/80 border border-border/20">
                  <div className="text-3xl font-bold text-green-500 mb-2">$2.1M</div>
                  <div className="text-sm text-muted-foreground">30-Year Total</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="gradient" size="lg" className="px-8 hover-scale" asChild>
                  <Link to="/learn-dividend-snowball">
                    Learn Dividend Snowball
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIRE Movement */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Achieve Financial Independence
                <span className="gradient-text block">The FIRE Way</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                FIRE (Financial Independence, Retire Early) is a movement that emphasizes 
                extreme savings and smart investing to achieve financial freedom decades 
                earlier than traditional retirement. Dividend investing is a cornerstone 
                strategy for many FIRE practitioners.
              </p>
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Build Your Emergency Fund</h3>
                    <p className="text-muted-foreground">Start with 3-6 months of expenses in a high-yield savings account.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Maximize Savings Rate</h3>
                    <p className="text-muted-foreground">Aim to save 50% or more of your income through smart budgeting.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Invest in Dividends</h3>
                    <p className="text-muted-foreground">Build a portfolio of dividend-paying stocks for passive income.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="outline" size="lg" className="px-8 hover-scale" asChild>
                  <Link to="/learn-fire">
                    Learn FIRE Strategy
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hover-scale">
              <img 
                src={fire} 
                alt="Financial Independence Retire Early (FIRE) movement and strategies"
                className="rounded-3xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Advanced Features for
              <span className="gradient-text block">Serious Investors</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="animate-fade-in">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                Automatic Portfolio Syncing
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Connect your brokerage accounts securely and let our platform automatically 
                track your dividend payments, portfolio performance, and tax implications. 
                No more manual data entry or spreadsheet maintenance.
              </p>
              <div className="space-y-4">
                {[
                  "Secure bank-level encryption",
                  "Real-time portfolio updates",
                  "Automated dividend tracking",
                  "Tax-loss harvesting alerts"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hover-scale">
              <img 
                src={sync} 
                alt="Automatic portfolio synchronization and real-time tracking"
                className="rounded-3xl shadow-elegant w-full"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 hover-scale">
              <img 
                src={future} 
                alt="Future income projections and retirement planning tools"
                className="rounded-3xl shadow-elegant w-full"
              />
            </div>
            <div className="order-1 lg:order-2 animate-fade-in">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                Future Income Projections
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our AI-powered algorithms analyze your current portfolio and market trends 
                to project your future dividend income. Plan your retirement and financial 
                goals with confidence using our advanced modeling tools.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-background/80 border border-border/20">
                  <div className="text-2xl font-bold text-primary mb-1">5Y</div>
                  <div className="text-xs text-muted-foreground">Projection</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/80 border border-border/20">
                  <div className="text-2xl font-bold text-green-500 mb-1">10Y</div>
                  <div className="text-xs text-muted-foreground">Timeline</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-background/80 border border-border/20">
                  <div className="text-2xl font-bold text-blue-500 mb-1">25Y</div>
                  <div className="text-xs text-muted-foreground">Long-term</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="gradient" size="lg" className="px-8 opacity-50 cursor-not-allowed" disabled>
                  Try Projection Tool
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Start Building Your
              <span className="block">Dividend Empire Today</span>
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of investors who are already using Divtrkr to build 
              their path to financial independence. Your future self will thank you.
            </p>
            <div className="flex justify-center">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <p className="text-white/70 mt-6 text-sm">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-6 w-auto"
              />
            </div>
            <div className="flex justify-center space-x-8 mb-4">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/learn-dividends" className="text-muted-foreground hover:text-primary transition-smooth">
                Learn Dividends
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">
              © 2024 Divtrkr. Building wealth through intelligent dividend investing.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-2xl mx-auto">
              Disclaimer: Past performance does not guarantee future results. All investments 
              carry risk of loss. Please invest responsibly and consider consulting with a 
              financial advisor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { LandingPageV2 };