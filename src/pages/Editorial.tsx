import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Search, RefreshCw, Shield, AlertCircle, FileText } from "lucide-react";

export const Editorial = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Editorial Standards & Content Policy",
    "description": "Learn about DivTrkr's editorial standards, fact-checking process, and content methodology",
    "url": "https://www.divtrkr.com/editorial"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Editorial Standards & Content Policy - DivTrkr"
        description="Learn about DivTrkr's editorial standards, fact-checking process, research methodology, and commitment to providing accurate, trustworthy dividend investing information."
        keywords="editorial standards, content policy, fact checking, research methodology, investment content, financial accuracy"
        canonicalUrl="https://www.divtrkr.com/editorial"
        structuredData={structuredData}
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Editorial <span className="text-primary">Standards</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to providing accurate, trustworthy, and actionable dividend investing information
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Our Editorial Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                At DivTrkr, we are committed to providing investors with accurate, reliable, and actionable information 
                about dividend investing. Every piece of content we publish undergoes rigorous research, fact-checking, 
                and review to ensure it meets our high standards for quality and accuracy.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We believe that informed investors make better decisions. Our goal is to educate, empower, and inspire 
                investors to build lasting wealth through dividend investing strategies.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Research Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Research Process</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <Search className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">1. Primary Research</h3>
                <p className="text-muted-foreground">
                  We conduct extensive research using official company filings, financial statements, earnings reports, 
                  and regulatory disclosures from sources like SEC Edgar, company investor relations pages, and verified 
                  financial databases.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <CheckCircle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">2. Data Verification</h3>
                <p className="text-muted-foreground">
                  All financial data, statistics, and claims are cross-referenced with multiple authoritative sources 
                  to ensure accuracy. We verify dividend yields, payout ratios, ex-dividend dates, and company fundamentals 
                  before publication.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <FileText className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">3. Expert Review</h3>
                <p className="text-muted-foreground">
                  Content is reviewed by our team of dividend investing experts with real-world experience managing 
                  portfolios and achieving financial independence through passive income strategies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <RefreshCw className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">4. Regular Updates</h3>
                <p className="text-muted-foreground">
                  We regularly review and update our content to reflect current market conditions, new data, and 
                  changes in dividend policies. Articles include "Last Updated" dates for transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Content Standards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Content Standards</h2>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Accuracy & Fact-Checking
                  </h3>
                  <p className="text-muted-foreground">
                    Every article is thoroughly fact-checked before publication. We cite authoritative sources, verify 
                    all statistics, and ensure financial data is current and accurate. Any corrections are made promptly 
                    and noted transparently.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Objectivity & Transparency
                  </h3>
                  <p className="text-muted-foreground">
                    We maintain editorial independence and do not accept payment for coverage or recommendations. 
                    Any affiliations, partnerships, or potential conflicts of interest are clearly disclosed.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Source Attribution
                  </h3>
                  <p className="text-muted-foreground">
                    We properly cite and link to all sources of data, research, and information. This allows readers 
                    to verify information and explore topics further.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Clear Disclaimers
                  </h3>
                  <p className="text-muted-foreground">
                    All content includes appropriate disclaimers making it clear that our content is for educational 
                    purposes only and not personalized investment advice. We encourage readers to consult with financial 
                    professionals for their specific situations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Sources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Trusted Data Sources</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                We rely on authoritative, verified sources for all financial data and investment information:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong className="text-foreground">SEC Edgar Database:</strong> Official company filings, 10-Ks, 10-Qs, and proxy statements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong className="text-foreground">Company Investor Relations:</strong> Official dividend announcements and financial reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong className="text-foreground">Financial Data Providers:</strong> Verified market data from established financial institutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong className="text-foreground">Industry Research:</strong> Reports from reputable financial research firms and institutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong className="text-foreground">Academic Studies:</strong> Peer-reviewed research on investing strategies and market performance</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Corrections Policy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Corrections Policy</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                We strive for accuracy in all our content, but if an error is identified, we take immediate action 
                to correct it. Material corrections are clearly noted at the top of the article with the date of 
                correction and nature of the error.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                If you believe you've found an error in our content, please contact us at{' '}
                <a href="mailto:editorial@divtrkr.com" className="text-primary hover:underline">
                  editorial@divtrkr.com
                </a>{' '}
                with details, and we will investigate promptly.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <section className="mb-16">
          <Card className="bg-muted/50 border-muted">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                Important Disclaimer
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The content provided on DivTrkr is for informational and educational purposes only. It is not 
                  intended as investment advice, financial advice, or a recommendation to buy or sell any security.
                </p>
                <p>
                  All investing involves risk, including the potential loss of principal. Past performance does not 
                  guarantee future results. Dividend payments are not guaranteed and can be reduced or eliminated at 
                  any time by the issuing company.
                </p>
                <p>
                  Before making any investment decisions, you should consult with a qualified financial advisor who 
                  can assess your individual circumstances, financial goals, and risk tolerance.
                </p>
                <p>
                  DivTrkr and its authors may hold positions in the securities discussed in articles. We do not receive 
                  compensation from companies for coverage or recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Our Editorial Process?</h2>
              <p className="text-muted-foreground mb-6">
                We're committed to transparency and are happy to answer any questions about our editorial standards, 
                research methodology, or content review process.
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
