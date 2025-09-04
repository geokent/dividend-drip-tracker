import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectionParametersStripProps {
  monthlyInvestment: number;
  setMonthlyInvestment: (value: number) => void;
  portfolioGrowthRate: number;
  setPortfolioGrowthRate: (value: number) => void;
  dividendGrowthRate: number;
  setDividendGrowthRate: (value: number) => void;
  additionalYearlyContribution: number;
  setAdditionalYearlyContribution: (value: number) => void;
  reinvestDividends: boolean;
  setReinvestDividends: (value: boolean) => void;
}

export const ProjectionParametersStrip = ({
  monthlyInvestment,
  setMonthlyInvestment,
  portfolioGrowthRate,
  setPortfolioGrowthRate,
  dividendGrowthRate,
  setDividendGrowthRate,
  additionalYearlyContribution,
  setAdditionalYearlyContribution,
  reinvestDividends,
  setReinvestDividends
}: ProjectionParametersStripProps) => {
  return (
    <Card className="shadow-card p-6 mb-8 gradient-secondary">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/30">
        <div className="p-0 text-center space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Monthly Investment
          </label>
          <p className="text-lg font-bold text-foreground">
            ${monthlyInvestment.toLocaleString()}
          </p>
          <Slider
            min={0}
            max={5000}
            step={100}
            value={[monthlyInvestment]}
            onValueChange={([value]) => setMonthlyInvestment(value)}
            className="w-full"
          />
        </div>
        
        <div className="p-0 text-center pt-6 md:pt-0 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Portfolio Growth
          </label>
          <p className="text-lg font-bold text-foreground">
            {(portfolioGrowthRate * 100).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%
          </p>
          <Slider
            min={0}
            max={20}
            step={0.5}
            value={[portfolioGrowthRate * 100]}
            onValueChange={([value]) => {
              const halfStep = Math.round(value * 2) / 2;
              setPortfolioGrowthRate(halfStep / 100);
            }}
            className="w-full"
          />
        </div>
        
        <div className="p-0 text-center pt-6 md:pt-0 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Dividend Growth
          </label>
          <p className="text-lg font-bold text-foreground">
            {dividendGrowthRate}%
          </p>
          <Slider
            min={0}
            max={15}
            step={0.5}
            value={[dividendGrowthRate]}
            onValueChange={([value]) => setDividendGrowthRate(value)}
            className="w-full"
          />
        </div>
        
        <div className="p-0 text-center pt-6 md:pt-0 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Additional Yearly
          </label>
          <p className="text-lg font-bold text-foreground">
            ${additionalYearlyContribution.toLocaleString()}
          </p>
          <Slider
            min={0}
            max={50000}
            step={1000}
            value={[additionalYearlyContribution]}
            onValueChange={([value]) => setAdditionalYearlyContribution(value)}
            className="w-full"
          />
        </div>
        
        <div className="p-0 text-center pt-6 md:pt-0">
          <label className="text-sm font-medium text-muted-foreground block mb-4">
            Reinvest Dividends
          </label>
          <div className="flex items-center justify-center space-x-2">
            <Checkbox
              checked={reinvestDividends}
              onCheckedChange={(checked) => setReinvestDividends(checked as boolean)}
            />
            <span className="text-sm font-medium text-foreground">
              {reinvestDividends ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};