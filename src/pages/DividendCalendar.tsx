import { useState, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DividendEntry {
  ticker: string;
  companyName: string;
  sector: string;
  frequency: "Monthly" | "Quarterly";
  yield: number;
  dividendAmount: number;
  exDividendDate: string;
  paymentDate: string;
}

// Sample data for 2026 with realistic dates and amounts
const sampleDividendData: DividendEntry[] = [
  // SCHD - Quarterly (March, June, September, December)
  { ticker: "SCHD", companyName: "Schwab US Dividend Equity ETF", sector: "ETF", frequency: "Quarterly", yield: 3.45, dividendAmount: 0.68, exDividendDate: "2026-03-18", paymentDate: "2026-03-24" },
  { ticker: "SCHD", companyName: "Schwab US Dividend Equity ETF", sector: "ETF", frequency: "Quarterly", yield: 3.45, dividendAmount: 0.69, exDividendDate: "2026-06-17", paymentDate: "2026-06-23" },
  { ticker: "SCHD", companyName: "Schwab US Dividend Equity ETF", sector: "ETF", frequency: "Quarterly", yield: 3.45, dividendAmount: 0.70, exDividendDate: "2026-09-16", paymentDate: "2026-09-22" },
  { ticker: "SCHD", companyName: "Schwab US Dividend Equity ETF", sector: "ETF", frequency: "Quarterly", yield: 3.45, dividendAmount: 0.71, exDividendDate: "2026-12-16", paymentDate: "2026-12-22" },
  
  // JEPQ - Monthly
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.42, exDividendDate: "2026-01-05", paymentDate: "2026-01-08" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.41, exDividendDate: "2026-02-04", paymentDate: "2026-02-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.43, exDividendDate: "2026-03-04", paymentDate: "2026-03-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.42, exDividendDate: "2026-04-06", paymentDate: "2026-04-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.44, exDividendDate: "2026-05-05", paymentDate: "2026-05-08" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.43, exDividendDate: "2026-06-04", paymentDate: "2026-06-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.45, exDividendDate: "2026-07-06", paymentDate: "2026-07-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.44, exDividendDate: "2026-08-05", paymentDate: "2026-08-10" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.43, exDividendDate: "2026-09-04", paymentDate: "2026-09-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.45, exDividendDate: "2026-10-05", paymentDate: "2026-10-08" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.44, exDividendDate: "2026-11-04", paymentDate: "2026-11-09" },
  { ticker: "JEPQ", companyName: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "ETF", frequency: "Monthly", yield: 9.20, dividendAmount: 0.46, exDividendDate: "2026-12-04", paymentDate: "2026-12-09" },
  
  // O - Monthly
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.26, exDividendDate: "2026-01-30", paymentDate: "2026-02-13" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.26, exDividendDate: "2026-02-27", paymentDate: "2026-03-13" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.26, exDividendDate: "2026-03-30", paymentDate: "2026-04-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-04-29", paymentDate: "2026-05-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-05-28", paymentDate: "2026-06-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-06-29", paymentDate: "2026-07-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-07-30", paymentDate: "2026-08-14" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-08-28", paymentDate: "2026-09-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.27, exDividendDate: "2026-09-29", paymentDate: "2026-10-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.28, exDividendDate: "2026-10-29", paymentDate: "2026-11-13" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.28, exDividendDate: "2026-11-27", paymentDate: "2026-12-15" },
  { ticker: "O", companyName: "Realty Income Corporation", sector: "Real Estate", frequency: "Monthly", yield: 5.60, dividendAmount: 0.28, exDividendDate: "2026-12-30", paymentDate: "2027-01-15" },
  
  // AAPL - Quarterly
  { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology", frequency: "Quarterly", yield: 0.50, dividendAmount: 0.25, exDividendDate: "2026-02-06", paymentDate: "2026-02-12" },
  { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology", frequency: "Quarterly", yield: 0.50, dividendAmount: 0.25, exDividendDate: "2026-05-08", paymentDate: "2026-05-14" },
  { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology", frequency: "Quarterly", yield: 0.50, dividendAmount: 0.26, exDividendDate: "2026-08-07", paymentDate: "2026-08-13" },
  { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology", frequency: "Quarterly", yield: 0.50, dividendAmount: 0.26, exDividendDate: "2026-11-06", paymentDate: "2026-11-12" },
  
  // JNJ - Quarterly
  { ticker: "JNJ", companyName: "Johnson & Johnson", sector: "Healthcare", frequency: "Quarterly", yield: 3.18, dividendAmount: 1.24, exDividendDate: "2026-02-20", paymentDate: "2026-03-10" },
  { ticker: "JNJ", companyName: "Johnson & Johnson", sector: "Healthcare", frequency: "Quarterly", yield: 3.18, dividendAmount: 1.24, exDividendDate: "2026-05-22", paymentDate: "2026-06-09" },
  { ticker: "JNJ", companyName: "Johnson & Johnson", sector: "Healthcare", frequency: "Quarterly", yield: 3.18, dividendAmount: 1.27, exDividendDate: "2026-08-21", paymentDate: "2026-09-08" },
  { ticker: "JNJ", companyName: "Johnson & Johnson", sector: "Healthcare", frequency: "Quarterly", yield: 3.18, dividendAmount: 1.27, exDividendDate: "2026-11-20", paymentDate: "2026-12-08" },
  
  // KO - Quarterly
  { ticker: "KO", companyName: "Coca-Cola Company", sector: "Consumer Defensive", frequency: "Quarterly", yield: 3.10, dividendAmount: 0.49, exDividendDate: "2026-03-13", paymentDate: "2026-04-01" },
  { ticker: "KO", companyName: "Coca-Cola Company", sector: "Consumer Defensive", frequency: "Quarterly", yield: 3.10, dividendAmount: 0.49, exDividendDate: "2026-06-12", paymentDate: "2026-07-01" },
  { ticker: "KO", companyName: "Coca-Cola Company", sector: "Consumer Defensive", frequency: "Quarterly", yield: 3.10, dividendAmount: 0.50, exDividendDate: "2026-09-14", paymentDate: "2026-10-01" },
  { ticker: "KO", companyName: "Coca-Cola Company", sector: "Consumer Defensive", frequency: "Quarterly", yield: 3.10, dividendAmount: 0.50, exDividendDate: "2026-11-27", paymentDate: "2026-12-15" },
  
  // VZ - Quarterly
  { ticker: "VZ", companyName: "Verizon Communications", sector: "Communication Services", frequency: "Quarterly", yield: 6.50, dividendAmount: 0.67, exDividendDate: "2026-01-09", paymentDate: "2026-02-02" },
  { ticker: "VZ", companyName: "Verizon Communications", sector: "Communication Services", frequency: "Quarterly", yield: 6.50, dividendAmount: 0.67, exDividendDate: "2026-04-08", paymentDate: "2026-05-01" },
  { ticker: "VZ", companyName: "Verizon Communications", sector: "Communication Services", frequency: "Quarterly", yield: 6.50, dividendAmount: 0.68, exDividendDate: "2026-07-08", paymentDate: "2026-08-03" },
  { ticker: "VZ", companyName: "Verizon Communications", sector: "Communication Services", frequency: "Quarterly", yield: 6.50, dividendAmount: 0.68, exDividendDate: "2026-10-07", paymentDate: "2026-11-02" },
];

const sectors = [
  "All Sectors",
  "ETF",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Consumer Defensive",
  "Communication Services",
];

const frequencies = ["All Frequencies", "Monthly", "Quarterly"];

const timeRanges = [
  { value: "week", label: "Next Week", days: 7 },
  { value: "month", label: "Next Month", days: 30 },
  { value: "quarter", label: "Next Quarter", days: 90 },
  { value: "year", label: "Full Year", days: 365 },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const DividendCalendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedFrequency, setSelectedFrequency] = useState("All Frequencies");
  const [selectedTimeRange, setSelectedTimeRange] = useState("year");

  const filteredData = useMemo(() => {
    const now = new Date("2026-01-21"); // Current date context
    const timeRange = timeRanges.find((t) => t.value === selectedTimeRange);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (timeRange?.days || 365));

    return sampleDividendData
      .filter((entry) => {
        // Time range filter
        const exDate = new Date(entry.exDividendDate);
        if (exDate < now || exDate > endDate) return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !entry.ticker.toLowerCase().includes(query) &&
            !entry.companyName.toLowerCase().includes(query)
          ) {
            return false;
          }
        }

        // Sector filter
        if (selectedSector !== "All Sectors" && entry.sector !== selectedSector) {
          return false;
        }

        // Frequency filter
        if (
          selectedFrequency !== "All Frequencies" &&
          entry.frequency !== selectedFrequency
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.exDividendDate).getTime() -
          new Date(b.exDividendDate).getTime()
      );
  }, [searchQuery, selectedSector, selectedFrequency, selectedTimeRange]);

  const stats = useMemo(() => {
    const now = new Date("2026-01-21");
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const totalDividends = filteredData.reduce(
      (sum, entry) => sum + entry.dividendAmount,
      0
    );
    const avgYield =
      filteredData.length > 0
        ? filteredData.reduce((sum, entry) => sum + entry.yield, 0) /
          filteredData.length
        : 0;
    const thisWeekCount = filteredData.filter((entry) => {
      const exDate = new Date(entry.exDividendDate);
      return exDate >= now && exDate <= weekFromNow;
    }).length;

    return { totalDividends, avgYield, thisWeekCount };
  }, [filteredData]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Dividend Calendar 2026",
    description:
      "Track upcoming dividend payments, ex-dividend dates, and yields for top dividend stocks.",
    publisher: {
      "@type": "Organization",
      name: "DivTrkr",
      url: "https://www.divtrkr.com",
    },
  };

  return (
    <>
      <SEOHead
        title="Dividend Calendar 2026 - Track Upcoming Dividend Payments | DivTrkr"
        description="Plan your dividend income with our 2026 dividend calendar. Track ex-dividend dates, payment dates, and yields for top dividend stocks like SCHD, O, AAPL, JNJ, KO, and VZ."
        keywords="dividend calendar 2026, upcoming dividends, ex-dividend dates, dividend payment schedule, dividend investing, FIRE, passive income"
        canonicalUrl="https://www.divtrkr.com/dividend-calendar"
        structuredData={structuredData}
      />
      <AppLayout>
        <PageHeader
          icon={Calendar}
          title="Dividend Calendar 2026"
          description="Track upcoming ex-dividend dates and payment schedules for dividend-paying stocks"
        />

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ticker or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger>
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {freq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Dividends
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalDividends)}
              </div>
              <p className="text-xs text-muted-foreground">
                In selected timeframe ({filteredData.length} payments)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgYield.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                Across filtered stocks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekCount}</div>
              <p className="text-xs text-muted-foreground">
                Dividends coming up
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-center">Ex-Dividend Date</TableHead>
                  <TableHead className="text-center">Payment Date</TableHead>
                  <TableHead className="text-right">Dividend</TableHead>
                  <TableHead className="text-center">Yield</TableHead>
                  <TableHead className="text-center">Frequency</TableHead>
                  <TableHead>Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No dividends found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((entry, index) => (
                    <TableRow
                      key={`${entry.ticker}-${entry.exDividendDate}-${index}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-semibold">{entry.ticker}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.companyName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(entry.exDividendDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(entry.paymentDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.dividendAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.yield.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            entry.frequency === "Monthly" ? "default" : "secondary"
                          }
                        >
                          {entry.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.sector}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SEO Content Section */}
        <section className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">
            What is a Dividend Calendar?
          </h2>
          <p className="text-muted-foreground mb-6">
            A dividend calendar is a scheduling tool that helps investors track
            upcoming dividend payments from their stock holdings. It displays
            critical dates including the ex-dividend date (the cutoff to qualify
            for the dividend), the record date (when you must be on the company's
            books as a shareholder), and the payment date (when the dividend is
            deposited to your account).
          </p>

          <h3 className="text-xl font-semibold mb-3">
            Key Dividend Calendar Terms
          </h3>
          <ul className="text-muted-foreground space-y-2 mb-6">
            <li>
              <strong>Ex-Dividend Date:</strong> The first day a stock trades
              without its upcoming dividend. You must purchase shares before this
              date to receive the dividend.
            </li>
            <li>
              <strong>Payment Date:</strong> The day dividend payments are
              distributed to shareholders of record.
            </li>
            <li>
              <strong>Dividend Yield:</strong> The annual dividend payment divided
              by the stock price, expressed as a percentage.
            </li>
            <li>
              <strong>Payment Frequency:</strong> How often dividends are paid—monthly,
              quarterly, semi-annually, or annually.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">
            How FIRE Investors Use Dividend Calendars
          </h3>
          <p className="text-muted-foreground mb-4">
            For investors pursuing Financial Independence, Retire Early (FIRE),
            dividend calendars are essential planning tools. They help you:
          </p>
          <ul className="text-muted-foreground space-y-2 mb-6">
            <li>
              <strong>Plan monthly income:</strong> By combining stocks with
              different payment schedules, you can create consistent monthly cash
              flow.
            </li>
            <li>
              <strong>Optimize reinvestment:</strong> Know exactly when dividends
              arrive to plan DRIP (Dividend Reinvestment Plan) strategies.
            </li>
            <li>
              <strong>Forecast annual income:</strong> Project your total dividend
              income for budgeting and FIRE number calculations.
            </li>
            <li>
              <strong>Avoid missed opportunities:</strong> Never miss an
              ex-dividend date by tracking your entire portfolio in one view.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">
            Building Monthly Dividend Income
          </h3>
          <p className="text-muted-foreground">
            One popular FIRE strategy is constructing a portfolio that pays
            dividends every month. This involves selecting stocks and ETFs with
            staggered payment schedules. For example, combining monthly dividend
            payers like Realty Income (O) and JEPQ with quarterly payers like SCHD,
            AAPL, and JNJ creates a steady income stream throughout the year. Our
            dividend calendar makes it easy to visualize and plan this income
            distribution.
          </p>
        </section>
      </AppLayout>
    </>
  );
};

export default DividendCalendar;
