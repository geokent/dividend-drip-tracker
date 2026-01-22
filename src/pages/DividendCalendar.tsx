import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Calendar, Search, Filter, DollarSign, TrendingUp, Clock, Lock, UserPlus, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SEOHead } from "@/components/SEOHead";

interface DividendEntry {
  symbol: string;
  companyName: string;
  sector: string;
  frequency: "Monthly" | "Quarterly";
  yield: number;
  dividendAmount: number;
  exDividendDate: string;
  paymentDate: string;
  shares?: number;
  yourPayout?: number;
}

// Normalize frequency from various formats to our display format
const normalizeFrequency = (freq: string | null): "Monthly" | "Quarterly" => {
  if (!freq) return "Quarterly";
  const lower = freq.toLowerCase();
  if (lower === "monthly") return "Monthly";
  return "Quarterly";
};

// Estimate payment date (typically 2-4 weeks after ex-date)
const estimatePaymentDate = (exDate: string | null): string => {
  if (!exDate) return '';
  const date = new Date(exDate);
  date.setDate(date.getDate() + 14); // Add 2 weeks as estimate
  return date.toISOString().split('T')[0];
};

interface UserStock {
  symbol: string;
  shares: number;
  company_name: string | null;
  dividend_per_share: number | null;
  annual_dividend: number | null;
  next_ex_dividend_date: string | null;
  dividend_date: string | null;
  dividend_yield: number | null;
  dividend_frequency: string | null;
  sector: string | null;
}

// Popular dividend stocks for unauthenticated users
const sampleDividendData: DividendEntry[] = [
  // SCHD - Schwab US Dividend Equity ETF (Quarterly)
  {
    symbol: "SCHD",
    companyName: "Schwab US Dividend Equity ETF",
    sector: "ETF",
    frequency: "Quarterly",
    yield: 3.45,
    dividendAmount: 0.62,
    exDividendDate: "2026-03-18",
    paymentDate: "2026-03-25",
  },
  {
    symbol: "SCHD",
    companyName: "Schwab US Dividend Equity ETF",
    sector: "ETF",
    frequency: "Quarterly",
    yield: 3.45,
    dividendAmount: 0.63,
    exDividendDate: "2026-06-17",
    paymentDate: "2026-06-24",
  },
  {
    symbol: "SCHD",
    companyName: "Schwab US Dividend Equity ETF",
    sector: "ETF",
    frequency: "Quarterly",
    yield: 3.45,
    dividendAmount: 0.64,
    exDividendDate: "2026-09-16",
    paymentDate: "2026-09-23",
  },
  {
    symbol: "SCHD",
    companyName: "Schwab US Dividend Equity ETF",
    sector: "ETF",
    frequency: "Quarterly",
    yield: 3.45,
    dividendAmount: 0.65,
    exDividendDate: "2026-12-16",
    paymentDate: "2026-12-23",
  },
  // JEPQ - JPMorgan Nasdaq Equity Premium Income ETF (Monthly)
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.42,
    exDividendDate: "2026-01-28",
    paymentDate: "2026-02-04",
  },
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.43,
    exDividendDate: "2026-02-25",
    paymentDate: "2026-03-04",
  },
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.41,
    exDividendDate: "2026-03-25",
    paymentDate: "2026-04-01",
  },
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.44,
    exDividendDate: "2026-04-28",
    paymentDate: "2026-05-05",
  },
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.42,
    exDividendDate: "2026-05-27",
    paymentDate: "2026-06-03",
  },
  {
    symbol: "JEPQ",
    companyName: "JPMorgan Nasdaq Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 9.85,
    dividendAmount: 0.43,
    exDividendDate: "2026-06-26",
    paymentDate: "2026-07-06",
  },
  // JEPI - JPMorgan Equity Premium Income ETF (Monthly)
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.38,
    exDividendDate: "2026-01-28",
    paymentDate: "2026-02-04",
  },
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.39,
    exDividendDate: "2026-02-25",
    paymentDate: "2026-03-04",
  },
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.37,
    exDividendDate: "2026-03-25",
    paymentDate: "2026-04-01",
  },
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.40,
    exDividendDate: "2026-04-28",
    paymentDate: "2026-05-05",
  },
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.38,
    exDividendDate: "2026-05-27",
    paymentDate: "2026-06-03",
  },
  {
    symbol: "JEPI",
    companyName: "JPMorgan Equity Premium Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 7.25,
    dividendAmount: 0.39,
    exDividendDate: "2026-06-26",
    paymentDate: "2026-07-06",
  },
  // SPYI - NEOS S&P 500 High Income ETF (Monthly)
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.48,
    exDividendDate: "2026-01-30",
    paymentDate: "2026-02-05",
  },
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.49,
    exDividendDate: "2026-02-27",
    paymentDate: "2026-03-05",
  },
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.47,
    exDividendDate: "2026-03-30",
    paymentDate: "2026-04-06",
  },
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.50,
    exDividendDate: "2026-04-29",
    paymentDate: "2026-05-06",
  },
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.48,
    exDividendDate: "2026-05-28",
    paymentDate: "2026-06-04",
  },
  {
    symbol: "SPYI",
    companyName: "NEOS S&P 500 High Income ETF",
    sector: "ETF",
    frequency: "Monthly",
    yield: 11.50,
    dividendAmount: 0.49,
    exDividendDate: "2026-06-29",
    paymentDate: "2026-07-07",
  },
  // O - Realty Income (Monthly)
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.263,
    exDividendDate: "2026-01-30",
    paymentDate: "2026-02-14",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.263,
    exDividendDate: "2026-02-27",
    paymentDate: "2026-03-14",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.264,
    exDividendDate: "2026-03-30",
    paymentDate: "2026-04-15",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.264,
    exDividendDate: "2026-04-29",
    paymentDate: "2026-05-15",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.265,
    exDividendDate: "2026-05-28",
    paymentDate: "2026-06-15",
  },
  {
    symbol: "O",
    companyName: "Realty Income Corporation",
    sector: "Real Estate",
    frequency: "Monthly",
    yield: 5.82,
    dividendAmount: 0.265,
    exDividendDate: "2026-06-29",
    paymentDate: "2026-07-15",
  },
  // AAPL - Apple (Quarterly)
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    frequency: "Quarterly",
    yield: 0.52,
    dividendAmount: 0.25,
    exDividendDate: "2026-02-06",
    paymentDate: "2026-02-13",
  },
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    frequency: "Quarterly",
    yield: 0.52,
    dividendAmount: 0.26,
    exDividendDate: "2026-05-08",
    paymentDate: "2026-05-15",
  },
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    frequency: "Quarterly",
    yield: 0.52,
    dividendAmount: 0.26,
    exDividendDate: "2026-08-07",
    paymentDate: "2026-08-14",
  },
  {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    frequency: "Quarterly",
    yield: 0.52,
    dividendAmount: 0.26,
    exDividendDate: "2026-11-06",
    paymentDate: "2026-11-13",
  },
  // JNJ - Johnson & Johnson (Quarterly)
  {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    frequency: "Quarterly",
    yield: 3.15,
    dividendAmount: 1.24,
    exDividendDate: "2026-02-23",
    paymentDate: "2026-03-10",
  },
  {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    frequency: "Quarterly",
    yield: 3.15,
    dividendAmount: 1.26,
    exDividendDate: "2026-05-22",
    paymentDate: "2026-06-09",
  },
  {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    frequency: "Quarterly",
    yield: 3.15,
    dividendAmount: 1.26,
    exDividendDate: "2026-08-24",
    paymentDate: "2026-09-08",
  },
  {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    frequency: "Quarterly",
    yield: 3.15,
    dividendAmount: 1.26,
    exDividendDate: "2026-11-23",
    paymentDate: "2026-12-08",
  },
  // KO - Coca-Cola (Quarterly)
  {
    symbol: "KO",
    companyName: "The Coca-Cola Company",
    sector: "Consumer Staples",
    frequency: "Quarterly",
    yield: 3.08,
    dividendAmount: 0.49,
    exDividendDate: "2026-03-13",
    paymentDate: "2026-04-01",
  },
  {
    symbol: "KO",
    companyName: "The Coca-Cola Company",
    sector: "Consumer Staples",
    frequency: "Quarterly",
    yield: 3.08,
    dividendAmount: 0.49,
    exDividendDate: "2026-06-12",
    paymentDate: "2026-07-01",
  },
  {
    symbol: "KO",
    companyName: "The Coca-Cola Company",
    sector: "Consumer Staples",
    frequency: "Quarterly",
    yield: 3.08,
    dividendAmount: 0.50,
    exDividendDate: "2026-09-11",
    paymentDate: "2026-10-01",
  },
  {
    symbol: "KO",
    companyName: "The Coca-Cola Company",
    sector: "Consumer Staples",
    frequency: "Quarterly",
    yield: 3.08,
    dividendAmount: 0.50,
    exDividendDate: "2026-12-11",
    paymentDate: "2026-12-31",
  },
  // VZ - Verizon (Quarterly)
  {
    symbol: "VZ",
    companyName: "Verizon Communications Inc.",
    sector: "Telecommunications",
    frequency: "Quarterly",
    yield: 6.45,
    dividendAmount: 0.6775,
    exDividendDate: "2026-01-09",
    paymentDate: "2026-02-02",
  },
  {
    symbol: "VZ",
    companyName: "Verizon Communications Inc.",
    sector: "Telecommunications",
    frequency: "Quarterly",
    yield: 6.45,
    dividendAmount: 0.6825,
    exDividendDate: "2026-04-10",
    paymentDate: "2026-05-01",
  },
  {
    symbol: "VZ",
    companyName: "Verizon Communications Inc.",
    sector: "Telecommunications",
    frequency: "Quarterly",
    yield: 6.45,
    dividendAmount: 0.6825,
    exDividendDate: "2026-07-10",
    paymentDate: "2026-08-03",
  },
  {
    symbol: "VZ",
    companyName: "Verizon Communications Inc.",
    sector: "Telecommunications",
    frequency: "Quarterly",
    yield: 6.45,
    dividendAmount: 0.6825,
    exDividendDate: "2026-10-09",
    paymentDate: "2026-11-02",
  },
];

// Sectors are now dynamically generated from data - see dynamicSectors useMemo in component

const frequencies = ["All Frequencies", "Monthly", "Quarterly"];

const timeRanges = [
  { value: "week", label: "This Week", days: 7 },
  { value: "month", label: "This Month", days: 30 },
  { value: "quarter", label: "This Quarter", days: 90 },
  { value: "year", label: "This Year", days: 365 },
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

// Session cache for sector data (persists during page session)
const sectorCache = new Map<string, string>();

// Fetch sector for a single symbol from edge function
const fetchSectorForSymbol = async (symbol: string): Promise<string | null> => {
  // Check cache first
  if (sectorCache.has(symbol)) {
    return sectorCache.get(symbol) || null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-dividend-data', {
      body: { symbol }
    });

    if (error || data?.error) {
      console.log(`Could not fetch sector for ${symbol}:`, error || data?.error);
      sectorCache.set(symbol, 'Unknown');
      return null;
    }

    const sector = data?.sector || null;
    sectorCache.set(symbol, sector || 'Unknown');
    return sector;
  } catch (err) {
    console.error(`Error fetching sector for ${symbol}:`, err);
    sectorCache.set(symbol, 'Unknown');
    return null;
  }
};

// Fetch sectors for entries missing them
const fetchMissingSectors = async (entries: DividendEntry[]): Promise<DividendEntry[]> => {
  const entriesNeedingSector = entries.filter(e => !e.sector || e.sector === 'Unknown');

  if (entriesNeedingSector.length === 0) {
    return entries;
  }

  console.log(`Fetching sectors for ${entriesNeedingSector.length} stocks...`);

  // Get unique symbols needing sector data
  const uniqueSymbols = [...new Set(entriesNeedingSector.map(e => e.symbol))];
  
  // Fetch sectors in parallel
  const sectorPromises = uniqueSymbols.map(async (symbol) => {
    const sector = await fetchSectorForSymbol(symbol);
    return { symbol, sector };
  });

  const sectorResults = await Promise.all(sectorPromises);
  
  // Create lookup map
  const sectorMap = new Map<string, string>();
  sectorResults.forEach(({ symbol, sector }) => {
    if (sector) sectorMap.set(symbol, sector);
  });

  // Update entries with fetched sectors
  return entries.map(entry => ({
    ...entry,
    sector: entry.sector && entry.sector !== 'Unknown' 
      ? entry.sector 
      : sectorMap.get(entry.symbol) || 'Unknown'
  }));
};

const DividendCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedFrequency, setSelectedFrequency] = useState("All Frequencies");
  const [selectedTimeRange, setSelectedTimeRange] = useState("year");

  // State for authenticated users
  const [userStocks, setUserStocks] = useState<UserStock[]>([]);
  const [dividendData, setDividendData] = useState<DividendEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPortfolio, setHasPortfolio] = useState(true);
  const [isFetchingSectors, setIsFetchingSectors] = useState(false);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserDividendData = async () => {
      if (!user) {
        setDividendData([]);
        setHasPortfolio(true);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch user's stocks from user_stocks table with all dividend fields from Plaid
        const { data: stocks, error: stocksError } = await supabase
          .from('user_stocks')
          .select('symbol, shares, company_name, dividend_per_share, annual_dividend, next_ex_dividend_date, dividend_date, dividend_yield, dividend_frequency, sector')
          .eq('user_id', user.id)
          .gt('shares', 0);

        if (stocksError) throw stocksError;

        if (!stocks || stocks.length === 0) {
          setHasPortfolio(false);
          setUserStocks([]);
          setDividendData([]);
          setIsLoading(false);
          return;
        }

        setUserStocks(stocks);
        setHasPortfolio(true);

        // Separate stocks that have Plaid dividend data vs those that need fallback
        const stocksWithPlaidData = stocks.filter(s => 
          s.dividend_per_share && s.next_ex_dividend_date
        );
        const stocksNeedingFallback = stocks.filter(s => 
          !s.dividend_per_share || !s.next_ex_dividend_date
        );

        // Build dividend entries from Plaid data (primary source)
        const plaidDividendEntries: DividendEntry[] = stocksWithPlaidData.map(stock => {
          const shares = Number(stock.shares) || 0;
          const dividendAmount = Number(stock.dividend_per_share) || 0;

          return {
            symbol: stock.symbol,
            companyName: stock.company_name || stock.symbol,
            sector: stock.sector || 'Unknown',
            frequency: normalizeFrequency(stock.dividend_frequency),
            yield: Number(stock.dividend_yield) || 0,
            dividendAmount: dividendAmount,
            exDividendDate: stock.next_ex_dividend_date || '',
            paymentDate: stock.dividend_date || estimatePaymentDate(stock.next_ex_dividend_date),
            shares,
            yourPayout: shares * dividendAmount,
          };
        });

        // Fetch fallback data from dividend_data table only for stocks missing Plaid data
        let fallbackEntries: DividendEntry[] = [];
        if (stocksNeedingFallback.length > 0) {
          const fallbackSymbols = stocksNeedingFallback.map(s => s.symbol);
          const { data: divData } = await supabase
            .from('dividend_data')
            .select('*')
            .in('ticker', fallbackSymbols);

          fallbackEntries = (divData || []).map(div => {
            const userStock = stocksNeedingFallback.find(s => s.symbol === div.ticker);
            const shares = Number(userStock?.shares) || 0;

            return {
              symbol: div.ticker,
              companyName: div.company_name,
              sector: div.sector || 'Unknown',
              frequency: div.frequency as "Monthly" | "Quarterly",
              yield: Number(div.dividend_yield),
              dividendAmount: Number(div.dividend_amount),
              exDividendDate: div.next_ex_date,
              paymentDate: div.next_payment_date,
              shares,
              yourPayout: shares * Number(div.dividend_amount),
            };
          });
        }

        // Combine Plaid data with fallback data
        const combinedEntries = [...plaidDividendEntries, ...fallbackEntries];
        setDividendData(combinedEntries);
        
        // Fetch missing sectors in background
        setIsFetchingSectors(true);
        fetchMissingSectors(combinedEntries).then(enrichedEntries => {
          setDividendData(enrichedEntries);
          setIsFetchingSectors(false);
        }).catch(err => {
          console.error('Error fetching sectors:', err);
          setIsFetchingSectors(false);
        });
      } catch (error) {
        console.error('Error fetching dividend data:', error);
        setDividendData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDividendData();
  }, [user]);

  // Determine data source based on authentication
  const dataSource = user && hasPortfolio ? dividendData : sampleDividendData;

  // Build dynamic sectors list from actual data
  const dynamicSectors = useMemo(() => {
    const sectorSet = new Set<string>();
    dataSource.forEach(entry => {
      if (entry.sector && entry.sector !== 'Unknown') {
        sectorSet.add(entry.sector);
      }
    });
    // Always include "Unknown" if there are any unknown sectors
    if (dataSource.some(entry => entry.sector === 'Unknown')) {
      sectorSet.add('Unknown');
    }
    return ['All Sectors', ...Array.from(sectorSet).sort()];
  }, [dataSource]);

  const filteredData = useMemo(() => {
    const now = new Date("2026-01-21");
    const timeRange = timeRanges.find((t) => t.value === selectedTimeRange);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (timeRange?.days || 365));

    return dataSource
      .filter((entry) => {
        const exDate = new Date(entry.exDividendDate);
        const inTimeRange = exDate >= now && exDate <= endDate;

        const matchesSearch =
          searchQuery === "" ||
          entry.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSector =
          selectedSector === "All Sectors" || entry.sector === selectedSector;

        const matchesFrequency =
          selectedFrequency === "All Frequencies" ||
          entry.frequency === selectedFrequency;

        return inTimeRange && matchesSearch && matchesSector && matchesFrequency;
      })
      .sort(
        (a, b) =>
          new Date(a.exDividendDate).getTime() -
          new Date(b.exDividendDate).getTime()
      );
  }, [dataSource, searchQuery, selectedSector, selectedFrequency, selectedTimeRange]);

  const stats = useMemo(() => {
    const totalDividends = filteredData.length;
    const avgYield =
      filteredData.length > 0
        ? filteredData.reduce((sum, entry) => sum + entry.yield, 0) /
          filteredData.length
        : 0;

    const now = new Date("2026-01-21");
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const thisWeekCount = filteredData.filter((entry) => {
      const exDate = new Date(entry.exDividendDate);
      return exDate >= now && exDate <= weekEnd;
    }).length;

    // Calculate total expected payout for authenticated users
    const totalExpectedIncome = user && hasPortfolio
      ? filteredData.reduce((sum, entry) => sum + (entry.yourPayout || 0), 0)
      : 0;

    return { totalDividends, avgYield, thisWeekCount, totalExpectedIncome };
  }, [filteredData, user, hasPortfolio]);

  const tableColSpan = user && hasPortfolio ? 9 : 7;

  return (
    <AppLayout>
      <SEOHead
        title="2026 Dividend Calendar - Track Ex-Dividend Dates | DivTrkr"
        description="Complete 2026 dividend calendar with ex-dividend dates, payment dates, and yields for popular dividend stocks. Track your portfolio's dividend income."
        keywords="dividend calendar 2026, ex-dividend dates, dividend payment schedule, dividend tracker, SCHD dividends, dividend income"
        canonicalUrl="https://divtrkr.lovable.app/dividend-calendar"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageHeader
          title="2026 Dividend Calendar"
          description="Track upcoming ex-dividend dates and payment schedules for dividend-paying stocks"
          icon={Calendar}
        />

        {/* Unauthenticated user CTA */}
        {!user && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertTitle>See Your Personal Dividend Calendar</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>
                Create a free account to track your own portfolio, see personalized payouts, 
                and calculate your total expected dividend income.
              </span>
              <Button onClick={() => navigate('/auth')} className="shrink-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Free Account
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Authenticated user welcome message */}
        {user && hasPortfolio && !isLoading && dividendData.length > 0 && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/5">
            <Calendar className="h-4 w-4 text-green-600" />
            <AlertTitle>Your Personalized Dividend Calendar</AlertTitle>
            <AlertDescription>
              Welcome back, {user.email}! Viewing dividend schedule for your {userStocks.length} holdings.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty portfolio alert */}
        {user && !hasPortfolio && !isLoading && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <Briefcase className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Add Your First Holdings</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span>
                Start tracking your dividend income by adding stocks to your portfolio.
              </span>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="shrink-0">
                Go to Dashboard
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticker or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  {dynamicSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFrequency}
                onValueChange={setSelectedFrequency}
              >
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTimeRange}
                onValueChange={setSelectedTimeRange}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time range" />
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
            <div className={`grid gap-4 mb-6 ${user && hasPortfolio ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Dividends
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDividends}</div>
                  <p className="text-xs text-muted-foreground">
                    In selected period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Yield
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgYield.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across filtered stocks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.thisWeekCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Upcoming ex-dividend dates
                  </p>
                </CardContent>
              </Card>

              {/* Your Expected Income - only for authenticated users */}
              {user && hasPortfolio && (
                <Card className="border-green-500/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Expected Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalExpectedIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From your portfolio
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Dividend Table */}
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
                      {user && hasPortfolio && (
                        <>
                          <TableHead className="text-right">Your Shares</TableHead>
                          <TableHead className="text-right">Your Payout</TableHead>
                        </>
                      )}
                      <TableHead className="text-center">Frequency</TableHead>
                      <TableHead>Sector</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={tableColSpan}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {user && !hasPortfolio 
                            ? "Add stocks to your portfolio to see your personalized dividend calendar"
                            : "No dividends found matching your criteria"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((entry, index) => (
                        <TableRow key={`${entry.symbol}-${entry.exDividendDate}-${index}`}>
                          <TableCell>
                            <div className="font-medium">{entry.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.companyName}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(entry.exDividendDate)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(entry.paymentDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(entry.dividendAmount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{entry.yield.toFixed(2)}%</Badge>
                          </TableCell>
                          {user && hasPortfolio && (
                            <>
                              <TableCell className="text-right">
                                {entry.shares?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                {formatCurrency(entry.yourPayout || 0)}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                entry.frequency === "Monthly" ? "default" : "outline"
                              }
                            >
                              {entry.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.sector}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bottom CTA for unauthenticated users */}
            {!user && (
              <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="py-8 text-center">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Ready to Track Your Own Dividends?</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Join thousands of FIRE investors using DivTrkr to plan their dividend income. 
                    It's completely free to get started.
                  </p>
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Your Free Account
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* SEO Content Section */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2>Understanding the Dividend Calendar</h2>
              <p>
                A dividend calendar is an essential tool for income-focused
                investors pursuing the FIRE (Financial Independence, Retire Early)
                movement. By tracking ex-dividend dates and payment schedules, you
                can optimize your portfolio for consistent monthly income.
              </p>

              <h3>Key Dates to Know</h3>
              <ul>
                <li>
                  <strong>Ex-Dividend Date:</strong> The date by which you must own
                  shares to receive the upcoming dividend. Buy before this date to
                  qualify.
                </li>
                <li>
                  <strong>Payment Date:</strong> When the dividend is actually paid
                  to shareholders who qualified by holding before the ex-dividend
                  date.
                </li>
              </ul>

              <h3>Building Monthly Income</h3>
              <p>
                Many FIRE investors strategically combine monthly dividend payers
                (like O, JEPI, JEPQ, and SPYI) with quarterly payers (like SCHD, AAPL, and
                KO) to create a steady stream of passive income throughout the
                year. This dividend calendar helps you visualize and plan your
                income schedule.
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DividendCalendar;
