import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Calculator, PiggyBank, TrendingUp, Calendar, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";

export const LearnFIRE = () => {
  useEffect(() => {
    // Add SEO meta tags
    document.title = "Learn About FIRE Movement - Financial Independence Retire Early Guide | DivTrkr";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Master the FIRE movement strategy and learn how to achieve financial independence and retire early. Discover proven methods for building wealth and creating passive income streams.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Master the FIRE movement strategy and learn how to achieve financial independence and retire early. Discover proven methods for building wealth and creating passive income streams.';
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'FIRE movement, financial independence, retire early, passive income, savings rate, investment strategies, early retirement, financial freedom, lean FIRE, fat FIRE');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'FIRE movement, financial independence, retire early, passive income, savings rate, investment strategies, early retirement, financial freedom, lean FIRE, fat FIRE';
      document.head.appendChild(meta);
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "DivTrkr - Learn FIRE Movement",
      "description": "Comprehensive guide to the FIRE movement and achieving financial independence",
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
              The <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FIRE Movement</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Achieve <span className="font-semibold text-primary">Financial Independence, Retire Early</span> and 
              take control of your time and future through strategic saving and investing
            </p>
          </div>
        </div>
      </section>

      {/* Educational Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Your Journey to Financial Independence Starts Here
          </h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-muted">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/isqpzOsMluI?rel=0&enablejsapi=1"
              title="Financial Independence Retire Early (FIRE) Explained - J.P. Morgan"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="text-muted-foreground mt-4 text-lg">
            Discover how ordinary people achieve extraordinary financial freedom
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-24">
          {/* What is FIRE */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <Flame className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">What Is the FIRE Movement?</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  FIRE stands for <span className="font-semibold text-foreground">Financial Independence, Retire Early</span>. 
                  It's a movement focused on saving and investing aggressively to achieve financial freedom much earlier than traditional retirement age, 
                  often in your 30s, 40s, or 50s.
                </p>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  The core principle is building a portfolio large enough that <span className="font-semibold text-primary">investment returns alone</span> 
                  can cover your living expenses, giving you the freedom to work by choice rather than necessity.
                </p>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  FIRE isn't about deprivation - it's about <span className="font-semibold text-accent">intentional spending</span> and prioritizing 
                  long-term freedom over short-term consumption.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/Kn0a9UZpWhM?rel=0&enablejsapi=1"
                    title="Follow These Steps to Retire Early - Financial Independence for Beginners"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Types of FIRE */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <Award className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Types of FIRE</h2>
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-8 lg:p-12">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                Choose the FIRE approach that fits your lifestyle and goals:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Lean FIRE</h3>
                  <p className="text-muted-foreground mb-4">$25k - $40k annual expenses</p>
                  <p className="text-sm text-muted-foreground">Minimalist lifestyle with basic needs covered. Requires $625k - $1M portfolio.</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Regular FIRE</h3>
                  <p className="text-muted-foreground mb-4">$40k - $100k annual expenses</p>
                  <p className="text-sm text-muted-foreground">Comfortable middle-class lifestyle. Requires $1M - $2.5M portfolio.</p>
                </div>
                
                <div className="bg-background rounded-xl p-6 text-center hover-scale">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-xl">Fat FIRE</h3>
                  <p className="text-muted-foreground mb-4">$100k+ annual expenses</p>
                  <p className="text-sm text-muted-foreground">Luxury lifestyle with high-end purchases. Requires $2.5M+ portfolio.</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-background/50 rounded-xl">
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  <span className="font-semibold text-foreground">The 4% Rule:</span> Most FIRE calculations use the 4% withdrawal rule - 
                  if you can live on 4% of your portfolio annually, you've achieved financial independence. 
                  Multiply your annual expenses by 25 to find your FIRE number.
                </p>
              </div>
            </div>
          </section>

          {/* The Path to FIRE */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 hover-scale">
                <Calculator className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Your Path to FIRE</h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8 text-center">
                The journey to FIRE depends heavily on your savings rate. Here's how different savings rates affect your timeline:
              </p>
              
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 lg:p-12 mb-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-primary mb-2">10%</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">51 years</p>
                    <p className="text-sm text-muted-foreground">Savings rate</p>
                  </div>
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-accent mb-2">25%</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">32 years</p>
                    <p className="text-sm text-muted-foreground">Savings rate</p>
                  </div>
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-primary mb-2">50%</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">17 years</p>
                    <p className="text-sm text-muted-foreground">Savings rate</p>
                  </div>
                  <div className="text-center bg-background/50 rounded-xl p-6">
                    <h4 className="text-3xl font-bold text-accent mb-2">70%</h4>
                    <p className="text-lg font-semibold text-foreground mb-1">8.5 years</p>
                    <p className="text-sm text-muted-foreground">Savings rate</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-6 lg:p-8">
                <h4 className="text-xl font-semibold text-foreground mb-4 text-center">The Power of High Savings Rates</h4>
                <p className="text-lg text-muted-foreground text-center leading-relaxed">
                  By saving 50% of your income instead of the traditional 10%, you can achieve financial independence 
                  in <span className="font-bold text-primary">17 years instead of 51</span> - that's the difference between 
                  retiring at 42 versus 76 if you start at 25!
                </p>
              </div>
            </div>
          </section>

          {/* FIRE Strategies */}
          <section className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6 hover-scale">
                <Calendar className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">FIRE Strategy Essentials</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
                  Achieving FIRE requires a comprehensive strategy combining aggressive saving, smart investing, 
                  and lifestyle optimization. Here are the key pillars:
                </p>
                
                <div className="space-y-4">
                  {[
                    { title: "Maximize Income", desc: "Develop high-value skills, pursue promotions, or start side hustles" },
                    { title: "Minimize Expenses", desc: "Cut unnecessary spending while maintaining quality of life" },
                    { title: "Invest Wisely", desc: "Focus on low-cost index funds and dividend-paying stocks" },
                    { title: "Optimize Taxes", desc: "Use tax-advantaged accounts like 401(k)s and IRAs" },
                    { title: "Build Multiple Income Streams", desc: "Create passive income through dividends, real estate, or businesses" },
                    { title: "Track Everything", desc: "Monitor net worth, savings rate, and progress toward your FIRE number" }
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
                  Remember: FIRE is a marathon, not a sprint. <span className="font-semibold text-primary">Consistency and patience</span> 
                  are more important than perfection. Start where you are and gradually increase your savings rate.
                </p>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/TmVLKtHgrog?rel=0&enablejsapi=1"
                    title="How to Retire Early: A 10-Year Plan to Go from $1,000 to FIRE"
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
              Start Your FIRE Journey Today
            </h3>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Track your dividend income and investment progress with DivTrkr. 
              Build the passive income streams that will fuel your path to financial independence.
            </p>
            <Button size="lg" asChild className="hover-scale px-8 py-6 text-lg">
              <Link to="/">
                Begin Your FIRE Journey
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