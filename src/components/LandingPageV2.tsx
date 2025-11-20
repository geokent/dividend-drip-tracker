import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, TrendingUp, DollarSign, Target, Shield, Zap, ArrowRight, BookOpen, GraduationCap, Star, CheckCircle } from "lucide-react";
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
        setIsSignUp(false);
        setShowEmailVerification(true);
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
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
        navigate("/dashboard");
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
    <>
      <SEOHead
        title="Master Dividend Investing & Build Passive Income | Divtrkr"
        description="Free dividend investing guides, calculators, and expert strategies. Learn to build wealth through dividend stocks with our comprehensive educational resources and portfolio tracking tools."
        keywords="dividend investing, passive income, dividend stocks, FIRE movement, financial independence, dividend calculator, DRIP calculator, dividend portfolio"
        ogImage="https://www.divtrkr.com/lovable-uploads/dividend-hero.jpg"
      />
      <OrganizationSchema />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section - Education First */}
          <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Free Educational Resources & Tools</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Master <span className="gradient-text">Dividend Investing</span>
                  <br />& Build Passive Income
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Free guides, calculators, and expert strategies to grow your wealth through dividend investing. No sign-up required to get started.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button size="lg" asChild className="gap-2 min-w-[200px]">
                    <a href="#free-tools">
                      <BookOpen className="h-5 w-5" />
                      Explore Free Resources
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="gap-2 min-w-[200px]">
                    <Link to="/blog">
                      <GraduationCap className="h-5 w-5" />
                      Read Latest Articles
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Blog Content */}
          <section className="py-20 bg-background">
            <div className="container">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="section-title text-3xl lg:text-5xl mb-4">
                  <span className="gradient-text">Latest Dividend Investing Insights</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Expert articles on dividend strategies, portfolio building, and financial independence
                </p>
              </div>
              <BlogPreview />
            </div>
          </section>

          {/* Free Tools Section */}
          <div id="free-tools">
            <FreeToolsSection />
          </div>

          {/* Newsletter Signup - Primary Conversion Goal */}
          <section className="py-12 bg-background">
            <div className="container">
              <div className="max-w-md mx-auto">
                <NewsletterSignup />
              </div>
            </div>
          </section>

          {/* Learning Paths Section */}
          <section className="py-20 bg-secondary/30">
            <div className="container">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="section-title text-3xl lg:text-5xl mb-4">
                  <span className="gradient-text">Start Your Learning Journey</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Structured learning paths to take you from beginner to confident dividend investor
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <Card className="hover:shadow-hover transition-smooth">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <CardTitle>Dividend Basics</CardTitle>
                    </div>
                    <CardDescription>Perfect for beginners starting their journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">What are dividends and how do they work?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">How to evaluate dividend stocks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Building your first portfolio</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link to="/learning-academy">Start Learning</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-hover transition-smooth border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-6 w-6 text-primary" />
                      <CardTitle>Advanced Strategies</CardTitle>
                    </div>
                    <CardDescription>Take your investing to the next level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Dividend aristocrats and kings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Tax optimization strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">International dividend investing</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link to="/blog">Explore Articles</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-hover transition-smooth">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <CardTitle>FIRE Movement</CardTitle>
                    </div>
                    <CardDescription>Achieve financial independence faster</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Calculate your FIRE number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Building a dividend FIRE portfolio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Real success stories and case studies</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full">
                      <Link to="/learn-fire">Learn About FIRE</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Portfolio Tracker - Demoted to Secondary Feature */}
          <section className="py-20 bg-background">
            <div className="container">
              <div className="text-center mb-12 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Optional Premium Tool</span>
                </div>
                <h2 className="section-title text-3xl lg:text-5xl mb-4">
                  Ready to <span className="gradient-text">Take Action?</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  After learning the fundamentals, use our free portfolio tracker to monitor your dividend income and progress
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <DemoPortfolio />
                
                <div className="text-center mt-8">
                  <Button size="lg" asChild className="gap-2">
                    <a href="#auth-section">
                      <ArrowRight className="h-5 w-5" />
                      Create Free Account
                    </a>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Join 500+ investors tracking their dividend portfolios
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust & Social Proof Section */}
          <section className="py-16 bg-secondary/20 border-y border-border">
            <div className="container">
              <div className="text-center space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Trusted Educational Resource</h3>
                  <p className="text-muted-foreground">
                    Committed to providing accurate, unbiased dividend investing education
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <Link to="/editorial" className="text-sm font-medium hover:text-primary transition-colors">
                      Editorial Standards
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">15+ In-Depth Guides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Free Forever</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 bg-background">
            <div className="container">
              <h2 className="section-title text-center text-3xl lg:text-5xl mb-12">
                <span className="gradient-text">Why Choose Divtrkr</span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  {
                    icon: <BookOpen className="h-8 w-8 text-primary" />,
                    title: "Comprehensive Education",
                    description: "In-depth guides covering everything from basics to advanced dividend strategies"
                  },
                  {
                    icon: <Zap className="h-8 w-8 text-primary" />,
                    title: "Interactive Calculators",
                    description: "Free tools to plan your dividend income and financial independence goals"
                  },
                  {
                    icon: <Shield className="h-8 w-8 text-primary" />,
                    title: "Unbiased Content",
                    description: "No affiliate links or sponsored content - just honest education"
                  },
                  {
                    icon: <TrendingUp className="h-8 w-8 text-primary" />,
                    title: "Portfolio Tracking",
                    description: "Optional free tool to monitor your dividend income and portfolio performance"
                  },
                  {
                    icon: <Target className="h-8 w-8 text-primary" />,
                    title: "FIRE Focus",
                    description: "Strategies specifically designed for achieving financial independence"
                  },
                  {
                    icon: <DollarSign className="h-8 w-8 text-primary" />,
                    title: "100% Free",
                    description: "All educational content and calculators are completely free forever"
                  }
                ].map((feature, index) => (
                  <Card key={index} className="hover:shadow-hover transition-smooth">
                    <CardHeader>
                      <div className="mb-2">{feature.icon}</div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-secondary/30">
            <div className="container max-w-4xl">
              <FAQ />
            </div>
          </section>

          {/* Auth Section - Moved to Bottom */}
          <section id="auth-section" className="py-20 bg-background">
            <div className="container max-w-md mx-auto">
              {user ? (
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>
                      You're already logged in. Ready to track your dividends?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button size="lg" asChild className="w-full gap-2">
                      <Link to="/dashboard">
                        <TrendingUp className="h-5 w-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Continue exploring educational content or access your portfolio tracker
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      {isSignUp ? "Create Free Account" : "Welcome Back"}
                    </CardTitle>
                    <CardDescription>
                      {isSignUp 
                        ? "Start tracking your dividend portfolio today" 
                        : "Sign in to access your portfolio"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showEmailVerification && (
                      <Alert className="mb-4">
                        <AlertDescription>
                          Please check your email to verify your account before signing in.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2">
                          <label htmlFor="displayName" className="text-sm font-medium">
                            Display Name
                          </label>
                          <Input
                            id="displayName"
                            type="text"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required={isSignUp}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
                      </Button>
                    </form>

                    <div className="text-center mt-4">
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setShowEmailVerification(false);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>

        <Footer />
        <PWAInstallButton />
        <ExitIntentModal isOpen={showExitIntent} onClose={hideExitIntent} />
      </div>
    </>
  );
};

export default LandingPageV2;
