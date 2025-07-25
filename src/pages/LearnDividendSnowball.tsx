import { Button } from "@/components/ui/button";
import { ArrowLeft, Snowflake, TrendingUp, RefreshCw, Target, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";

export const LearnDividendSnowball = () => {
  useEffect(() => {
    // Add SEO meta tags
    document.title = "Learn About Dividend Snowball Strategy - Build Wealth with Compound Dividends | DivTrkr";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Master the dividend snowball strategy and learn how reinvesting dividends creates exponential wealth growth. Discover compound dividend investing techniques for long-term financial success.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Master the dividend snowball strategy and learn how reinvesting dividends creates exponential wealth growth. Discover compound dividend investing techniques for long-term financial success.';
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'dividend snowball, compound dividends, dividend reinvestment, DRIP, passive income growth, wealth building, investment strategy, dividend compounding');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'dividend snowball, compound dividends, dividend reinvestment, DRIP, passive income growth, wealth building, investment strategy, dividend compounding';
      document.head.appendChild(meta);
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "DivTrkr - Learn Dividend Snowball",
      "description": "Comprehensive guide to the dividend snowball strategy and compound dividend investing",
      "url": window.location.href,
      "educationalCredentialAwarded": "Financial Education"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              The <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dividend Snowball</span> Strategy
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Harness the power of compound growth to transform your dividends into an 
              <span className="font-semibold text-primary"> exponentially growing income stream</span>
            </p>
          </div>
        </div>
      </section>

      {/* Educational Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            See the Snowball Effect in Action
          </h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/c7fWmCw4cOg?rel=0&enablejsapi=1"
              title="Build a Dividend Snowball → Live Off Dividends (the fastest way!)"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Discover how small dividend payments can grow into substantial income streams
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-24">
          {/* What is the Dividend Snowball */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <Snowflake className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">What Is the Dividend Snowball?</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  The dividend snowball strategy involves <span className="font-semibold text-foreground">automatically reinvesting</span> all dividend payments 
                  to purchase more shares of dividend-paying stocks. Just like a snowball rolling down a hill grows larger and faster, 
                  your dividend income accelerates as you accumulate more shares.
                </p>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  This strategy leverages <span className="font-semibold text-primary">compound growth</span> - you earn dividends on your original investment, 
                  then earn dividends on those reinvested dividends, creating an exponential growth effect over time.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/1oANdVB_rtU?rel=0&enablejsapi=1"
                    title="Why Dividend Snowballs Create Millionaire Investors"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <RefreshCw className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">The Snowball Process</h2>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                Here's how the dividend snowball creates exponential growth:
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Invest in Dividend Stocks</h3>
                  <p className="text-sm text-muted-foreground">Start with quality dividend-paying companies</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Receive Dividends</h3>
                  <p className="text-sm text-muted-foreground">Collect dividend payments from your holdings</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Reinvest Automatically</h3>
                  <p className="text-sm text-muted-foreground">Use dividends to buy more shares through DRIP programs</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Accelerating Growth</h3>
                  <p className="text-sm text-muted-foreground">More shares generate more dividends, creating a snowball effect</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-background/50 rounded-xl">
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  <span className="font-semibold text-foreground">Example:</span> If you own 100 shares paying $1 per share annually, you receive $100. 
                  Reinvesting that $100 at $50/share gives you 2 more shares. Now you own 102 shares, earning $102 next year. 
                  The growth compounds exponentially over time!
                </p>
              </div>
            </div>
          </section>

          {/* Power of Compounding */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <BarChart className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">The Power of Compound Growth</h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                The dividend snowball becomes more powerful over time. Here's a hypothetical example of $10,000 invested at 4% annual dividend yield:
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 lg:p-12 mb-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-primary mb-2">Year 10</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">$592 annual income</p>
                    <p className="text-sm text-muted-foreground">With reinvestment</p>
                  </div>
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-accent mb-2">Year 20</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">$876 annual income</p>
                    <p className="text-sm text-muted-foreground">Snowball accelerating</p>
                  </div>
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-primary mb-2">Year 30</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">$1,297 annual income</p>
                    <p className="text-sm text-muted-foreground">Exponential growth</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-6 lg:p-8">
                <h4 className="text-xl font-semibold text-foreground mb-4 text-center">Key Insight</h4>
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  Without reinvestment, your annual income would stay at <span className="font-semibold text-foreground">$400</span> forever. 
                  With the snowball strategy, it grows to over <span className="font-bold text-primary">$1,297</span> in 30 years - 
                  that's more than <span className="font-bold text-accent">3x higher</span>!
                </p>
              </div>
            </div>
          </section>

          {/* Implementation Strategy */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <Target className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">How to Start Your Snowball</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
                  Starting your dividend snowball is easier than you might think. Follow these strategic steps 
                  to begin building your exponentially growing income stream:
                </p>
                
                <div className="space-y-4">
                  {[
                    { title: "Choose Quality Dividend Stocks", desc: "Focus on companies with consistent dividend growth histories" },
                    { title: "Set Up DRIP Programs", desc: "Enable Dividend Reinvestment Plans for automatic share purchases" },
                    { title: "Start Early", desc: "Time is your biggest advantage - even small amounts compound significantly" },
                    { title: "Add Regular Contributions", desc: "Accelerate the snowball with monthly or quarterly investments" },
                    { title: "Monitor and Adjust", desc: "Track your growing dividend income and rebalance as needed" },
                    { title: "Stay Patient", desc: "The real magic happens after 10-15 years of consistent reinvestment" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-xl hover-scale">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/4NV3SVmnfu4?rel=0&enablejsapi=1"
                    title="Dividend Investing for Beginners – How You Can Retire from Stocks"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 lg:p-12 animate-fade-in">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Start Building Your Dividend Snowball Today
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Track your reinvested dividends and watch your snowball grow with DivTrkr. 
              See your compound growth in action and stay motivated on your wealth-building journey.
            </p>
            <Button size="lg" asChild className="hover-scale px-8 py-6 text-lg">
              <Link to="/">
                Begin Your Snowball Strategy
              </Link>
            </Button>
          </div>
        </div>
      </main>

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
              <span className="text-sm text-muted-foreground">
                © 2024 DivTrkr. All rights reserved.
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right max-w-md">
              This content is for educational purposes only and does not constitute financial advice. 
              Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};