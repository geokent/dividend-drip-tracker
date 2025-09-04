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
  // Filter stocks with upcoming dividend dates and sort by date
  const upcomingDividends = stocks
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
        isUpcoming: dividendDate > new Date()
      };
    })
    .filter(stock => stock.isUpcoming)
    .sort((a, b) => a.dividendDate.getTime() - b.dividendDate.getTime())
    .slice(0, 5); // Show next 5 dividends

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  if (upcomingDividends.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="card-title flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Dividends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming dividend payments found. Add dividend stocks to track future payments.
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
          Upcoming Dividends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingDividends.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-sm">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {stock.shares} shares
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatDate(stock.dividendDate)}
                </Badge>
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
        
        {upcomingDividends.length >= 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Showing next 5 dividend payments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};