import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { SEOHead } from '@/components/SEOHead';
import { BookOpen, TrendingUp, Target, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Auth = () => {
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      if (error) throw error;

      if (data.user) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        if (data.user.email_confirmed_at) {
          window.location.href = '/dashboard';
        } else {
          setMessage('Please check your email for a confirmation link to complete your registration.');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Learning Modules",
      description: "Master dividend fundamentals, FIRE strategy, and wealth-building techniques"
    },
    {
      icon: TrendingUp,
      title: "Expert-Curated Content",
      description: "Learn from proven strategies that have helped thousands build wealth"
    },
    {
      icon: Target,
      title: "Practical Applications",
      description: "Apply what you learn immediately with our dividend tracking tools"
    },
    {
      icon: Star,
      title: "Premium Value - Free Access",
      description: "Get $197 worth of educational content completely free with your account"
    }
  ];

  const benefits = [
    "Understand dividend yield calculations and sustainability metrics",
    "Learn the 25x rule and safe withdrawal rates for early retirement",
    "Master the dividend snowball effect for compound growth",
    "Access exclusive portfolio tracking and projection tools",
    "Join a community of successful dividend investors"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sign In | DivTrkr"
        description="Sign in to your DivTrkr account to access your dividend dashboard"
        noIndex={true}
      />
      <Header />
      
      <div className="min-h-screen flex">
        {/* Left side - Value Proposition */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-12 flex-col justify-center">
          <div className="max-w-lg">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Unlock Your Financial Future
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get exclusive access to our Learning Academy and discover the strategies that have helped thousands achieve financial independence through dividend investing.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                What You'll Learn (Normally $197 Value)
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:hidden mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Unlock Premium Education
              </h1>
              <p className="text-muted-foreground">
                Sign up for free to access our Learning Academy
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isSignUp ? 'Create Your Free Account' : 'Welcome Back'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {isSignUp 
                    ? 'Join thousands learning to build wealth through dividends' 
                    : 'Sign in to continue your learning journey'
                  }
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {message && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
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
                    />
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Please wait...' : (isSignUp ? 'Create Account & Start Learning' : 'Sign In')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <Separator />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setMessage('');
                    }}
                    className="text-primary hover:underline"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up for free"
                    }
                  </button>
                </div>

                <div className="text-center pt-4">
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    ← Back to Home
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Value Proposition */}
            <div className="lg:hidden bg-primary/5 p-6 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Premium Education - Free Access
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get $197 worth of dividend investing education completely free with your account.
              </p>
              <ul className="space-y-1">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};