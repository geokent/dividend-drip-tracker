import { FAQ } from "@/components/FAQ";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  return (
    <AppLayout>
      <SEOHead
        title="Dividend Tracking FAQ | Common Questions Answered"
        description="Get answers to frequently asked questions about dividend investing, portfolio tracking, and using DivTrkr. Learn about dividend yields, DRIP, tax implications, and more."
        keywords="dividend FAQ, dividend investing questions, portfolio tracking help, dividend yield explained, DRIP guide"
        canonicalUrl="https://divtrkr.lovable.app/faq"
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'FAQ' }]} />
        <PageHeader
          title="Frequently Asked Questions"
          description="Common questions about dividend investing and our platform"
          icon={HelpCircle}
        />
        <FAQ />
      </div>
    </AppLayout>
  );
}