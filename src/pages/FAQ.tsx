import { FAQ } from "@/components/FAQ";
import { Header } from "@/components/Header";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container section-y">
        <FAQ />
      </main>
    </div>
  );
}