import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, TrendingUp, DollarSign, PieChart, Target, Shield, Zap, ArrowRight, Play, Star, CheckCircle, BookOpen, GraduationCap } from "lucide-react";
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
import { FreeToolsSection } from "@/components/FreeToolsSection";
import { NewsletterSignup } from "@/components/NewsletterSignup";

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
        title="Master Dividend Investing | Free Guides, Calculators & Portfolio Tracker"
        description="Learn dividend investing strategies with free calculators, expert guides, and comprehensive resources. Track your portfolio and build passive income toward financial independence."
        keywords="dividend investing, passive income, FIRE, financial independence, dividend calculator, DRIP calculator, investment education, portfolio tracker, dividend stocks"
        canonicalUrl="https://www.divtrkr.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Divtrkr",
          "description": "Master dividend investing with free tools, guides, and portfolio tracking",
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

      {/* HERO SECTION - Education First */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50"></div>
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Master Dividend Investing &
              <span className="gradient-text block">Build Passive Income</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Free calculators, expert strategies, and comprehensive guides to grow your wealth through dividend investing. No sign-up required to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="gradient"
                className="px-8 py-6 text-lg"
                onClick={() => {
                  const toolsSection = document.getElementById('free-tools');
                  toolsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Free Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg"
                asChild
              >
                <Link to="/blog">
                  Read Expert Guides
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              💡 <strong>100% Free.</strong> No credit card or account required to access our educational resources.
            </p>
          </div>
        </div>
      </section>

      {/* FREE TOOLS SECTION - Immediate Value */}
      <div id="free-tools">
        <FreeToolsSection />
      </div>

      {/* BLOG PREVIEW - Moved Up for Content Focus */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
                Latest Dividend Investing Insights
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert strategies, stock analysis, and wealth-building tips from dividend investing professionals
            </p>
          </div>
          <BlogPreview />
        </div>
      </section>

      {/* New to Dividend Investing */}
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
                Our comprehensive guides make it easy to learn and implement a winning strategy.
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



      {/* NEWSLETTER SIGNUP - Prominent Conversion */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Get Weekly Dividend Insights
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 1,000+ investors receiving expert dividend stock picks, income strategies, and market analysis
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSignup />
            </div>
            <p className="text-sm text-white/70 mt-4">
              💌 Free forever. Unsubscribe anytime. No spam, ever.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO PORTFOLIO - Demoted, Secondary Feature */}
      <section className="py-20 bg-background/50">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="section-title text-3xl lg:text-4xl mb-6">
              <span className="gradient-text">Ready to Take Action?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              After learning the fundamentals, use our free portfolio tracker to monitor your dividend investments, track upcoming payments, and watch your passive income grow.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto animate-scale-in">
            <DemoPortfolio />
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="font-semibold shadow-elegant hover:shadow-lg transition-all duration-300"
              onClick={() => {
                const signupSection = document.getElementById('signup-section');
                signupSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 100% free • Track unlimited stocks
            </p>
          </div>
        </div>
      </section>

      {/* Platform Features - Simplified */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-title text-3xl lg:text-5xl mb-6">
              Everything You Need to
              <span className="gradient-text block pb-1">Master Dividend Investing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and resources to track, analyze, and optimize your dividend portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Real-Time Tracking",
                description: "Monitor your dividend income with live portfolio updates and instant notifications.",
                color: "text-primary"
              },
              {
                icon: PieChart,
                title: "Portfolio Analytics",
                description: "Deep insights into your holdings with advanced charts and performance metrics.",
                color: "text-financial-green"
              },
              {
                icon: DollarSign,
                title: "Income Projections",
                description: "Forecast your future dividend income with our projection tools.",
                color: "text-accent"
              },
...
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

      {/* Hero Section - Sign Up */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative z-20 text-center lg:text-left animate-fade-in">
              <h2 className="page-title text-4xl lg:text-6xl mb-10 leading-relaxed">
                Build Wealth Through
                <span className="gradient-text block pb-2">Dividend Investing</span>
              </h2>
              
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
                      ? "Create your free account" 
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

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <Footer />
      
      {/* Mobile Sticky CTA */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/20 p-4 z-40">
          <Button 
            className="w-full gradient-primary text-white hover:opacity-90 transition-smooth py-3"
            onClick={() => {
              const signupSection = document.getElementById('signup-section');
              signupSection?.scrollIntoView({ behavior: 'smooth' });
            }}
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