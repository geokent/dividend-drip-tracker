import { PortfolioTopStrip } from "@/components/PortfolioTopStrip";
import { PortfolioTable } from "@/components/PortfolioTable";
import { UpcomingDividendsCard } from "@/components/UpcomingDividendsCard";

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
    exDividendDate: "2025-07-30",
    dividendDate: "2025-08-15",
    nextExDividendDate: "2025-10-30",
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
    exDividendDate: "2025-09-05",
    dividendDate: "2025-09-12",
    nextExDividendDate: "2025-12-05",
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
    exDividendDate: "2025-06-10",
    dividendDate: "2025-07-01",
    nextExDividendDate: "2025-09-10",
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
    exDividendDate: "2025-07-01",
    dividendDate: "2025-07-08",
    nextExDividendDate: "2025-10-01",
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
    exDividendDate: "2025-06-28",
    dividendDate: "2025-07-15",
    nextExDividendDate: "2025-07-28",
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