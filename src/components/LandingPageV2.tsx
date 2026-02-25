import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import FIREDemo from "@/components/landing/FIREDemo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  RefreshCw,
  Calendar,
  TrendingUp,
  Search,
  BarChart3,
  Link as LinkIcon,
  Smartphone,
  CheckCircle,
  Shield,
  Check,
  X,
  Clock,
  Building,
  ArrowRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import plaidLogo from "@/assets/plaid-logo.png";

const LandingPageV2 = () => {
  const [annualIncome, setAnnualIncome] = useState("");
  const [desiredPassiveIncome, setDesiredPassiveIncome] = useState("");
  const [fireResult, setFireResult] = useState<{
    years: number;
    targetPortfolio: number;
    fireYear: number;
  } | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCalculate = () => {
    const income = parseFloat(annualIncome);
    const desired = parseFloat(desiredPassiveIncome);

    if (!annualIncome || !desiredPassiveIncome) {
      toast({ title: "Missing fields", description: "Please fill in both fields", variant: "destructive" });
      return;
    }
    if (isNaN(income) || income <= 0) {
      toast({ title: "Invalid input", description: "Please enter a positive income", variant: "destructive" });
      return;
    }
    if (isNaN(desired) || desired <= 0) {
      toast({ title: "Invalid input", description: "Please enter a positive amount for desired passive income", variant: "destructive" });
      return;
    }

    const targetPortfolio = desired * 25; // 4% rule
    const annualSavings = income * 0.20; // assume 20% savings rate
    const r = 0.07; // 7% annual return

    // Compound growth: years = ln((target * r / annualSavings) + 1) / ln(1 + r)
    const rawYears = Math.log((targetPortfolio * r / annualSavings) + 1) / Math.log(1 + r);

    if (isNaN(rawYears) || !isFinite(rawYears) || rawYears < 0) {
      setFireResult(null);
      toast({ title: "Unable to calculate", description: "Try adjusting your inputs.", variant: "destructive" });
      return;
    }

    const years = Math.min(Math.ceil(rawYears), 100);
    const currentYear = new Date().getFullYear();
    setFireResult({ years, targetPortfolio, fireYear: currentYear + years });
  };

  // Hero section features
  const heroFeatures = [
    {
      icon: Target,
      title: "FIRE Calculator",
      description: "Calculate when you can retire based on YOUR portfolio",
    },
    {
      icon: RefreshCw,
      title: "Auto-Sync Brokerage",
      description: "Connect Fidelity, Schwab, Vanguard via Plaid",
    },
    {
      icon: Calendar,
      title: "Dividend Calendar & Screener",
      description: "Never miss an ex-date. Screen 500+ dividend stocks",
    },
    {
      icon: TrendingUp,
      title: "30-Year Income Projections",
      description: "See Conservative, Moderate, Aggressive scenarios",
    },
  ];

  // Features showcase data
  const showcaseFeatures = [
    {
      icon: Calendar,
      emoji: "📅",
      title: "Dividend Calendar",
      description:
        "View all ex-dates and payment dates. Filter by sector, frequency. ETF-aware (SCHD, JEPQ breakdown).",
      link: "/dividend-calendar",
      cta: "View Calendar",
    },
    {
      icon: Target,
      emoji: "🎯",
      title: "FIRE Calculator",
      description:
        "Calculate when you can retire. Track progress to financial independence. Multiple milestone badges.",
      link: "/future-income-projects",
      cta: "Calculate Now",
    },
    {
      icon: Search,
      emoji: "🔍",
      title: "Stock Screener",
      description:
        "Filter 500+ dividend stocks. Aristocrats, Kings, high-yield. Payout ratio analysis.",
      link: "/stock-screener",
      cta: "Browse Stocks",
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Income Projections",
      description:
        "30-year projections. Conservative, Moderate, Aggressive scenarios. See different paths to FIRE.",
      link: "/future-income-projects",
      cta: "Project Income",
    },
    {
      icon: LinkIcon,
      emoji: "🔗",
      title: "Plaid Integration",
      description:
        "Sync Fidelity, Schwab, Vanguard. 12,000+ institutions supported. Secure, encrypted connections.",
      link: "/auth",
      cta: "Learn More",
    },
    {
      icon: Smartphone,
      emoji: "📱",
      title: "Mobile Friendly",
      description:
        "Track dividends anywhere. Responsive design. Works on all devices.",
      link: "/auth",
      cta: "Get Started",
    },
  ];

  // Comparison table data
  const comparisonFeatures = [
    { name: "FIRE Calculator", divtrkr: true, tyd: false, sheets: false, highlight: true },
    { name: "Auto-Sync Broker", divtrkr: true, tyd: true, sheets: false, highlight: false },
    { name: "Stock Screener", divtrkr: true, tyd: "premium", sheets: false, highlight: false },
    { name: "Dividend Calendar", divtrkr: true, tyd: true, sheets: false, highlight: false },
    { name: "30-Year Scenarios", divtrkr: true, tyd: false, sheets: false, highlight: true },
    { name: "ETF Breakdown", divtrkr: true, tyd: false, sheets: false, highlight: true },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Is it really free forever?",
      answer:
        "Yes! Core features (FIRE calculator, calendar, screener, projections) are always free. Premium tier ($6.99) coming soon for advanced features like email alerts and tax optimization.",
    },
    {
      question: "How do you make money if it's free?",
      answer:
        "We'll launch premium features later at $6.99/month. But the free tier will always be generous - we believe everyone deserves access to FIRE planning tools.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use Plaid (same as Mint, Personal Capital) for brokerage connections. We never see your credentials. 256-bit encryption. No data selling.",
    },
    {
      question: "Which brokers are supported?",
      answer:
        "12,000+ institutions including Fidelity, Schwab, Vanguard, Robinhood, E*TRADE, TD Ameritrade, Interactive Brokers, and more.",
    },
    {
      question: "Can I track ETFs like SCHD and JEPQ?",
      answer:
        "Yes! We have specialized ETF categorization (Covered Call, Dividend Growth, Income) and break down sector composition.",
    },
    {
      question: "How accurate are the FIRE projections?",
      answer:
        "We calculate based on YOUR actual portfolio holdings using historical growth rates. You can adjust assumptions to see different scenarios.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/10 backdrop-blur-lg bg-background/95 sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img
                src="/lovable-uploads/a49ac46a-1ac9-41d7-b056-7137e301394b.png"
                alt="DivTrkr Logo"
                className="h-8 w-auto"
              />
            </Link>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12 items-start max-w-6xl mx-auto">
            {/* Left Side - 60% (3 columns) */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Flame className="h-3 w-3 mr-1" />
                  Free FIRE Calculator
                </Badge>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                  Know Exactly When You Can{" "}
                  <span className="gradient-text">Retire</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Free dividend tracker with built-in FIRE calculator. Track your
                  portfolio, project future income, and see your path to financial
                  independence.
                </p>
                <p className="text-sm text-muted-foreground max-w-lg border-l-2 border-primary/30 pl-3">
                  <strong>FIRE</strong> (Financial Independence, Retire Early) is a movement dedicated to extreme saving and investment to enable early retirement.
                </p>
              </div>

              {/* 4 Key Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                {heroFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Always free
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-500" />
                  256-bit encryption
                </span>
              </div>

              {/* Powered by Plaid */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground pt-3 border-t border-border/50">
                <img src={plaidLogo} alt="Plaid" className="h-8 w-auto" />
                <span>Powered by Plaid · Trusted by millions</span>
              </div>
            </div>

            {/* Right Side - 40% (2 columns) - FIRE Calculator */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-border/50">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">See Your FIRE Date</CardTitle>
                  <CardDescription>Find out when you can retire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="annual-income">Current Annual Income ($)</Label>
                    <Input
                      id="annual-income"
                      type="number"
                      placeholder="80,000"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">Enter your total annual income from all sources.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="passive-income">Desired Annual Passive Income ($)</Label>
                    <Input
                      id="passive-income"
                      type="number"
                      placeholder="50,000"
                      value={desiredPassiveIncome}
                      onChange={(e) => setDesiredPassiveIncome(e.target.value)}
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">The annual passive income you'd need to cover expenses.</p>
                  </div>
                  <Button size="lg" className="w-full" onClick={handleCalculate}>
                    Calculate Your FIRE Date — Free
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No credit card required. Always free.
                  </p>

                  {fireResult && (
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Your FIRE Number</p>
                        <p className="text-3xl font-bold gradient-text">
                          ${fireResult.targetPortfolio.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (${Math.round(fireResult.targetPortfolio / 12).toLocaleString()}/month in withdrawals)
                        </p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Estimated Timeline</p>
                        {fireResult.years >= 100 ? (
                          <p className="text-lg font-semibold text-foreground">
                            100+ years — consider increasing your savings rate.
                          </p>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-primary">
                              ~{fireResult.years} years <span className="text-base font-normal text-muted-foreground">(by {fireResult.fireYear})</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Equivalent to ${Math.round(parseFloat(desiredPassiveIncome) / 12).toLocaleString()}/month passive income
                            </p>
                          </>
                        )}
                      </div>
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/auth")}
                      >
                        Save Your Plan — Create Free Account
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* INTERACTIVE FIRE DEMO SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
              See It In Action
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              See Your Path to Financial Independence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our FIRE calculator shows exactly when you can retire based on your
              actual portfolio
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <FIREDemo />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FEATURES SHOWCASE SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Everything You Need to Reach{" "}
              <span className="gradient-text">FIRE</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to track, analyze, and project your dividend
              income
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {showcaseFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-primary/10"
                    onClick={() => navigate(feature.link)}
                  >
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* COMPARISON TABLE SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Better Features. Lower Price.{" "}
              <span className="gradient-text">Built for FIRE.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how DivTrkr compares to alternatives
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Feature</TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-primary font-bold text-lg">
                            DivTrkr
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            You're here
                          </Badge>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        TrackYourDividends
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        Spreadsheets
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((feature) => (
                      <TableRow
                        key={feature.name}
                        className={cn(
                          feature.highlight &&
                            "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500"
                        )}
                      >
                        <TableCell className="font-medium">
                          {feature.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          {feature.tyd === "premium" ? (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              Premium
                            </span>
                          ) : feature.tyd ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {feature.sheets ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Price Row */}
                    <TableRow className="bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500 font-bold">
                      <TableCell className="font-semibold">Price</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 dark:text-green-400 text-lg font-bold">
                          FREE
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        $9.99/mo
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        FREE
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FAQ SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about DivTrkr
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border rounded-lg px-6 bg-card"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FINAL CTA SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container text-center max-w-3xl mx-auto">
          <Flame className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Track Your Path to Financial Freedom?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join FIRE investors who know exactly when they can retire
          </p>

          <Button
            size="lg"
            className="text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/auth")}
          >
            Get Started Free - No Credit Card Required
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              2 minute setup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Always free
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="h-4 w-4" />
              12,000+ brokers supported
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPageV2;
