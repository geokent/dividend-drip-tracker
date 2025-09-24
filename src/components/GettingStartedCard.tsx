import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Building2, Plus, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface GettingStartedCardProps {
  hasStocks: boolean;
  hasConnectedAccounts: boolean;
  onConnectAccount: () => void;
  onAddStock: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export const GettingStartedCard = ({ 
  hasStocks, 
  hasConnectedAccounts, 
  onConnectAccount, 
  onAddStock,
  isExpanded = false,
  onToggleExpanded = () => {}
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
      description: 'Use the box above to add dividend stocks',
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

  // Compact collapsed view
  if (!isExpanded) {
    return (
      <Card className="shadow-card border-primary/20 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {completedSteps}/{steps.length}
              </Badge>
              <span className="text-sm font-medium">Complete setup to get started</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleExpanded}
              className="flex items-center gap-2"
            >
              <span className="text-xs">Details</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-primary/20 transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="card-title">Getting Started</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedSteps}/{steps.length} complete
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleExpanded}
              className="flex items-center gap-1"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
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
              
              {!step.completed && step.id !== 'stocks' && (
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