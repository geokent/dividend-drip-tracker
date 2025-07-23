import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, Calculator, Target } from "lucide-react";
import { Link } from "react-router-dom";

export const LearnDividends = () => {
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
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Learn About <span className="text-primary">Dividends</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Understanding the fundamentals of dividend investing and how to build passive income
          </p>
        </div>

        <div className="space-y-16">
          {/* What are Dividends */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">What Are Dividends?</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Dividends are cash payments that companies make to their shareholders as a way to share profits. 
                When you own shares of a dividend-paying stock, you're entitled to receive these payments on a regular basis - 
                typically quarterly, but sometimes monthly or annually.
              </p>
              <p>
                Think of dividends as a "thank you" bonus from profitable companies. Instead of keeping all their earnings, 
                these companies choose to reward their investors by distributing a portion of their profits directly to shareholders.
              </p>
            </div>
          </section>

          {/* How Dividends Work */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">How Do Dividends Work?</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                When a company declares a dividend, they announce several important dates:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Declaration Date:</strong> When the company announces the dividend payment</li>
                <li><strong>Ex-Dividend Date:</strong> The last day to buy the stock and still receive the dividend</li>
                <li><strong>Record Date:</strong> When the company determines who owns shares and is eligible</li>
                <li><strong>Payment Date:</strong> When the dividend is actually paid to shareholders</li>
              </ul>
              <p>
                The dividend amount is typically expressed as dollars per share. For example, if a company pays a $0.50 quarterly dividend 
                and you own 100 shares, you'll receive $50 every quarter.
              </p>
            </div>
          </section>

          {/* Dividend Yield */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Understanding Dividend Yield</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Dividend yield is a key metric that shows how much income you're earning relative to your investment. 
                It's calculated as:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 my-6">
                <p className="text-center text-lg font-semibold text-foreground">
                  Dividend Yield = (Annual Dividend per Share ÷ Stock Price) × 100
                </p>
              </div>
              <p>
                For example, if a stock costs $100 and pays $4 per year in dividends, the dividend yield is 4%. 
                This means you're earning a 4% return on your investment just from dividends, not counting any stock price appreciation.
              </p>
            </div>
          </section>

          {/* Building Passive Income */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Building Passive Income</h2>
            </div>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                The real power of dividend investing comes from building a portfolio of dividend-paying stocks that 
                generates regular passive income. Here's how to get started:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Start Small:</strong> You don't need thousands of dollars to begin dividend investing</li>
                <li><strong>Diversify:</strong> Invest in different sectors and companies to reduce risk</li>
                <li><strong>Reinvest:</strong> Use dividend payments to buy more shares and compound your returns</li>
                <li><strong>Focus on Quality:</strong> Look for companies with consistent dividend payment histories</li>
                <li><strong>Track Progress:</strong> Monitor your growing dividend income over time</li>
              </ul>
              <p>
                Many successful investors use dividend investing as a cornerstone of their wealth-building strategy, 
                gradually building a portfolio that can provide financial independence through passive income.
              </p>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Start Your Dividend Journey?
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Track your dividend income and watch your passive income grow with DivTrkr.
          </p>
          <Button size="lg" asChild>
            <Link to="/">
              Get Started for Free
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-background mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-6 w-auto mr-3 hover:opacity-80 transition-opacity"
                />
              </Link>
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