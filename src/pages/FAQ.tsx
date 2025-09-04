import { FAQ } from "@/components/FAQ";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Frequently Asked Questions"
        description="Common questions about dividend investing and our platform"
        icon={HelpCircle}
      />
      <FAQ />
    </AppLayout>
  );
}