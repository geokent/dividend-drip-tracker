import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./AuthProvider";
import { ArrowRight, DollarSign, TrendingUp, Shield, BarChart3, Snowflake, Flame } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import whatdivImage from "../assets/whatdiv.jpg";
import snowballImage from "../assets/snowball.jpg";
import fireImage from "../assets/fire.jpg";
import syncImage from "../assets/sync.jpg";
import futureImage from "../assets/future.jpg";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive"
          });
          setIsSignUp(false);
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account."
        });
        
        if (data.user) {
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully."
        });
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/5 backdrop-blur-lg bg-white/95 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
{user && (
              <Button onClick={() => navigate('/dashboard')} className="px-6">
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              See Your Portfolio Like Never Before
            </h2>
            <p className="text-xl text-muted-foreground">
              Get instant insights into your dividend income with our beautiful, easy-to-use dashboard.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border">
            <img 
              src="/lovable-uploads/ac4c76f1-85e1-4a10-aea3-ef432a91a3a6.png" 
              alt="DivTrkr dashboard showing dividend tracking, portfolio analytics, and income projections"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user ? (
            // Existing user view
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6">
                Welcome Back!
                <span className="text-primary block">Ready to Grow?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Continue tracking your dividend journey and watch your passive income compound.
              </p>
              <Button size="lg" onClick={() => navigate('/dashboard')} className="px-8 py-6 text-lg">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            // New user view with auth form
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Turn Stocks Into
                  <span className="text-primary block">Passive Income</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Passive income from stocks comes through dividends - regular cash payments companies make to shareholders. 
                  It's money that flows to you automatically, just for owning quality dividend-paying stocks.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  DivTrkr makes it effortless to track your dividend income across all your holdings. 
                  See your passive income grow month by month, completely free.
                </p>
                <div className="bg-primary/10 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-foreground">
                    🎉 Sign up today for FREE and start tracking your investment income!
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <Card className="w-full max-w-md shadow-lg">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                      {isSignUp ? 'Sign Up FOR FREE' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-center">
                      {isSignUp 
                        ? 'Start tracking your dividend income completely free - no credit card required' 
                        : 'Sign in to continue tracking your dividend growth'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            type="text"
                            placeholder="Enter your display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required={isSignUp}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading 
                          ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                          : (isSignUp ? 'Start Tracking for Free' : 'Sign In')
                        }
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setEmail('');
                          setPassword('');
                          setDisplayName('');
                        }}
                        className="text-sm"
                      >
                        {isSignUp 
                          ? 'Already have an account? Sign In' 
                          : "Don't have an account? Sign up FOR FREE today!"
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What Are Dividends Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                What Are Dividends, Anyway?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Think of dividends as a 'thank you' bonus from a company you invest in. When a company makes a profit, 
                it can share a portion of those earnings with its shareholders. This payment is a dividend. It's real cash 
                paid directly into your brokerage account, creating a stream of passive income from the stocks you own.
              </p>
              <Button variant="outline" className="group" asChild>
                <Link to="/learning-academy">
                  Want to learn more?
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img 
                src={whatdivImage} 
                alt="Illustration showing how companies pay dividends to shareholders"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dividend Snowball Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Snowflake className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Harness the Power of the Dividend Snowball
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                The dividend snowball effect is how true wealth is built. It's a simple concept: you reinvest the dividends 
                you earn to buy more shares of the same stock. Those new shares then generate their own dividends. Over time, 
                this cycle creates a compounding effect, like a snowball rolling downhill, getting bigger and faster.
              </p>
            </div>
            <div className="lg:order-1 rounded-2xl overflow-hidden">
              <img 
                src={snowballImage} 
                alt="Illustration of the dividend snowball effect showing compound growth"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FIRE Movement Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                A Key to the FIRE Movement
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                The FIRE (Financial Independence, Retire Early) movement is about building enough passive income to cover 
                your living expenses, giving you the freedom to live life on your own terms. For many, a growing stream 
                of dividend income is a cornerstone of this strategy.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img 
                src={fireImage} 
                alt="Illustration representing financial independence and early retirement"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Clarity is the Key to Compounding
            </h2>
            <p className="text-xl text-muted-foreground">
              Knowing your numbers is the first step to growing them.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">True Portfolio Sync</h3>
                <p className="text-muted-foreground mb-6">
                  Stop exporting CSV files. Securely link your accounts once with Plaid, and get a live, 
                  always up-to-date view of your holdings.
                </p>
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src={syncImage} 
                    alt="Illustration of automated portfolio syncing"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Project Future Income</h3>
                <p className="text-muted-foreground mb-6">
                  Our projection tools help you visualize your dividend growth potential and plan your 
                  financial independence journey.
                </p>
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src={futureImage} 
                    alt="Illustration of income projection charts"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Dividend Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of investors who are building their passive income with DivTrkr.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleGetStarted}
            className="px-8 py-6 text-lg"
          >
            Start Tracking for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
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