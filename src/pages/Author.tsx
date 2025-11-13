import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Target, Award, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const Author = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "George",
    "jobTitle": "Dividend Investing Expert & Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "DivTrkr",
      "url": "https://www.divtrkr.com"
    },
    "description": "Expert in dividend investing with over 10 years of experience helping investors build passive income portfolios and achieve financial independence.",
    "knowsAbout": [
      "Dividend Investing",
      "FIRE Movement",
      "Portfolio Management",
      "Passive Income Strategies",
      "Financial Independence"
    ],
    "url": "https://www.divtrkr.com/author"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="George - Dividend Investing Expert & DivTrkr Founder"
        description="Meet George, dividend investing expert and founder of DivTrkr. With over 10 years of experience, George helps investors build passive income and achieve financial independence."
        keywords="george divtrkr, dividend investing expert, fire movement expert, passive income specialist, portfolio management expert"
        canonicalUrl="https://www.divtrkr.com/author"
        structuredData={structuredData}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <TrendingUp className="h-20 w-20 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    George
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Dividend Investing Expert & Founder of DivTrkr
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary">Dividend Investing</Badge>
                    <Badge variant="secondary">FIRE Movement</Badge>
                    <Badge variant="secondary">Portfolio Management</Badge>
                    <Badge variant="secondary">Financial Independence</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Expert in dividend investing with over 10 years of experience helping investors build passive 
                    income portfolios and achieve financial independence through proven strategies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bio Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">About George</h2>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  George is a passionate dividend investor and the founder of DivTrkr, a comprehensive platform designed 
                  to help investors track their dividend income and build lasting wealth through passive income strategies.
                </p>
                <p>
                  With over a decade of hands-on experience in dividend investing, George has built multiple successful 
                  passive income portfolios and helped thousands of investors understand the power of dividend growth 
                  investing. His expertise spans from individual stock selection to portfolio construction, tax optimization, 
                  and long-term wealth building strategies.
                </p>
                <p>
                  As a software engineer by trade and a dividend investor by passion, George combines technical expertise 
                  with deep financial knowledge to create tools that actually work for real investors. He believes that 
                  everyone deserves access to simple, powerful tools to track their path to financial independence.
                </p>
                <p>
                  George is a strong advocate of the FIRE (Financial Independence, Retire Early) movement and has personally 
                  achieved financial independence through disciplined saving, strategic investing, and the consistent 
                  reinvestment of dividend income.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Expertise Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Areas of Expertise</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Dividend Stock Analysis</h3>
                <p className="text-muted-foreground">
                  Deep understanding of dividend sustainability metrics, payout ratios, dividend growth rates, 
                  and company fundamentals for selecting quality dividend stocks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">FIRE Strategy</h3>
                <p className="text-muted-foreground">
                  Practical experience achieving financial independence through the FIRE movement, including 
                  the 4% rule, safe withdrawal rates, and portfolio allocation strategies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Investment Education</h3>
                <p className="text-muted-foreground">
                  Creating comprehensive educational content that breaks down complex investing concepts into 
                  actionable strategies for investors at every level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Award className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Portfolio Management</h3>
                <p className="text-muted-foreground">
                  Hands-on experience building diversified dividend portfolios, rebalancing strategies, and 
                  optimizing for both income generation and capital appreciation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Credentials Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Background & Credentials</h2>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">10+ Years of Dividend Investing</h3>
                    <p className="text-muted-foreground">
                      Active dividend investor since 2014, building multiple six-figure passive income portfolios 
                      through consistent investing and dividend reinvestment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Software Engineering Background</h3>
                    <p className="text-muted-foreground">
                      Professional software engineer with expertise in building financial technology platforms 
                      and data-driven investment tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">FIRE Movement Advocate</h3>
                    <p className="text-muted-foreground">
                      Achieved financial independence through the FIRE movement principles and now helps others 
                      on their journey to financial freedom.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Content Creator & Educator</h3>
                    <p className="text-muted-foreground">
                      Published numerous articles on dividend investing, portfolio management, and financial 
                      independence, reaching thousands of investors worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Articles Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Latest Articles by George</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                George has written extensively about dividend investing, covering topics from beginner fundamentals 
                to advanced portfolio strategies. Here are some of his most popular articles:
              </p>
              <div className="space-y-3">
                <Link 
                  to="/blog/best-dividend-stocks-beginners-2025" 
                  className="block text-primary hover:underline font-semibold"
                >
                  → Best Dividend Stocks for Beginners in 2025
                </Link>
                <Link 
                  to="/blog/build-100k-dividend-portfolio" 
                  className="block text-primary hover:underline font-semibold"
                >
                  → How to Build a $100K Dividend Portfolio
                </Link>
                <Link 
                  to="/blog/fire-movement-dividend-investing" 
                  className="block text-primary hover:underline font-semibold"
                >
                  → FIRE Movement and Dividend Investing
                </Link>
                <Link 
                  to="/blog" 
                  className="block text-primary hover:underline font-semibold mt-4"
                >
                  View All Articles →
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Start Your Dividend Journey</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of investors using DivTrkr to track their dividend income and build passive wealth.
              </p>
              <a 
                href="/auth" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </a>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};
