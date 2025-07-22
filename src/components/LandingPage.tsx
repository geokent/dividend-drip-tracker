import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useAuth } from "./AuthProvider";
import { ArrowRight, DollarSign, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import whatdivImage from "../assets/whatdiv.jpg";
import snowballImage from "../assets/snowball.jpg";
import fireImage from "../assets/fire.jpg";
import syncImage from "../assets/sync.jpg";
import futureImage from "../assets/future.jpg";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-8 w-auto mr-3"
              />
            </div>
            <Button onClick={() => navigate('/auth')} className="px-6">
              Login / Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6">
            Track Your Dividends
            <span className="text-primary block">Your Way</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Automatic portfolio sync or manual tracking - both free to start.
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Link your brokerage accounts for automatic updates, or manually add your dividend stocks. 
            Either way, get a clear view of your passive income growth.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="px-8 py-6 text-lg">
            Start Tracking for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
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
              <Button variant="outline" className="group">
                Want to learn more?
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                alt="DivTrkr Logo" 
                className="h-6 w-auto mr-3"
              />
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 DivTrkr. Building wealth through dividend investing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};