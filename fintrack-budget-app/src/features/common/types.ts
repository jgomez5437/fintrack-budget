export interface Database {
  public: {
    Tables: {
      monthly_budgets: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          month: number;
          income: string;
          categories: BudgetCategory[];
          transactions: Transaction[];
          bills?: Bill[];
          recurring?: RecurringTransaction[];
          debt?: Debt[];
          current_savings?: string;
          income_categories?: IncomeCategory[];
          created_at: string;
          updated_at: string;
        }
      }
    }
  }
}

export interface BudgetCategory {
  id: string | number;
  name: string;
  amount: string | number;
}

export interface Transaction {
  id: string | number;
  categoryId: string | number;
  date: string;
  name: string;
  amount: string | number;
}

export interface Bill {
  id: string | number;
  name: string;
  amount: string | number;
  date: string;
}

export interface RecurringTransaction {
  id: string | number;
  transactionId: string | number;
  dayOfMonth: number;
  estimatedAmount: number;
  merchantName: string;
  isActive: boolean;
}

export interface Debt {
  id: string | number;
  name: string;
  amount: string | number;
  rate: string | number;
  min: string | number;
  isCreditCard: boolean;
  payoffDate?: string;
  autopay?: boolean;
  dueDay?: string;
  lastAutopayDate?: string;
  date?: string;
}

export interface IncomeCategory {
  id: string | number;
  name: string;
  amount: string | number;
  actualAmount: string | number;
}
