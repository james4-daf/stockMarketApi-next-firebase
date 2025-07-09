// Central type definitions for the stock market application

// =============================================================================
// API/Revenue Data Types
// =============================================================================
export interface RevenueDataItem {
  date: string;
  revenue: number;
}

export interface FormattedRevenueData {
  year: number;
  revenue: number;
  revenueInBillions: string;
  date: string;
}

export interface TableDataItem {
  year: number;
  revenue: string;
  yoyGrowth: string | null;
}

// =============================================================================
// Financial Statement Types
// =============================================================================
export interface BalanceSheetDataTypes {
  date: string;
  fiscalYear: string;
  cashAndCashEquivalents: number;
  totalEquity: number;
  totalDebt: number;
  netDebt: number;
}

export interface CashFlowDataTypes {
  date: string;
  fiscalYear: string;
  netIncome: number;
  stockBasedCompensation: number;
  freeCashFlow: number;
  period?: string;
}

export interface FundamentalDataTypes {
  date: string;
  revenue: number;
  epsdiluted: number;
}

// =============================================================================
// Stock Data Types
// =============================================================================
export interface StockProps {
  symbol: string;
  marketCap: number;
  price: number;
  image: string;
  companyName: string;
  range: string;
  change: number;
  changePercentage: number;
}

export interface StockDetailsProps {
  stockData: StockProps;
  inWatchlist: boolean;
  toggleWatchlist: () => void;
}

export interface SearchBarStocks {
  symbol: string;
  name: string;
}

// =============================================================================
// Key Features Types
// =============================================================================
export interface KeyFeatures {
  loading: boolean;
  error: null | string;
  peRatioTTM: number;
  dividendYielPercentageTTM: number;
}

// =============================================================================
// Earnings Types
// =============================================================================
export interface Earnings {
  symbol: string;
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

// =============================================================================
// Reports Types
// =============================================================================
export interface Report {
  date: string;
  url: string;
  form: string;
  accessionNumber: string;
  primaryDocument: string;
}

// =============================================================================
// Dividends Types
// =============================================================================
export interface DividendsDataTypes {
  date: string;
  adjDividend: number;
  year: number;
}

// =============================================================================
// Modal Props Types
// =============================================================================
export interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockTicker: string;
}

// =============================================================================
// Type Aliases (for backward compatibility)
// =============================================================================
export type TableData = TableDataItem; // Alias for AiSummaryModal
