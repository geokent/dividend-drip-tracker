import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const StatsCard = ({ title, value, subtitle, trend, className = "" }: StatsCardProps) => {
  const trendColor = trend === "up" ? "text-financial-green" : trend === "down" ? "text-destructive" : "text-financial-gray";
  
  return (
    <Card className={`shadow-card hover:shadow-hover transition-smooth gradient-card ${className}`}>
      <CardHeader className="pb-1 px-3 pt-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <div className="text-lg font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className={`text-xs mt-1 ${trendColor}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};