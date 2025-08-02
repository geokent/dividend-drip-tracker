import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Key Privacy Points */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Bank-Level Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your financial data is protected with enterprise-grade encryption and security protocols.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">No Data Selling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We never sell, rent, or share your personal information with third parties for marketing purposes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Minimal Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We only collect the minimum data necessary to provide our dividend tracking services.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">Account Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Email address and display name when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Password (encrypted and never stored in plain text)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">Financial Data</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                <li>Portfolio holdings and dividend payment information</li>
                <li>Investment performance data you choose to track</li>
                <li>Brokerage account connection data (when you choose to link accounts)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>How you interact with our platform</li>
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain our dividend tracking services</li>
                <li>To process and display your investment data</li>
                <li>To send important account and service updates</li>
                <li>To improve our platform and develop new features</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Information Sharing</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <p className="text-foreground font-medium mb-2">Our Commitment:</p>
                <p className="text-muted-foreground">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </div>
              
              <p className="text-muted-foreground leading-relaxed mb-4">We may share information only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Service Providers:</strong> With trusted partners who help us operate our platform (all under strict confidentiality agreements)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with the same privacy protections)</li>
                <li><strong>With Your Consent:</strong> Any other sharing will require your explicit permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure server infrastructure with regular security updates</li>
                <li>Multi-factor authentication options</li>
                <li>Regular security audits and monitoring</li>
                <li>Limited employee access to personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Integrations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you choose to manually add financial information, we ensure this data is securely stored and handled. Our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Only access data you explicitly authorize</li>
                <li>Use bank-level security protocols</li>
                <li>Can be revoked by you at any time</li>
                <li>Are subject to the privacy policies of those providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Restrict:</strong> Limit how we process your information</li>
                <li><strong>Withdraw Consent:</strong> Revoke permissions you've previously given</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information only as long as necessary to provide our services or as required by law. When you delete your account, we will permanently delete your personal data within 30 days, except for information we're legally required to retain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage to improve our services</li>
                <li>Ensure platform security</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 18. We do not knowingly collect personal information from children under 18. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Users</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are accessing our service from outside the United States, please note that your information may be transferred to, stored, and processed in the United States where our servers are located.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us through our website or at the contact information provided on our platform.
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

export default Privacy;