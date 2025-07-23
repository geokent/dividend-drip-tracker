import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/5 backdrop-blur-lg bg-white/95 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
                  alt="DivTrkr Logo" 
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using DivTrkr ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DivTrkr is a dividend tracking and portfolio management platform that helps users monitor their dividend income and investment performance. The service provides tools for tracking dividend payments, analyzing portfolio performance, and projecting future income.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Financial Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-foreground font-medium mb-2">Important Investment Disclaimer:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>DivTrkr is for informational purposes only and does not provide investment advice</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>All investments carry risk of loss</li>
                  <li>You should consult with qualified financial advisors before making investment decisions</li>
                  <li>We are not responsible for any investment decisions made based on information from our platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate and up-to-date financial information, we cannot guarantee the accuracy, completeness, or timeliness of any data displayed on our platform. Users should verify all information independently before making financial decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to use the service:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service may integrate with third-party services (such as brokerage account connections). We are not responsible for the practices or content of these third-party services. Your use of such services is subject to their respective terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall DivTrkr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our website or at the contact information provided on our platform.
              </p>
            </section>

          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="px-8">
            <Link to="/">
              Return to DivTrkr
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png" 
              alt="DivTrkr Logo" 
              className="h-6 w-auto"
            />
          </div>
          <p className="text-muted-foreground">
            © 2024 DivTrkr. Building wealth through intelligent dividend investing.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;