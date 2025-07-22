import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface DividendData {
  symbol: string;
  company: string;
  amount: number;
  date: string;
}

interface AddDividendFormProps {
  onAddDividend: (dividend: DividendData) => void;
}

export const AddDividendForm = ({ onAddDividend }: AddDividendFormProps) => {
  const [formData, setFormData] = useState({
    symbol: "",
    company: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.symbol && formData.company && formData.amount) {
      onAddDividend({
        symbol: formData.symbol.toUpperCase(),
        company: formData.company,
        amount: parseFloat(formData.amount),
        date: formData.date
      });
      setFormData({
        symbol: "",
        company: "",
        amount: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <Card className="shadow-card gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Dividend Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Apple Inc."
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="mt-1"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="25.50"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-1"
                required
              />
            </div>
          </div>
          <Button type="submit" variant="gradient" className="w-full">
            Add Dividend
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};