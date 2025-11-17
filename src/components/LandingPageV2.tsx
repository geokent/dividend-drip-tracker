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
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { FAQ } from "@/components/FAQ";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { useExitIntent } from "@/hooks/useExitIntent";
import { DemoPortfolio } from "@/components/DemoPortfolio";
import { SEOHead } from "@/components/SEOHead";
import { BlogPreview } from "@/components/BlogPreview";
import { OrganizationSchema } from "@/components/OrganizationSchema";

// Import images
import snowball from "@/assets/snowball.jpg";
import fire from "@/assets/fire.jpg";
import sync from "@/assets/sync.jpg";
import future from "@/assets/future.jpg";
import whatdiv from "@/assets/whatdiv.jpg";
// Dashboard screenshot now uses public uploaded image

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
  const isMobile = useIsMobile();
  const { showExitIntent, hideExitIntent } = useExitIntent();

  // Meta tags are now handled by SEOHead component only

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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Divtrkr - Track Your Dividend Income & Build Wealth"
        description="Track your dividend income, monitor portfolio performance, and build passive wealth with our comprehensive dividend tracking platform. Start your journey to financial independence today."
        keywords="dividend tracker, dividend investing, passive income, FIRE, financial independence, investment portfolio, dividend stocks, portfolio tracking, dividend snowball"
        canonicalUrl="https://www.divtrkr.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Divtrkr",
          "description": "Track your dividend income, monitor portfolio performance, and build passive wealth",
          "url": "https://www.divtrkr.com",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />
      <OrganizationSchema />
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative z-20 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 shadow-sm">
                <Star className="h-4 w-4 mr-2" />
                #1 Dividend Tracking Platform
              </div>
              
              <h1 className="page-title text-4xl lg:text-6xl mb-10 leading-relaxed">
                Build Wealth Through
                <span className="gradient-text block pb-2">Dividend Investing</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform your investment strategy with comprehensive dividend tracking, 
                portfolio analysis, and passive income optimization. Start building your 
                financial independence today.
              </p>


              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-financial-green mr-2" />
                  Bank-Level Security
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-financial-green mr-2" />
                  Real-Time Data
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-financial-green mr-2" />
                  Free Forever Plan
                </div>
              </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="relative z-10 animate-scale-in">
              <Card className="card-elevated backdrop-blur-lg bg-card/95">
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
                     
                     <p className="text-xs text-muted-foreground text-center mt-4">
                       By continuing, you agree to our{" "}
                       <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                       {" "}and{" "}
                       <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                     </p>
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

      {/* Demo Portfolio Section */}
      <section className="py-20 bg-gradient-to-b from-background to-accent/5">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="section-title text-3xl lg:text-5xl mb-6">
              <span className="gradient-text">Track Your Dividend Portfolio</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              This is what a real dividend portfolio looks like in Divtrkr. Track your holdings, 
              monitor yields, and watch your passive income grow month by month.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto animate-scale-in">
            <DemoPortfolio />
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="font-semibold shadow-elegant hover:shadow-lg transition-all duration-300"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Start Tracking Your Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background to-accent/5">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-title text-3xl lg:text-5xl mb-6">
              Trusted by Smart
              <span className="gradient-text block">Investors</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our users are saying about their dividend tracking journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-feature p-6 rounded-xl hover-scale">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "Finally found a tool that makes dividend tracking simple. The future income projections help me plan my retirement with confidence."
              </p>
              <div className="font-medium">Sarah M.</div>
              <div className="text-sm text-muted-foreground">Retired Teacher</div>
            </div>
            
            <div className="card-feature p-6 rounded-xl hover-scale">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The automatic sync with my broker saves me hours every month. Love seeing my dividend snowball grow in real-time!"
              </p>
              <div className="font-medium">Mike R.</div>
              <div className="text-sm text-muted-foreground">Software Engineer</div>
            </div>
            
            <div className="card-feature p-6 rounded-xl hover-scale">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★".repeat(5)}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                "The learning academy taught me everything about dividend investing. Now I'm on track to reach financial independence!"
              </p>
              <div className="font-medium">Jennifer L.</div>
              <div className="text-sm text-muted-foreground">Marketing Manager</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-title text-3xl lg:text-5xl mb-6">
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
                color: "text-primary"
              },
              {
                icon: PieChart,
                title: "Portfolio Analytics",
                description: "Deep insights into your holdings with advanced charts, performance metrics, and risk analysis.",
                color: "text-financial-green"
              },
              {
                icon: DollarSign,
                title: "Income Projections",
                description: "Forecast your future dividend income with our AI-powered prediction algorithms.",
                color: "text-accent",
                link: "/future-income-projects"
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
                color: "text-primary"
              },
              {
                icon: Zap,
                title: "Auto-Sync Accounts",
                description: "Connect your brokerage accounts for automatic dividend tracking and portfolio updates.",
                color: "text-secondary"
              },
              {
                icon: Target,
                title: "Goal Setting",
                description: "Set and track your financial independence goals with personalized FIRE calculators.",
                color: "text-primary"
              }
            ].map((feature, index) => {
              if (feature.link) {
                return (
                  <Link key={index} to={feature.link}>
                    <Card className="card-feature group hover-scale h-full cursor-pointer">
                      <CardHeader>
                        <div className={`inline-flex p-3 rounded-2xl bg-background/80 w-fit ${feature.color}`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="card-title">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              } else {
                return (
                  <Card key={index} className="card-feature group hover-scale">
                    <CardHeader>
                      <div className={`inline-flex p-3 rounded-2xl bg-background/80 w-fit ${feature.color}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="card-title">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        </div>
      </section>

      {/* Educational Content Sections */}
      
      {/* What Are Dividends */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="section-title mb-6">
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
                     <CheckCircle className="h-5 w-5 text-financial-green mr-3 flex-shrink-0" />
                     <span className="text-foreground">{item}</span>
                   </div>
                 ))}
              </div>
              <Link to="/learning-academy">
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
              <h2 className="section-title mb-6">
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
                <div className="metric-card">
                  <div className="text-3xl font-bold text-foreground mb-2">$500</div>
                  <div className="metric-label">Monthly Investment</div>
                </div>
                 <div className="metric-card">
                   <div className="text-3xl font-bold text-foreground mb-2">$2.1M</div>
                   <div className="metric-label">30-Year Total</div>
                 </div>
              </div>
              <div className="flex flex-col items-center">
                <Button variant="outline" size="lg" className="px-8 hover-scale" asChild>
                  <Link to="/learning-academy">
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
              <h2 className="section-title mb-6">
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
                  <Link to="/learning-academy">
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
            <h2 className="section-title text-3xl lg:text-5xl mb-6">
              Advanced Features for
              <span className="gradient-text block">Serious Investors</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="animate-fade-in">
              <h3 className="card-title text-2xl lg:text-3xl mb-2 text-center">
                Automatic Portfolio Syncing
              </h3>
              <p className="text-xs text-muted-foreground mb-6 font-medium text-center">Coming Soon</p>
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
                     <CheckCircle className="h-5 w-5 text-financial-green mr-3" />
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
              <h3 className="card-title text-2xl lg:text-3xl mb-6">
                Future Income Projections
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our AI-powered algorithms analyze your current portfolio and market trends 
                to project your future dividend income. Plan your retirement and financial 
                goals with confidence using our advanced modeling tools.
              </p>
               <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="metric-card p-4">
                  <div className="text-2xl font-bold text-foreground mb-1">5Y</div>
                  <div className="metric-label">Projection</div>
                </div>
                 <div className="metric-card p-4">
                   <div className="text-2xl font-bold text-foreground mb-1">10Y</div>
                   <div className="metric-label">Timeline</div>
                 </div>
                 <div className="metric-card p-4">
                   <div className="text-2xl font-bold text-foreground mb-1">25Y</div>
                   <div className="metric-label">Long-term</div>
                 </div>
               </div>
              <div className="flex flex-col items-center">
                <Button variant="outline" size="lg" className="px-8" asChild>
                  <Link to="/future-income-projects">
                    Try Projection Tool
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Install Nudge */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-feature rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover-scale">
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-lg mb-2">Install DivTrkr on Your Device</h3>
                <p className="text-muted-foreground">Get the full app experience with offline access and notifications</p>
              </div>
              <PWAInstallButton />
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
              <Button 
                size="lg" 
                variant="secondary" 
                className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
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

      {/* Blog Preview Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Latest Dividend Investing Insights
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn strategies, tips, and insights to maximize your dividend portfolio and build lasting wealth
            </p>
          </div>
          <BlogPreview />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <Footer />
      
      {/* Mobile Sticky CTA */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/20 p-4 z-40">
          <Button 
            className="w-full gradient-primary text-white hover:opacity-90 transition-smooth py-3"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Create Free Account
          </Button>
        </div>
      )}

      {/* Exit Intent Modal */}
      <ExitIntentModal isOpen={showExitIntent} onClose={hideExitIntent} />
    </div>
  );
};

export { LandingPageV2 };