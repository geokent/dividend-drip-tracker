import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SavedScenario {
  id: string;
  name: string;
  monthly_investment: number;
  portfolio_growth_rate: number;
  dividend_growth_rate: number;
  additional_yearly_contribution: number;
  reinvest_dividends: boolean;
  monthly_expenses: number;
  created_at: string;
}

interface SaveScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyInvestment: number;
  portfolioGrowthRate: number;
  dividendGrowthRate: number;
  additionalYearlyContribution: number;
  reinvestDividends: boolean;
  monthlyExpensesInRetirement: number;
  userId: string;
  onLoadScenario: (scenario: SavedScenario) => void;
}

export const SaveScenarioDialog: React.FC<SaveScenarioDialogProps> = ({
  open,
  onOpenChange,
  monthlyInvestment,
  portfolioGrowthRate,
  dividendGrowthRate,
  additionalYearlyContribution,
  reinvestDividends,
  monthlyExpensesInRetirement,
  userId,
  onLoadScenario
}) => {
  const [scenarioName, setScenarioName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      loadSavedScenarios();
    }
  }, [open, userId]);

  const loadSavedScenarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedScenarios(data || []);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Failed to Load Scenarios",
        description: "Could not retrieve your saved scenarios.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your scenario",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_scenarios')
        .insert({
          user_id: userId,
          name: scenarioName.trim(),
          monthly_investment: monthlyInvestment,
          portfolio_growth_rate: portfolioGrowthRate,
          dividend_growth_rate: dividendGrowthRate,
          additional_yearly_contribution: additionalYearlyContribution,
          reinvest_dividends: reinvestDividends,
          monthly_expenses: monthlyExpensesInRetirement
        });

      if (error) throw error;

      toast({
        title: "Scenario Saved! 💾",
        description: `"${scenarioName}" has been saved for comparison`,
      });

      setScenarioName('');
      loadSavedScenarios();
    } catch (error) {
      console.error('Save scenario error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save scenario. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScenario = async (id: string, name: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('saved_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Scenario Deleted",
        description: `"${name}" has been removed`,
      });

      setSavedScenarios(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete scenario error:', error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete scenario.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    onLoadScenario(scenario);
    onOpenChange(false);
    toast({
      title: "Scenario Loaded! ⚙️",
      description: `"${scenario.name}" parameters applied`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save & Manage Scenarios
          </DialogTitle>
          <DialogDescription>
            Save your current parameters to compare different investment strategies over time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Parameters Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-sm mb-3 text-primary">Current Parameters</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Investment:</span>
                <span className="font-medium">${monthlyInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Portfolio Growth:</span>
                <span className="font-medium">{(portfolioGrowthRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dividend Growth:</span>
                <span className="font-medium">{dividendGrowthRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FIRE Target:</span>
                <span className="font-medium">${monthlyExpensesInRetirement.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          {/* Save New Scenario */}
          <div className="space-y-3">
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <div className="flex gap-2">
              <Input
                id="scenario-name"
                placeholder="e.g., Aggressive Growth, Retirement Plan B"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveScenario()}
              />
              <Button onClick={handleSaveScenario} disabled={isSaving || !scenarioName.trim()}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Saved Scenarios List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Your Saved Scenarios</h4>
              <Button variant="ghost" size="sm" onClick={loadSavedScenarios} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedScenarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved scenarios yet</p>
                <p className="text-xs">Save your first scenario above!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {savedScenarios.map((scenario) => (
                  <Card key={scenario.id} className="border border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{scenario.name}</h5>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            <span>${scenario.monthly_investment.toLocaleString()}/mo</span>
                            <span>{(scenario.portfolio_growth_rate * 100).toFixed(0)}% growth</span>
                            <span>{scenario.dividend_growth_rate}% div</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Saved {new Date(scenario.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleLoadScenario(scenario)}
                          >
                            Load
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteScenario(scenario.id, scenario.name)}
                            disabled={isDeleting === scenario.id}
                          >
                            {isDeleting === scenario.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
