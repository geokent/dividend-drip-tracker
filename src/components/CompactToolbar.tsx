import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlaidLinkButton } from "./PlaidLinkButton";
import { StockSymbolForm } from "./StockSymbolForm";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Plus, RefreshCw, ArrowUpDown, Building2, DollarSign, TrendingUp, PieChart } from "lucide-react";

interface CompactToolbarProps {
  connectedAccounts: number;
  connectedInstitutions: Array<{item_id: string, institution_name: string, account_count: number}>;
  recentActivity: any[];
  stats: {
    totalAnnualDividends: number;
    totalQuarterlyDividends: number;
    totalMonthlyDividends: number;
    uniqueStocks: number;
  };
  userId?: string;
  isSyncing: boolean;
  isRefreshingPrices: boolean;
  lastSyncedAt: Date | null;
  centered?: boolean;
  onSync: () => void;
  onRefresh: () => void;
  onPlaidSuccess: (data?: any) => void;
  onStockFound: (stockData: any) => void;
  onDisconnectInstitution: (itemId: string, institutionName: string) => void;
}

export const CompactToolbar = ({
  connectedAccounts,
  connectedInstitutions,
  recentActivity,
  stats,
  userId,
  isSyncing,
  isRefreshingPrices,
  lastSyncedAt,
  centered = false,
  onSync,
  onRefresh,
  onPlaidSuccess,
  onStockFound,
  onDisconnectInstitution
}: CompactToolbarProps) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 py-3 border-b border-border ${centered ? 'justify-center' : ''}`}>
      {/* Portfolio Stats Chips */}
      <div className="flex items-center gap-2 text-sm">
        <Badge variant="secondary" className="gap-1">
          <DollarSign className="h-3 w-3" />
          ${stats.totalAnnualDividends.toFixed(0)}/yr
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <PieChart className="h-3 w-3" />
          {stats.uniqueStocks} stocks
        </Badge>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Connected Accounts */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <Building2 className="h-3 w-3" />
              <span className="text-xs">{connectedAccounts}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Connected Accounts</h4>
                <Badge variant="outline">{connectedAccounts} connected</Badge>
              </div>
              
              {connectedInstitutions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Institutions:</p>
                  {connectedInstitutions.map((institution) => (
                    <div key={institution.item_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium text-sm">{institution.institution_name}</p>
                        <p className="text-xs text-muted-foreground">{institution.account_count} accounts</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDisconnectInstitution(institution.item_id, institution.institution_name)}
                        className="text-destructive hover:text-destructive"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {userId && (
                <PlaidLinkButton 
                  userId={userId} 
                  onSuccess={onPlaidSuccess}
                  disabled={connectedInstitutions.length >= 1}
                  limitMessage={connectedInstitutions.length >= 1 ? "Free tier allows only 1 institution" : undefined}
                  size="sm"
                />
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Stock */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
              <Plus className="h-3 w-3" />
              <span className="text-xs">Add</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <h4 className="font-medium">Add Dividend Stock</h4>
              <p className="text-sm text-muted-foreground">
                Search and add dividend stocks manually.
              </p>
              <StockSymbolForm onStockFound={onStockFound} />
            </div>
          </PopoverContent>
        </Popover>

        {/* Sync */}
        <Button
          onClick={onSync}
          disabled={isSyncing}
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
        >
          <ArrowUpDown className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-xs">{isSyncing ? 'Syncing' : 'Sync'}</span>
        </Button>

        {/* Refresh */}
        <Button
          onClick={onRefresh}
          disabled={isRefreshingPrices}
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshingPrices ? 'animate-spin' : ''}`} />
          <span className="text-xs">{isRefreshingPrices ? 'Updating' : 'Refresh'}</span>
        </Button>

        {/* Recent Activity */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Bell className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <h4 className="font-medium">Recent Activity</h4>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Last Synced */}
      {lastSyncedAt && (
        <>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="text-xs text-muted-foreground">
            Last synced: {lastSyncedAt.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};