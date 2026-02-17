

# Fix: Empty Dashboard Has No Action Buttons for New Users

## Problem
When a new user signs up and lands on the dashboard with zero stocks, the `PortfolioTable` component returns an early empty state that only shows a text message ("No dividend stocks in your portfolio yet"). The stock management controls (Add Stock form, Bulk Upload, Connect Account) are inside the card header that only renders when `stocks.length > 0`. This leaves new users with no way to take action.

## Solution
Update the empty state in `PortfolioTable` to include functional action buttons for all three ways to add stocks: manual entry, CSV upload, and brokerage connection.

## Changes

### File: `src/components/PortfolioTable.tsx`

Replace the empty-state return block (~lines 148-158) with a version that includes the three stock management controls:

1. **Add Stock form** -- input + button calling the existing `handleSubmit`
2. **Bulk Upload** -- renders the existing `BulkUploadStocksDialog` component
3. **Connect Account** -- renders the existing `PlaidLinkButton` component

The layout will mirror the controls already shown in the populated card header, presented in a centered, welcoming format so new users immediately see what to do.

### No other files change
All props are already passed from `DividendDashboard.tsx` to `PortfolioTable`. The empty state just needs to use them.

