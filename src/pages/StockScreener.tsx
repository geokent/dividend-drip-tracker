import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Search, Filter, Download, Plus, Crown, Star, RefreshCw, Briefcase, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SEOHead } from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

interface StockEntry {
  ticker: string;
  company_name: string;
  dividend_yield: number;
  annual_dividend: number;
  frequency: string;
  sector: string | null;
  payout_ratio: number | null;
  years_of_growth: number;
  is_dividend_aristocrat: boolean;
  is_dividend_king: boolean;
}

const StockScreener = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data state
  const [stocks, setStocks] = useState<StockEntry[]>([]);
  const [userPortfolio, setUserPortfolio] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [addingStock, setAddingStock] = useState<string | null>(null);

  // Dynamic options from database
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableFrequencies, setAvailableFrequencies] = useState<string[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [yieldRange, setYieldRange] = useState<number[]>([0, 15]);
  const [payoutRange, setPayoutRange] = useState<number[]>([0, 100]);
  const [minYearsGrowth, setMinYearsGrowth] = useState(0);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [aristocratsOnly, setAristocratsOnly] = useState(false);
  const [kingsOnly, setKingsOnly] = useState(false);

  // Mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch all dividend stocks
      const { data: dividendData, error } = await supabase
        .from('dividend_data')
        .select('ticker, company_name, dividend_yield, annual_dividend, frequency, sector, payout_ratio, years_of_growth, is_dividend_aristocrat, is_dividend_king')
        .order('dividend_yield', { ascending: false });

      if (!error && dividendData) {
        setStocks(dividendData);

        // Extract unique sectors and frequencies
        const sectors = [...new Set(dividendData.map(s => s.sector).filter(Boolean))] as string[];
        const frequencies = [...new Set(dividendData.map(s => s.frequency))] as string[];
        setAvailableSectors(sectors.sort());
        setAvailableFrequencies(frequencies.sort());
      }

      // If authenticated, fetch user's portfolio symbols
      if (user?.id) {
        const { data: portfolio } = await supabase
          .from('user_stocks')
          .select('symbol')
          .eq('user_id', user.id);

        if (portfolio) {
          setUserPortfolio(new Set(portfolio.map(p => p.symbol)));
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user?.id]);

  // Filter logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!stock.ticker.toLowerCase().includes(query) &&
            !stock.company_name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Yield filter
      if (stock.dividend_yield < yieldRange[0] || stock.dividend_yield > yieldRange[1]) {
        return false;
      }

      // Payout ratio filter (handle null as "any")
      if (stock.payout_ratio !== null) {
        if (stock.payout_ratio < payoutRange[0] || stock.payout_ratio > payoutRange[1]) {
          return false;
        }
      }

      // Years of growth filter
      if (stock.years_of_growth < minYearsGrowth) {
        return false;
      }

      // Sector filter
      if (selectedSectors.length > 0 && (!stock.sector || !selectedSectors.includes(stock.sector))) {
        return false;
      }

      // Frequency filter
      if (selectedFrequencies.length > 0 && !selectedFrequencies.includes(stock.frequency)) {
        return false;
      }

      // Special filters
      if (aristocratsOnly && !stock.is_dividend_aristocrat) {
        return false;
      }
      if (kingsOnly && !stock.is_dividend_king) {
        return false;
      }

      return true;
    });
  }, [stocks, searchQuery, yieldRange, payoutRange, minYearsGrowth, selectedSectors, selectedFrequencies, aristocratsOnly, kingsOnly]);

  // Reset all filters
  const resetFilters = () => {
    setYieldRange([0, 15]);
    setPayoutRange([0, 100]);
    setMinYearsGrowth(0);
    setSelectedSectors([]);
    setSelectedFrequencies([]);
    setAristocratsOnly(false);
    setKingsOnly(false);
    setSearchQuery("");
  };

  // Add stock to portfolio
  const handleAddToPortfolio = async (stock: StockEntry) => {
    if (!user?.id) {
      navigate("/auth");
      return;
    }

    setAddingStock(stock.ticker);

    try {
      // Fetch full stock data via edge function
      const { data, error } = await supabase.functions.invoke('get-dividend-data', {
        body: { symbol: stock.ticker }
      });

      if (error) throw error;

      // Insert into user_stocks
      const { error: insertError } = await supabase
        .from('user_stocks')
        .insert({
          user_id: user.id,
          symbol: data.symbol || stock.ticker,
          company_name: data.companyName || stock.company_name,
          current_price: data.currentPrice,
          dividend_yield: data.dividendYield || stock.dividend_yield,
          dividend_per_share: data.dividendPerShare,
          annual_dividend: data.annualDividend || stock.annual_dividend,
          ex_dividend_date: data.exDividendDate,
          dividend_date: data.dividendDate,
          sector: data.sector || stock.sector,
          industry: data.industry,
          market_cap: data.marketCap ? parseInt(data.marketCap) : null,
          pe_ratio: data.peRatio ? parseFloat(data.peRatio) : null,
          shares: 0,
          source: 'manual'
        });

      if (insertError) throw insertError;

      setUserPortfolio(prev => new Set([...prev, stock.ticker]));

      toast({
        title: "Added to Portfolio",
        description: `${stock.ticker} has been added to your portfolio`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add stock to portfolio",
        variant: "destructive",
      });
    } finally {
      setAddingStock(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Ticker", "Company", "Yield (%)", "Annual Dividend", "Frequency", "Sector", "Payout Ratio (%)", "Years of Growth", "Aristocrat", "King"];

    const rows = filteredStocks.map(stock => [
      stock.ticker,
      `"${stock.company_name}"`,
      stock.dividend_yield.toFixed(2),
      stock.annual_dividend.toFixed(2),
      stock.frequency,
      stock.sector || "N/A",
      stock.payout_ratio?.toString() || "N/A",
      stock.years_of_growth.toString(),
      stock.is_dividend_aristocrat ? "Yes" : "No",
      stock.is_dividend_king ? "Yes" : "No"
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dividend-stocks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Payout ratio color coding
  const getPayoutRatioColor = (ratio: number | null) => {
    if (ratio === null) return "text-muted-foreground";
    if (ratio < 60) return "text-green-600";
    if (ratio < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getPayoutRatioBadge = (ratio: number | null) => {
    if (ratio === null) return null;
    if (ratio < 60) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Safe</Badge>;
    if (ratio < 80) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High</Badge>;
  };

  // Toggle handlers
  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const toggleFrequency = (frequency: string) => {
    setSelectedFrequencies(prev =>
      prev.includes(frequency)
        ? prev.filter(f => f !== frequency)
        : [...prev, frequency]
    );
  };

  return (
    <AppLayout>
      <SEOHead
        title="Dividend Stock Screener - Find High Yield Dividend Stocks | DivTrkr"
        description="Screen and filter dividend stocks by yield, payout ratio, sector, and growth history. Discover Dividend Aristocrats and Kings."
        keywords="dividend stock screener, high yield stocks, dividend aristocrats, dividend kings, payout ratio, dividend investing"
        canonicalUrl="https://www.divtrkr.com/stock-screener"
      />

      <PageHeader
        title="Dividend Stock Screener"
        icon={Filter}
        description="Screen dividend-paying stocks by yield, sector, frequency, and more"
        actions={
          <Button onClick={handleExportCSV} variant="outline" disabled={filteredStocks.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Results count bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredStocks.length}</span> of{" "}
          <span className="font-medium text-foreground">{stocks.length}</span> stocks
        </p>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <aside className={`lg:w-72 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ticker or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Dividend Yield Slider */}
              <div className="space-y-3">
                <Label>Dividend Yield: {yieldRange[0]}% - {yieldRange[1]}%</Label>
                <Slider
                  value={yieldRange}
                  onValueChange={setYieldRange}
                  min={0}
                  max={15}
                  step={0.5}
                  minStepsBetweenThumbs={1}
                  className="w-full"
                />
              </div>

              {/* Payout Ratio Slider */}
              <div className="space-y-3">
                <Label>Payout Ratio: {payoutRange[0]}% - {payoutRange[1]}%</Label>
                <Slider
                  value={payoutRange}
                  onValueChange={setPayoutRange}
                  min={0}
                  max={100}
                  step={5}
                  minStepsBetweenThumbs={1}
                  className="w-full"
                />
              </div>

              {/* Min Years of Growth Slider */}
              <div className="space-y-3">
                <Label>Min Years of Dividend Growth: {minYearsGrowth}</Label>
                <Slider
                  value={[minYearsGrowth]}
                  onValueChange={(v) => setMinYearsGrowth(v[0])}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Sectors */}
              {availableSectors.length > 0 && (
                <div className="space-y-3">
                  <Label>Sectors</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSectors.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sector-${sector}`}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => toggleSector(sector)}
                        />
                        <Label htmlFor={`sector-${sector}`} className="text-sm font-normal cursor-pointer">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequencies */}
              {availableFrequencies.length > 0 && (
                <div className="space-y-3">
                  <Label>Payment Frequency</Label>
                  <div className="space-y-2">
                    {availableFrequencies.map((frequency) => (
                      <div key={frequency} className="flex items-center space-x-2">
                        <Checkbox
                          id={`freq-${frequency}`}
                          checked={selectedFrequencies.includes(frequency)}
                          onCheckedChange={() => toggleFrequency(frequency)}
                        />
                        <Label htmlFor={`freq-${frequency}`} className="text-sm font-normal cursor-pointer">
                          {frequency}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Filters */}
              <div className="space-y-3">
                <Label>Special Categories</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aristocrats"
                      checked={aristocratsOnly}
                      onCheckedChange={(checked) => setAristocratsOnly(checked === true)}
                    />
                    <Label htmlFor="aristocrats" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                      <Star className="h-4 w-4 text-blue-600" />
                      Dividend Aristocrats Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kings"
                      checked={kingsOnly}
                      onCheckedChange={(checked) => setKingsOnly(checked === true)}
                    />
                    <Label htmlFor="kings" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                      <Crown className="h-4 w-4 text-purple-600" />
                      Dividend Kings Only
                    </Label>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Stock Cards Grid */}
        <main className="flex-1">
          {isLoading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading dividend stocks...</p>
              </div>
            </Card>
          ) : filteredStocks.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No stocks found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to see more results</p>
                <Button variant="outline" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredStocks.map((stock) => (
                <Card key={stock.ticker} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{stock.ticker}</CardTitle>
                          {userPortfolio.has(stock.ticker) && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              <Briefcase className="h-3 w-3 mr-1" />
                              In Portfolio
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="truncate mt-1">{stock.company_name}</CardDescription>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {stock.is_dividend_king && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <Crown className="h-3 w-3 mr-1" />
                            King
                          </Badge>
                        )}
                        {stock.is_dividend_aristocrat && !stock.is_dividend_king && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Star className="h-3 w-3 mr-1" />
                            Aristocrat
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Yield</p>
                        <p className="font-semibold text-green-600">{stock.dividend_yield.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Annual Div</p>
                        <p className="font-semibold">${stock.annual_dividend.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Frequency</p>
                        <p className="font-medium">{stock.frequency}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Sector</p>
                        <p className="font-medium truncate">{stock.sector || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="text-muted-foreground text-xs">Payout Ratio</p>
                        <p className={`font-semibold ${getPayoutRatioColor(stock.payout_ratio)}`}>
                          {stock.payout_ratio ? `${stock.payout_ratio}%` : "N/A"}
                        </p>
                      </div>
                      {getPayoutRatioBadge(stock.payout_ratio)}
                    </div>

                    {stock.years_of_growth > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-muted-foreground text-xs">Dividend Growth Streak</p>
                        <p className="font-semibold text-primary">{stock.years_of_growth} years</p>
                      </div>
                    )}

                    <div className="pt-2">
                      {user ? (
                        userPortfolio.has(stock.ticker) ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            Already in Portfolio
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddToPortfolio(stock)}
                            disabled={addingStock === stock.ticker}
                          >
                            {addingStock === stock.ticker ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add to Portfolio
                          </Button>
                        )
                      ) : (
                        <Button size="sm" className="w-full" onClick={() => navigate("/auth")}>
                          Sign Up to Track
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Educational Content */}
      <section className="mt-12">
        <Collapsible open={educationOpen} onOpenChange={setEducationOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Understanding Dividend Metrics</CardTitle>
                  <ChevronDown className={`h-5 w-5 transition-transform ${educationOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Dividend Yield</h3>
                  <p className="text-sm text-muted-foreground">
                    The annual dividend payment divided by the stock price, expressed as a percentage.
                    Higher yields mean more income per dollar invested, but extremely high yields may signal risk.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Payout Ratio</h3>
                  <p className="text-sm text-muted-foreground">
                    The percentage of earnings paid out as dividends. Below 60% is generally considered
                    safe (green), 60-80% is moderate (yellow), and above 80% may be unsustainable (red).
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Years of Consecutive Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    How many years the company has increased its dividend. Longer streaks indicate
                    stability and management commitment to shareholders.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Dividend Aristocrats</h3>
                  <p className="text-sm text-muted-foreground">
                    S&P 500 companies that have increased dividends for 25+ consecutive years.
                    These are elite dividend payers with proven track records.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Dividend Kings</h3>
                  <p className="text-sm text-muted-foreground">
                    Companies that have increased dividends for 50+ consecutive years.
                    The most exclusive group of dividend payers.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">Payment Frequency</h3>
                  <p className="text-sm text-muted-foreground">
                    How often dividends are paid: Monthly (12x/year), Quarterly (4x/year),
                    Semi-Annual (2x/year), or Annual (1x/year).
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>
    </AppLayout>
  );
};

export default StockScreener;
