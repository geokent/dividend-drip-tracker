import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

interface Dividend {
  id: string;
  symbol: string;
  company: string;
  amount: number;
  date: string;
}

interface DividendListProps {
  dividends: Dividend[];
}

export const DividendList = ({ dividends }: DividendListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedDividends = [...dividends].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="shadow-card gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Dividend Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedDividends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No dividend payments recorded yet.</p>
            <p className="text-sm">Add your first dividend to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDividends.map((dividend) => (
              <div
                key={dividend.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-secondary/50 transition-smooth"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {dividend.symbol}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{dividend.company}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(dividend.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-financial-green">
                    ${dividend.amount.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {dividend.symbol}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};