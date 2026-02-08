// Account represents an investment account (401k, IRA, etc.)
export interface Account {
  id: string;
  name: string;
  accountType: string | null;
  isActive: boolean;
  createdAt: Date;
}

// Entry represents a value snapshot for an account on a specific date
export interface Entry {
  id: string;
  accountId: string;
  value: number;
  entryDate: Date;
  notes: string | null;
  createdAt: Date;
}

// Backup represents a saved backup file
export interface Backup {
  id: string;
  filename: string;
  createdAt: Date;
  size: number;
  accountCount: number;
  entryCount: number;
}

// Dashboard summary data
export interface AccountSummary {
  id: string;
  name: string;
  currentValue: number;
  changeAmount: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface DashboardSummary {
  totalValue: number;
  totalChangeAmount: number;
  totalChangePercent: number;
  lastUpdated: Date;
  accounts: AccountSummary[];
}

// Chart data structure
export interface ChartDataPoint {
  date: string;
  totalValue: number;
  accounts: Record<string, number>;
}

export interface ChartData {
  data: ChartDataPoint[];
  accounts: string[];
}

// Time filter for chart views
export interface TimeFilter {
  id: string;
  label: string;
  days: number | null;
}

// Form data types
export interface AccountFormData {
  name: string;
  accountType: string;
}

export interface EntryFormData {
  accountId: string;
  value: number;
  entryDate: string;
  notes: string;
}

// CSV import types
export interface CSVRow {
  accountName: string;
  value: number;
  date: string;
  notes?: string;
}

export interface CSVImportResult {
  valid: CSVRow[];
  invalid: { row: number; reason: string; data: string[] }[];
}

// User data structure for Firebase
export interface UserData {
  accounts: Account[];
  entries: Entry[];
}

// App settings
export interface AppSettings {
  darkMode: boolean;
  defaultTimeFilter: string;
}
