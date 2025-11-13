import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Users, Shield } from "lucide-react";

export const About = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About DivTrkr",
    "description": "Learn about DivTrkr's mission to help investors build passive income through dividend investing",
    "url": "https://www.divtrkr.com/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "DivTrkr",
      "url": "https://www.divtrkr.com",
      "logo": "https://www.divtrkr.com/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png",
      "description": "DivTrkr is a comprehensive dividend tracking platform helping investors build passive income and achieve financial independence",
      "foundingDate": "2024",
      "sameAs": [
        "https://twitter.com/divtrkr",
        "https://linkedin.com/company/divtrkr"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About DivTrkr - Our Mission to Help You Build Passive Income"
        description="Learn about DivTrkr's mission to empower dividend investors. We provide tools, education, and insights to help you build passive income and achieve financial independence."
        keywords="about divtrkr, dividend tracking platform, passive income tools, investment education, financial independence platform"
        canonicalUrl="https://www.divtrkr.com/about"
        structuredData={structuredData}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">DivTrkr</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering investors to build passive income and achieve financial independence through dividend investing
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    At DivTrkr, we believe that everyone deserves the opportunity to build lasting wealth through dividend investing. 
                    Our mission is to make dividend tracking simple, accessible, and actionable for investors at every level.
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    We created DivTrkr because we know the power of passive income. Whether you're just starting your investment 
                    journey or working toward early retirement through the FIRE movement, tracking your dividend income is essential 
                    to building long-term wealth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Simplicity First</h3>
                <p className="text-muted-foreground">
                  We believe powerful tools don't need to be complicated. DivTrkr is designed to be intuitive 
                  and easy to use, so you can focus on what matters: growing your wealth.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Education & Growth</h3>
                <p className="text-muted-foreground">
                  We're committed to helping investors learn and grow. Our Learning Academy provides comprehensive 
                  education on dividend investing, FIRE strategy, and wealth building.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Trust & Transparency</h3>
                <p className="text-muted-foreground">
                  Your financial data is sacred. We use bank-level security to protect your information and 
                  never share your data with third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">The Team Behind DivTrkr</h2>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">George - Founder</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    George is a passionate dividend investor with over 10 years of experience building passive income portfolios. 
                    After struggling to find a simple, comprehensive tool to track dividend income, he created DivTrkr to help 
                    investors like himself monitor their progress toward financial independence.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    With a background in software engineering and a deep understanding of dividend investing strategies, George 
                    combines technical expertise with practical investment knowledge to build tools that actually work for real investors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why DivTrkr Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-10">Why DivTrkr?</h2>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">📊 Real-Time Portfolio Tracking</h3>
                  <p className="text-muted-foreground">
                    Connect your brokerage accounts and automatically sync your holdings. See your entire dividend 
                    portfolio in one place with real-time updates.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">💰 Dividend Income Projections</h3>
                  <p className="text-muted-foreground">
                    Visualize your future passive income with detailed projections showing how your dividend income 
                    will grow over time with continued investing.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">📚 Educational Resources</h3>
                  <p className="text-muted-foreground">
                    Access our comprehensive Learning Academy covering dividend fundamentals, FIRE strategy, and 
                    the dividend snowball effect. Plus, read our blog for the latest insights and strategies.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">🎯 FIRE-Focused Tools</h3>
                  <p className="text-muted-foreground">
                    Whether you're pursuing Financial Independence, Retire Early or simply building passive income, 
                    DivTrkr provides the tools and insights you need to reach your goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                We'd love to hear from you. Whether you have feedback, questions, or just want to share your 
                dividend investing success story, reach out anytime.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};
