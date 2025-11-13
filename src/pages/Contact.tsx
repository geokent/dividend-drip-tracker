import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, HelpCircle, Twitter } from "lucide-react";

export const Contact = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact DivTrkr",
    "description": "Get in touch with the DivTrkr team. We're here to help with questions, feedback, and support.",
    "url": "https://www.divtrkr.com/contact"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact DivTrkr - Get in Touch With Our Team"
        description="Have questions about dividend tracking or need help? Contact the DivTrkr team. We're here to help you succeed with your dividend investing journey."
        keywords="contact divtrkr, dividend tracker support, customer service, help, feedback, questions"
        canonicalUrl="https://www.divtrkr.com/contact"
        structuredData={structuredData}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need help? We're here to support your dividend investing journey.
          </p>
        </section>

        {/* Contact Options */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="p-8">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Email Us</h2>
              <p className="text-muted-foreground mb-4">
                For general inquiries, support questions, or detailed feedback, send us an email and we'll respond 
                within 24-48 hours.
              </p>
              <a 
                href="mailto:support@divtrkr.com" 
                className="text-primary hover:underline font-semibold"
              >
                support@divtrkr.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Feedback & Suggestions</h2>
              <p className="text-muted-foreground mb-4">
                Have ideas for new features or improvements? We'd love to hear from you. Your feedback helps us 
                make DivTrkr better for everyone.
              </p>
              <a 
                href="mailto:feedback@divtrkr.com" 
                className="text-primary hover:underline font-semibold"
              >
                feedback@divtrkr.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <HelpCircle className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">FAQs</h2>
              <p className="text-muted-foreground mb-4">
                Looking for quick answers? Check out our frequently asked questions page for help with common 
                questions about using DivTrkr.
              </p>
              <a 
                href="/faq" 
                className="text-primary hover:underline font-semibold"
              >
                Visit FAQs →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <Twitter className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Social Media</h2>
              <p className="text-muted-foreground mb-4">
                Follow us on social media for updates, tips, and insights about dividend investing and financial 
                independence.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://twitter.com/divtrkr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Twitter
                </a>
                <span className="text-muted-foreground">•</span>
                <a 
                  href="https://linkedin.com/company/divtrkr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  LinkedIn
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Business Information */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Business Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <strong className="text-foreground">Company:</strong> DivTrkr
                </div>
                <div>
                  <strong className="text-foreground">Location:</strong> United States
                </div>
                <div>
                  <strong className="text-foreground">Response Time:</strong> We typically respond to all inquiries within 24-48 hours during business days
                </div>
                <div>
                  <strong className="text-foreground">Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM EST
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Additional Help */}
        <section>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Immediate Help?</h2>
              <p className="text-muted-foreground mb-6">
                Check out our comprehensive FAQ section for instant answers to common questions about dividend 
                tracking, portfolio management, and using DivTrkr's features.
              </p>
              <a 
                href="/faq" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Visit FAQ
              </a>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};
