import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CSVRow {
  symbol: string;
  shares: number;
  company_name?: string;
}

interface BulkUploadStocksDialogProps {
  onSuccess: () => void;
}

export function BulkUploadStocksDialog({ onSuccess }: BulkUploadStocksDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = "symbol,shares,company_name\nAAPL,100,Apple Inc.\nMSFT,50,Microsoft Corporation\nKO,75,The Coca-Cola Company";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dividend_stocks_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const validatedData: CSVRow[] = [];
        const validationErrors: string[] = [];

        data.forEach((row, index) => {
          const symbol = row.symbol?.toString().trim().toUpperCase();
          const shares = parseFloat(row.shares);
          const company_name = row.company_name?.toString().trim();

          if (!symbol) {
            validationErrors.push(`Row ${index + 1}: Symbol is required`);
            return;
          }

          if (isNaN(shares) || shares <= 0) {
            validationErrors.push(`Row ${index + 1}: Shares must be a positive number`);
            return;
          }

          validatedData.push({
            symbol,
            shares,
            company_name: company_name || undefined
          });
        });

        setCsvData(validatedData);
        setErrors(validationErrors);
      },
      error: (error) => {
        setErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleUpload = async () => {
    if (csvData.length === 0) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let successCount = 0;
      let errorCount = 0;

      for (const stock of csvData) {
        try {
          // Check if stock already exists
          const { data: existingStock } = await supabase
            .from('user_stocks')
            .select('*')
            .eq('user_id', user.id)
            .eq('symbol', stock.symbol)
            .maybeSingle();

          if (existingStock) {
            // Update existing stock
            const { error } = await supabase
              .from('user_stocks')
              .update({ 
                shares: stock.shares,
                company_name: stock.company_name || existingStock.company_name,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingStock.id);

            if (error) throw error;
          } else {
            // Insert new stock
            const { error } = await supabase
              .from('user_stocks')
              .insert({
                user_id: user.id,
                symbol: stock.symbol,
                shares: stock.shares,
                company_name: stock.company_name
              });

            if (error) throw error;
          }
          successCount++;
        } catch (error) {
          console.error(`Error processing ${stock.symbol}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} stocks${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: successCount > 0 ? "default" : "destructive"
      });

      if (successCount > 0) {
        onSuccess();
        setIsOpen(false);
        setCsvData([]);
        setErrors([]);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload stocks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Stocks</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple stocks to your portfolio. Use the template below to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">CSV Template</h4>
              <p className="text-xs text-muted-foreground">
                Required: symbol, shares. Optional: company_name
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="csv-upload" className="text-sm font-medium">
              Upload CSV File
            </label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Validation Errors:</p>
                  <ul className="text-xs space-y-1 ml-4">
                    {errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="list-disc">{error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li className="list-disc">... and {errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && errors.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to import {csvData.length} stocks. This will update existing stocks or add new ones to your portfolio.
              </AlertDescription>
            </Alert>
          )}

          {csvData.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              <h4 className="text-sm font-medium mb-2">Preview ({csvData.length} stocks)</h4>
              <div className="space-y-1 text-xs">
                {csvData.slice(0, 10).map((stock, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-mono">{stock.symbol}</span>
                    <span>{stock.shares} shares</span>
                  </div>
                ))}
                {csvData.length > 10 && (
                  <div className="text-muted-foreground">... and {csvData.length - 10} more</div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={csvData.length === 0 || errors.length > 0 || isUploading}
            >
              {isUploading ? "Uploading..." : `Import ${csvData.length} Stocks`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}