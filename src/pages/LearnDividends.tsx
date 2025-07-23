import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, Calculator, Target, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export const LearnDividends = () => {
  useEffect(() => {
    // Add SEO meta tags
    document.title = "Learn About Dividends - Complete Guide to Dividend Investing | DivTrkr";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn everything about dividend investing with our comprehensive guide. Understand dividend yields, passive income strategies, and how to build wealth through dividend-paying stocks.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn everything about dividend investing with our comprehensive guide. Understand dividend yields, passive income strategies, and how to build wealth through dividend-paying stocks.';
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'dividend investing, passive income, dividend yield, stock dividends, financial independence, FIRE movement, investment education');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'dividend investing, passive income, dividend yield, stock dividends, financial independence, FIRE movement, investment education';
      document.head.appendChild(meta);
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "DivTrkr - Learn Dividends",
      "description": "Comprehensive guide to dividend investing and passive income strategies",
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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-8 w-auto mr-3 hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <Button variant="outline" asChild className="hover-scale">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Learn About <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dividends</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master the fundamentals of dividend investing and discover how to build 
              <span className="font-semibold text-primary"> passive income streams</span> that work for you
            </p>
          </div>
        </div>
      </section>

      {/* Educational Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Start Your Journey with This Essential Video
          </h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted group hover-scale">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/D7K_ZnM3Zqg"
              title="Dividend Investing for Beginners"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Play className="h-16 w-16 text-white" />
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Warren Buffett explains the power of dividend investing in under 10 minutes
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-24">
          {/* What are Dividends */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">What Are Dividends?</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Dividends are <span className="font-semibold text-foreground">cash payments</span> that companies make to their shareholders as a way to share profits. 
                  When you own shares of a dividend-paying stock, you're entitled to receive these payments on a regular basis - 
                  typically quarterly, but sometimes monthly or annually.
                </p>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  Think of dividends as a <span className="font-semibold text-primary">"thank you" bonus</span> from profitable companies. Instead of keeping all their earnings, 
                  these companies choose to reward their investors by distributing a portion of their profits directly to shareholders.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/G3JkzPKyBnI"
                    title="What Are Dividends Explained"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>

          {/* How Dividends Work */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <TrendingUp className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">How Do Dividends Work?</h2>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                When a company declares a dividend, they announce several important dates:
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Declaration Date</h3>
                  <p className="text-sm text-muted-foreground">When the company announces the dividend payment</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Ex-Dividend Date</h3>
                  <p className="text-sm text-muted-foreground">The last day to buy the stock and still receive the dividend</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Record Date</h3>
                  <p className="text-sm text-muted-foreground">When the company determines who owns shares and is eligible</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Payment Date</h3>
                  <p className="text-sm text-muted-foreground">When the dividend is actually paid to shareholders</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-background/50 rounded-xl">
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  The dividend amount is typically expressed as <span className="font-semibold text-foreground">dollars per share</span>. For example, if a company pays a $0.50 quarterly dividend 
                  and you own 100 shares, you'll receive <span className="font-semibold text-primary">$50 every quarter</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Dividend Yield */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <Calculator className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Understanding Dividend Yield</h2>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                Dividend yield is a key metric that shows how much income you're earning relative to your investment. 
                It's calculated as:
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 lg:p-12 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Dividend Yield Formula</h3>
                  <div className="text-xl lg:text-2xl font-semibold text-primary">
                    (Annual Dividend per Share ÷ Stock Price) × 100
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-6 lg:p-8">
                <h4 className="text-xl font-semibold text-foreground mb-4 text-center">Example Calculation</h4>
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  If a stock costs <span className="font-semibold text-foreground">$100</span> and pays <span className="font-semibold text-primary">$4 per year</span> in dividends, the dividend yield is <span className="font-bold text-accent">4%</span>. 
                  This means you're earning a 4% return on your investment just from dividends, not counting any stock price appreciation.
                </p>
              </div>
            </div>
          </section>

          {/* Building Passive Income */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <Target className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Building Passive Income</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
                  The real power of dividend investing comes from building a portfolio of dividend-paying stocks that 
                  generates regular passive income. Here's how to get started:
                </p>
                
                <div className="space-y-4">
                  {[
                    { title: "Start Small", desc: "You don't need thousands of dollars to begin dividend investing" },
                    { title: "Diversify", desc: "Invest in different sectors and companies to reduce risk" },
                    { title: "Reinvest", desc: "Use dividend payments to buy more shares and compound your returns" },
                    { title: "Focus on Quality", desc: "Look for companies with consistent dividend payment histories" },
                    { title: "Track Progress", desc: "Monitor your growing dividend income over time" }
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
                
                <p className="text-lg text-muted-foreground leading-relaxed mt-8">
                  Many successful investors use dividend investing as a cornerstone of their wealth-building strategy, 
                  gradually building a portfolio that can provide <span className="font-semibold text-primary">financial independence</span> through passive income.
                </p>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/7RtxNUKZ4bc"
                    title="Building Passive Income with Dividends"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              Ready to Start Your Dividend Journey?
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Track your dividend income and watch your passive income grow with DivTrkr. 
              Join thousands of investors building wealth through dividends.
            </p>
            <Button size="lg" asChild className="hover-scale px-8 py-6 text-lg">
              <Link to="/">
                Get Started for Free
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