import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TrackedStock {
  symbol: string;
  companyName: string;
  currentPrice: number | null;
  dividendYield: number | null;
  dividendPerShare: number | null;
  annualDividend: number | null;
  exDividendDate: string | null;
  dividendDate: string | null;
  shares: number;
}

interface UpcomingDividendsCardProps {
  stocks: TrackedStock[];
}

export const UpcomingDividendsCard = ({ stocks }: UpcomingDividendsCardProps) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Filter and process all dividends with dates
  const processedDividends = stocks
    .filter(stock => stock.dividendDate && stock.dividendPerShare && stock.shares > 0)
    .map(stock => {
      const dividendDate = new Date(stock.dividendDate!);
      const exDividendDate = stock.exDividendDate ? new Date(stock.exDividendDate) : null;
      const totalDividend = (stock.dividendPerShare! * stock.shares) / 4; // Quarterly estimate
      
      return {
        ...stock,
        dividendDate,
        exDividendDate,
        totalDividend,
        isRecent: dividendDate >= thirtyDaysAgo && dividendDate <= now,
        isUpcoming: dividendDate > now && dividendDate <= ninetyDaysFromNow
      };
    })
    .filter(stock => stock.isRecent || stock.isUpcoming)
    .sort((a, b) => a.dividendDate.getTime() - b.dividendDate.getTime());

  const recentDividends = processedDividends.filter(stock => stock.isRecent).slice(-3); // Last 3 recent
  const upcomingDividends = processedDividends.filter(stock => stock.isUpcoming).slice(0, 5); // Next 5 upcoming

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatRelativeDate = (date: Date) => {
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `in ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  if (recentDividends.length === 0 && upcomingDividends.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="card-title flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent and Upcoming Dividends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent or upcoming dividend payments found. Add dividend stocks to track payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="card-title flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent and Upcoming Dividends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Dividends Section */}
        {recentDividends.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Payments</h4>
            {recentDividends.map((stock) => (
              <div key={`recent-${stock.symbol}`} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border-l-2 border-secondary">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {stock.shares} shares
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      PAID
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeDate(stock.dividendDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="financial-value text-muted-foreground">
                    {formatCurrency(stock.totalDividend)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Est. quarterly
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Separator */}
        {recentDividends.length > 0 && upcomingDividends.length > 0 && (
          <div className="border-t border-border"></div>
        )}

        {/* Upcoming Dividends Section */}
        {upcomingDividends.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Upcoming Payments</h4>
            {upcomingDividends.map((stock) => (
              <div key={`upcoming-${stock.symbol}`} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {stock.shares} shares
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      UPCOMING
                    </Badge>
                    <div className="text-xs text-foreground font-medium">
                      {formatRelativeDate(stock.dividendDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="financial-value">
                    {formatCurrency(stock.totalDividend)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Est. quarterly
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(recentDividends.length >= 3 || upcomingDividends.length >= 5) && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {recentDividends.length > 0 ? `last ${recentDividends.length} recent` : ''}{recentDividends.length > 0 && upcomingDividends.length > 0 ? ' and ' : ''}{upcomingDividends.length > 0 ? `next ${upcomingDividends.length} upcoming` : ''} payments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};