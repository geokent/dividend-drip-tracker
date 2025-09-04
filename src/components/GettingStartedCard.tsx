import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Building2, Plus, TrendingUp } from "lucide-react";

interface GettingStartedCardProps {
  hasStocks: boolean;
  hasConnectedAccounts: boolean;
  onConnectAccount: () => void;
  onAddStock: () => void;
}

export const GettingStartedCard = ({ 
  hasStocks, 
  hasConnectedAccounts, 
  onConnectAccount, 
  onAddStock 
}: GettingStartedCardProps) => {
  const steps = [
    {
      id: 'connect',
      title: 'Connect your brokerage account',
      description: 'Automatically sync your dividend stocks',
      completed: hasConnectedAccounts,
      action: onConnectAccount,
      actionText: 'Connect Account',
      icon: Building2
    },
    {
      id: 'stocks',
      title: 'Add dividend stocks',
      description: 'Track stocks manually or via connected accounts',
      completed: hasStocks,
      action: onAddStock,
      actionText: 'Add Stock',
      icon: Plus
    },
    {
      id: 'track',
      title: 'Monitor your dividend income',
      description: 'View projections and track your progress',
      completed: hasStocks && hasConnectedAccounts,
      action: () => {},
      actionText: 'View Projections',
      icon: TrendingUp
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const allComplete = completedSteps === steps.length;

  if (allComplete) return null;

  return (
    <Card className="shadow-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="card-title">Getting Started</CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{steps.length} complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                step.completed 
                  ? 'bg-secondary/30' 
                  : 'bg-secondary/10 hover:bg-secondary/20'
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className={`font-medium text-sm ${
                    step.completed ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
              
              {!step.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={step.action}
                  className="flex-shrink-0"
                >
                  {step.actionText}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};