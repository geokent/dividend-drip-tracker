import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { AddDividendForm } from "./AddDividendForm";
import { DividendList } from "./DividendList";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import heroImage from "@/assets/dividend-hero.jpg";

interface Dividend {
  id: string;
  symbol: string;
  company: string;
  amount: number;
  date: string;
}

export const DividendDashboard = () => {
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  // Load dividends from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('dividends');
    if (saved) {
      try {
        setDividends(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved dividends:', e);
      }
    }
  }, []);

  // Save to localStorage whenever dividends change
  useEffect(() => {
    localStorage.setItem('dividends', JSON.stringify(dividends));
  }, [dividends]);

  const handleAddDividend = (dividendData: Omit<Dividend, 'id'>) => {
    const newDividend: Dividend = {
      ...dividendData,
      id: Date.now().toString()
    };
    setDividends(prev => [...prev, newDividend]);
    toast({
      title: "Dividend Added!",
      description: `$${dividendData.amount.toFixed(2)} from ${dividendData.symbol} has been recorded.`,
    });
  };

  const calculateStats = () => {
    const totalIncome = dividends.reduce((sum, div) => sum + div.amount, 0);
    
    const currentYear = new Date().getFullYear();
    const yearlyIncome = dividends
      .filter(div => new Date(div.date).getFullYear() === currentYear)
      .reduce((sum, div) => sum + div.amount, 0);
    
    const uniqueStocks = new Set(dividends.map(div => div.symbol)).size;
    
    const currentMonth = new Date().getMonth();
    const monthlyIncome = dividends
      .filter(div => {
        const date = new Date(div.date);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((sum, div) => sum + div.amount, 0);

    return {
      totalIncome,
      yearlyIncome,
      monthlyIncome,
      uniqueStocks
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            {user?.email && (
              <span className="text-muted-foreground">({user.email})</span>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div
            className="h-64 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Dividend Tracker
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  Track and manage your dividend income with ease
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Income"
            value={`$${stats.totalIncome.toFixed(2)}`}
            subtitle="All time earnings"
            trend="up"
          />
          <StatsCard
            title="This Year"
            value={`$${stats.yearlyIncome.toFixed(2)}`}
            subtitle={`${new Date().getFullYear()} earnings`}
            trend="up"
          />
          <StatsCard
            title="This Month"
            value={`$${stats.monthlyIncome.toFixed(2)}`}
            subtitle="Current month"
            trend="neutral"
          />
          <StatsCard
            title="Portfolio"
            value={stats.uniqueStocks.toString()}
            subtitle="Dividend stocks"
            trend="neutral"
          />
        </div>

        {/* Add Dividend Form */}
        <div className="mb-6">
          <AddDividendForm onAddDividend={handleAddDividend} />
        </div>

        {/* Dividend List */}
        <DividendList dividends={dividends} />
      </div>
    </div>
  );
};