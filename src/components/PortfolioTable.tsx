import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Trash2, Edit3, Check, X, Building2, User, Search, Upload, Link } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { BulkUploadStocksDialog } from "./BulkUploadStocksDialog";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackedStock {
  symbol: string;
  companyName: string;
  currentPrice: number | null;
  dividendYield: number | null;
  dividendPerShare: number | null;
  annualDividend: number | null;
  shares: number;
  sector: string | null;
  source?: string;
  plaid_item_id?: string | null;
  last_synced?: string;
}

interface PortfolioTableProps {
  stocks: TrackedStock[];
  onRemoveStock: (symbol: string) => void;
  onUpdateShares: (symbol: string, shares: number) => void;
  // Stock management props
  onStockFound?: (stockData: any) => void;
  userId?: string;
  onBulkUploadSuccess?: () => void;
  onPlaidSuccess?: (data?: any) => void;
  onPlaidDisconnect?: () => void;
  isConnected?: boolean;
  connectedItemId?: string;
  connectedInstitutions?: Array<{item_id: string, institution_name: string, account_count: number}>;
}

export const PortfolioTable = ({ 
  stocks, 
  onRemoveStock, 
  onUpdateShares,
  onStockFound,
  userId,
  onBulkUploadSuccess,
  onPlaidSuccess,
  onPlaidDisconnect,
  isConnected,
  connectedItemId,
  connectedInstitutions
}: PortfolioTableProps) => {
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editShares, setEditShares] = useState<string>("");
  const [symbol, setSymbol] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEditShares = (symbol: string, currentShares: number) => {
    setEditingStock(symbol);
    setEditShares(currentShares.toString());
  };

  const handleSaveShares = (symbol: string) => {
    const shares = parseFloat(editShares) || 0;
    onUpdateShares(symbol, shares);
    setEditingStock(null);
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setEditShares("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !onStockFound) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-dividend-data', {
        body: { symbol: symbol.toUpperCase() }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch stock data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data.error) {
        toast({
          title: "Stock Not Found",
          description: `Could not find dividend data for ${symbol.toUpperCase()}. Please check the symbol and try again.`,
          variant: "destructive"
        });
        return;
      }

      await onStockFound(data);
      setSymbol("");
      toast({
        title: "Success!",
        description: `Added ${data.symbol} to your portfolio`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (stocks.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="space-y-3">
            <p className="text-muted-foreground">No dividend stocks in your portfolio yet</p>
            <p className="text-sm text-muted-foreground">
              Add stocks manually or connect your brokerage account to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="card-title">Portfolio Holdings</CardTitle>
          
          {/* Stock Management Controls */}
          {onStockFound && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Add Stock Form */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-32"
                  disabled={isLoading}
                />
                <Button type="submit" size="sm" disabled={isLoading || !symbol.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              {/* Bulk Upload & Connect Account */}
              <div className="flex items-center gap-2">
                <BulkUploadStocksDialog onSuccess={onBulkUploadSuccess} />
                
                <PlaidLinkButton
                  userId={userId}
                  onSuccess={onPlaidSuccess}
                  onDisconnect={onPlaidDisconnect}
                  isConnected={isConnected}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Yield</TableHead>
              <TableHead className="text-right">Monthly Div.</TableHead>
              <TableHead className="text-right">Annual Div.</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.symbol}</span>
                      {stock.source === 'plaid_sync' ? (
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          Synced
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {stock.companyName}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {stock.sector && (
                        <Badge variant="secondary" className="text-xs">
                          {stock.sector}
                        </Badge>
                      )}
                      {stock.last_synced && stock.source === 'plaid_sync' && (
                        <span className="text-xs text-muted-foreground">
                          Synced: {new Date(stock.last_synced).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {editingStock === stock.symbol ? (
                    <div className="flex items-center gap-2 justify-end">
                      <Input
                        type="number"
                        value={editShares}
                        onChange={(e) => setEditShares(e.target.value)}
                        className="w-20 h-8 text-sm"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveShares(stock.symbol)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="financial-value">{stock.shares}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditShares(stock.symbol, stock.shares)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="financial-value">
                    {stock.currentPrice ? formatCurrency(stock.currentPrice) : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="financial-value">
                    {stock.currentPrice 
                      ? formatCurrency(stock.currentPrice * stock.shares)
                      : "—"
                    }
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="financial-value">
                    {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="financial-value">
                    {stock.annualDividend && stock.shares
                      ? formatCurrency((stock.annualDividend * stock.shares) / 12)
                      : "—"
                    }
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="financial-value">
                    {stock.annualDividend && stock.shares
                      ? formatCurrency(stock.annualDividend * stock.shares)
                      : "—"
                    }
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveStock(stock.symbol)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};