import { PortfolioTopStrip } from "@/components/PortfolioTopStrip";
import { PortfolioTable } from "@/components/PortfolioTable";
import { UpcomingDividendsCard } from "@/components/UpcomingDividendsCard";

// Calculate dynamic dates relative to today
const now = new Date();

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Recent dividends (past dates)
const twoDaysAgo = formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
const threeDaysAgo = formatDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
const nineDaysAgo = formatDate(new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000));
const tenDaysAgo = formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000));
const elevenDaysAgo = formatDate(new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000));

// Upcoming dividends (future dates)
const eightDaysFromNow = formatDate(new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000));
const fifteenDaysFromNow = formatDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000));
const twentyThreeDaysFromNow = formatDate(new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000));
const twentyEightDaysFromNow = formatDate(new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000));
const fortyThreeDaysFromNow = formatDate(new Date(now.getTime() + 43 * 24 * 60 * 60 * 1000));

// Far future for "next" ex-dividend dates
const seventyFiveDaysFromNow = formatDate(new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000));
const ninetyDaysFromNow = formatDate(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));
const oneHundredDaysFromNow = formatDate(new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000));

interface DemoStock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  dividendYield: number;
  dividendPerShare: number;
  annualDividend: number;
  exDividendDate: string | null;
  dividendDate: string | null;
  nextExDividendDate: string | null;
  dividendFrequency: string | null;
  shares: number;
  sector: string | null;
}

const demoStocks: DemoStock[] = [
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    currentPrice: 190.5,
    dividendYield: 0.50,
    dividendPerShare: 0.96,
    annualDividend: 0.96,
    exDividendDate: tenDaysAgo,
    dividendDate: nineDaysAgo,
    nextExDividendDate: seventyFiveDaysFromNow,
    dividendFrequency: "quarterly",
    shares: 30,
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    currentPrice: 410.2,
    dividendYield: 0.73,
    dividendPerShare: 3.00,
    annualDividend: 3.00,
    exDividendDate: elevenDaysAgo,
    dividendDate: threeDaysAgo,
    nextExDividendDate: ninetyDaysFromNow,
    dividendFrequency: "quarterly",
    shares: 20,
    sector: "Technology",
  },
  {
    symbol: "KO",
    companyName: "Coca‑Cola Company",
    currentPrice: 61.1,
    dividendYield: 3.18,
    dividendPerShare: 1.94,
    annualDividend: 1.94,
    exDividendDate: eightDaysFromNow,
    dividendDate: twentyEightDaysFromNow,
    nextExDividendDate: oneHundredDaysFromNow,
    dividendFrequency: "quarterly",
    shares: 100,
    sector: "Consumer Defensive",
  },
  {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    currentPrice: 156.3,
    dividendYield: 3.18,
    dividendPerShare: 4.96,
    annualDividend: 4.96,
    exDividendDate: nineDaysAgo,
    dividendDate: twentyThreeDaysFromNow,
    nextExDividendDate: oneHundredDaysFromNow,
    dividendFrequency: "quarterly",
    shares: 40,
    sector: "Healthcare",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    currentPrice: 55.0,
    dividendYield: 5.60,
    dividendPerShare: 3.08,
    annualDividend: 3.08,
    exDividendDate: fifteenDaysFromNow,
    dividendDate: twoDaysAgo,
    nextExDividendDate: fortyThreeDaysFromNow,
    dividendFrequency: "monthly",
    shares: 120,
    sector: "Real Estate",
  },
];

const totalPortfolioValue = demoStocks.reduce((sum, stock) => sum + stock.currentPrice * stock.shares, 0);
const totalAnnualDividends = demoStocks.reduce((sum, stock) => sum + stock.annualDividend * stock.shares, 0);
const totalMonthlyDividends = totalAnnualDividends / 12;
const totalYield = totalPortfolioValue > 0 ? (totalAnnualDividends / totalPortfolioValue) * 100 : 0;

export const DemoPortfolio = () => {
  const handleDemoAction = () => {
    alert("This is a demo portfolio - actions are disabled. Sign up to track your real portfolio!");
  };

  return (
    <div className="space-y-6">
      <PortfolioTopStrip
        totalValue={totalPortfolioValue}
        totalYield={totalYield}
        totalMonthlyDividends={totalMonthlyDividends}
        totalAnnualDividends={totalAnnualDividends}
      />

      <PortfolioTable
        stocks={demoStocks}
        onRemoveStock={handleDemoAction}
        onUpdateShares={handleDemoAction}
      />

      <UpcomingDividendsCard stocks={demoStocks} />
    </div>
  );
};