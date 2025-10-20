
export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  income: number;
  expense: number;
  balance: number;
  note?: string;
  created_at?: string;
}

export interface MCCSummary {
  name: string;
  totalIncome: number;
  totalExpenses: number;
  profitLoss: number;
  recordCount: number;
}

export type MCC = 'tassa' | 'falgore' | 'dawanau';

export const CATEGORIES = [
  'Milk Sales',
  'Transport',
  'Feed',
  'Maintenance',
  'Salaries',
  'Miscellaneous',
];

export const MCC_NAMES = {
  tassa: 'Tassa MCC',
  falgore: 'Falgore MCC',
  dawanau: 'Dawanau MCC',
};

export const MCC_TABLES = {
  tassa: 'mcc_tassa_records',
  falgore: 'mcc_falgore_records',
  dawanau: 'mcc_dawanau_records',
};
