import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { DemoPortfolio } from "@/components/DemoPortfolio";
import { Eye, EyeOff, TrendingUp, RefreshCw, Target, DollarSign, Loader2 } from "lucide-react";

const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });
};

const LandingPageV2 = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Show loading while redirecting authenticated users
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
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

  const valueProps = [
    {
      icon: RefreshCw,
      title: "Sync Your Brokerage",
      description: "Connect Schwab, Fidelity, and more via Plaid"
    },
    {
      icon: TrendingUp,
      title: "Track Dividend Income",
      description: "Monitor yields, ex-dates, and payment history"
    },
    {
      icon: Target,
      title: "Project Future Income",
      description: "See your path to financial independence"
    },
    {
      icon: DollarSign,
      title: "Free Forever",
      description: "No credit card required"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border/10 backdrop-blur-lg bg-background/95 sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-8 w-auto"
              />
            </Link>
            <Button variant="outline" size="sm" onClick={() => setIsSignUp(false)}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Auth Form */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Headline + Value Props */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Track Your <span className="gradient-text">Dividend Income</span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Monitor your portfolio and project your path to financial independence.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {valueProps.map((prop, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border/50">
                    <prop.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">{prop.title}</h3>
                      <p className="text-xs text-muted-foreground">{prop.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Auth Form */}
            <Card className="shadow-xl border-border/50">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">
                  {showEmailVerification 
                    ? "Check Your Email" 
                    : isSignUp 
                      ? "Create Free Account" 
                      : "Welcome Back"}
                </CardTitle>
                <CardDescription>
                  {showEmailVerification 
                    ? "We sent you a verification link" 
                    : isSignUp 
                      ? "Start tracking your dividends today" 
                      : "Sign in to your account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showEmailVerification ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Click the link in your email to verify your account, then sign in below.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEmailVerification(false)}
                      className="w-full"
                    >
                      Go to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <Input
                          type="text"
                          placeholder="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {isSignUp ? "Creating Account..." : "Signing In..."}
                        </>
                      ) : (
                        isSignUp ? "Create Free Account" : "Sign In"
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign in
                          </button>
                        </>
                      ) : (
                        <>
                          Don't have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className="text-primary hover:underline font-medium"
                          >
                            Create one
                          </button>
                        </>
                      )}
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Portfolio Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              See It In Action
            </h2>
            <p className="text-muted-foreground">
              Explore an interactive demo portfolio
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <DemoPortfolio />
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-border/10">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DivTrkr. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV2;
