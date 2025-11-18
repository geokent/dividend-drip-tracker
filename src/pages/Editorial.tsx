import { AppLayout } from '@/components/layout/AppLayout';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Users, BookOpen, AlertCircle } from 'lucide-react';

export default function Editorial() {
  return (
    <AppLayout>
      <SEOHead 
        title="Editorial Standards & Team - DivTrkr"
        description="Learn about DivTrkr's editorial standards, research methodology, and meet our team of dividend investing experts committed to providing accurate, unbiased financial content."
        canonicalUrl="https://www.divtrkr.com/editorial"
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4">Editorial Standards</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Our Editorial Mission & Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Committed to providing accurate, unbiased, and actionable dividend investing information
            </p>
          </div>

          {/* Editorial Mission */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Editorial Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <p>
                At DivTrkr, we are dedicated to empowering investors with reliable, thoroughly researched information 
                about dividend investing. Our content is designed to help both beginners and experienced investors make 
                informed decisions about building sustainable passive income through dividend stocks.
              </p>
              <p>
                We maintain strict editorial independence and never allow advertising relationships to influence our 
                content, recommendations, or analysis.
              </p>
            </CardContent>
          </Card>

          {/* Research Process */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Our Research Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Primary Research</h3>
                  <p className="text-muted-foreground">
                    We analyze company financial statements, SEC filings, dividend history, and earnings reports 
                    directly from official sources including company investor relations pages and the SEC EDGAR database.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Data Verification</h3>
                  <p className="text-muted-foreground">
                    All dividend data, stock prices, and financial metrics are cross-referenced using multiple 
                    trusted financial data providers including Alpha Vantage and Financial Modeling Prep to ensure accuracy.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expert Review</h3>
                  <p className="text-muted-foreground">
                    Our content undergoes thorough review by experienced financial analysts and dividend investing 
                    experts before publication to ensure technical accuracy and practical applicability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Regular Updates</h3>
                  <p className="text-muted-foreground">
                    We continuously monitor and update our content to reflect current market conditions, dividend 
                    changes, and new investment opportunities to keep our readers informed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Standards */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Content Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Accuracy</h3>
                <p className="text-muted-foreground">
                  Every piece of financial data, statistic, and claim in our content is verified and cited from 
                  reputable sources. We prioritize factual accuracy above all else.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Objectivity</h3>
                <p className="text-muted-foreground">
                  We provide balanced perspectives on dividend investing strategies, highlighting both advantages 
                  and potential risks to help readers make well-informed decisions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Source Attribution</h3>
                <p className="text-muted-foreground">
                  All data sources, research studies, and expert opinions are properly cited and linked to original 
                  sources for reader verification and transparency.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Clear Disclaimers</h3>
                <p className="text-muted-foreground">
                  We clearly distinguish between educational content and personal financial advice, always reminding 
                  readers to consult with financial advisors for personalized guidance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meet Our Team */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Meet Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="font-semibold text-xl mb-1">Geo</h3>
                <p className="text-sm text-primary mb-3">Lead Financial Analyst</p>
                <p className="text-muted-foreground mb-3">
                  Lead financial analyst and dividend investing expert with over 10 years of experience in portfolio 
                  management. Specializes in dividend growth strategies, REITs, and building sustainable passive income 
                  streams. Geo has helped thousands of investors understand the fundamentals of dividend investing through 
                  clear, actionable content.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Dividend Growth</Badge>
                  <Badge variant="secondary">Portfolio Management</Badge>
                  <Badge variant="secondary">REIT Analysis</Badge>
                  <Badge variant="secondary">Passive Income Strategies</Badge>
                </div>
              </div>

              <div className="border-l-4 border-muted pl-6 py-2">
                <h3 className="font-semibold text-xl mb-1">DivTrkr Research Team</h3>
                <p className="text-sm text-primary mb-3">Content Contributors</p>
                <p className="text-muted-foreground mb-3">
                  Our dedicated research team consists of financial content writers specializing in dividend investing 
                  strategies, portfolio building, and long-term wealth creation. Each team member is passionate about 
                  helping investors achieve financial independence through smart dividend investing.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Financial Research</Badge>
                  <Badge variant="secondary">Content Writing</Badge>
                  <Badge variant="secondary">Market Analysis</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trusted Data Sources */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle>Trusted Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We source our financial data and market information from industry-leading providers:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Alpha Vantage</strong> - Real-time and historical stock market data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Financial Modeling Prep</strong> - Company financials and dividend information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>SEC EDGAR</strong> - Official company filings and disclosures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Company Investor Relations</strong> - Direct from company sources</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Corrections Policy */}
          <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle>Corrections Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <p>
                We strive for accuracy in all our content. If you notice an error or outdated information, please 
                contact us immediately at <a href="mailto:editorial@divtrkr.com" className="text-primary hover:underline">
                editorial@divtrkr.com</a>. We will review all correction requests promptly and update content as needed, 
                noting significant corrections at the top of the relevant article.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="mb-8 animate-fade-in border-warning/50" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-muted-foreground">
                The content on DivTrkr is for educational and informational purposes only. It should not be considered 
                personalized investment advice. All investing involves risk, including the potential loss of principal. 
                Past performance does not guarantee future results. Dividend payments are not guaranteed and can be 
                reduced or eliminated at any time by the issuing company.
              </p>
              <p className="text-muted-foreground">
                Before making any investment decisions, please consult with a qualified financial advisor who understands 
                your personal financial situation and goals. DivTrkr and its team members are not registered investment 
                advisors and do not provide personalized investment recommendations.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <CardHeader>
              <CardTitle>Contact Our Editorial Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For editorial inquiries, correction requests, or questions about our research methodology:
              </p>
              <p className="text-lg">
                <strong>Email:</strong>{' '}
                <a href="mailto:editorial@divtrkr.com" className="text-primary hover:underline">
                  editorial@divtrkr.com
                </a>
              </p>
              <p className="text-muted-foreground mt-4">
                <strong>Location:</strong> United States
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
