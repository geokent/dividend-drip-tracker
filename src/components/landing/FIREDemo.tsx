import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, Target, ArrowRight } from "lucide-react";

const FIREDemo = () => {
  const navigate = useNavigate();

  // Aspirational demo data
  const demoData = {
    currentPortfolio: 850000,
    monthlyExpenses: 4000,
    progressPercentage: 67,
    yearsToFire: 8,
    monthlyDividends: 2700,
    fireNumber: 1200000,
  };

  const milestones = [
    { name: "Coast FIRE", threshold: 25, achieved: true },
    { name: "Barista FIRE", threshold: 50, achieved: true },
    { name: "Lean FIRE", threshold: 75, achieved: false },
    { name: "Full FIRE", threshold: 100, achieved: false },
  ];

  return (
    <Card className="border-2 border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <Badge className="w-fit mx-auto mb-3 bg-primary/10 text-primary border-primary/20">
          <Flame className="h-3 w-3 mr-1" />
          Live Demo
        </Badge>
        <CardTitle className="text-2xl lg:text-3xl">
          Your Path to Financial Independence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold text-primary">
              ${demoData.currentPortfolio.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Monthly Dividends</div>
            <div className="text-2xl font-bold text-green-600">
              ${demoData.monthlyDividends.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              FIRE Progress
            </span>
            <span className="text-lg font-bold text-primary">
              {demoData.progressPercentage}%
            </span>
          </div>
          <Progress value={demoData.progressPercentage} className="h-4" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span className="text-primary font-medium">
              ${demoData.currentPortfolio.toLocaleString()}
            </span>
            <span>${demoData.fireNumber.toLocaleString()}</span>
          </div>
        </div>

        {/* FIRE Year Announcement */}
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Projected FIRE Date
            </span>
          </div>
          <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            You'll reach FIRE in {demoData.yearsToFire} years!
          </div>
          <div className="text-sm text-muted-foreground">
            Based on ${demoData.monthlyDividends.toLocaleString()}/mo dividends growing at 7%/year
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-center text-muted-foreground">
            FIRE Milestones
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {milestones.map((milestone) => (
              <Badge
                key={milestone.name}
                variant={milestone.achieved ? "default" : "secondary"}
                className={
                  milestone.achieved
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                    : "opacity-50"
                }
              >
                {milestone.achieved ? "✓ " : ""}
                {milestone.name} ({milestone.threshold}%)
              </Badge>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full text-base"
          onClick={() => navigate("/future-income-projects")}
        >
          Try Full Calculator
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default FIREDemo;
