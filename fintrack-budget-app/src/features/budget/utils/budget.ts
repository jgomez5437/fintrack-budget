import type { Debt, Transaction } from '../../common/types';

export function calculateTotalSpent(transactions: Transaction[], categoryId: string | number): number {
  if (!transactions) return 0;
  return transactions
    .filter(t => String(t.categoryId) === String(categoryId))
    .reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);
}

export function calculateRemainingBudget(budgeted: number | string, spent: number | string): number {
  const b = parseFloat(String(budgeted)) || 0;
  const s = parseFloat(String(spent)) || 0;
  return Math.max(0, b - s);
}

/**
 * Calculates the total months required to pay off a given debt.
 * Safely handles edge cases like zero rate, simple interest, and negative amortization.
 */
export function calculatePayoffMonths(debt: Pick<Debt, 'amount' | 'rate' | 'min' | 'isCreditCard'>): number | typeof Infinity {
  let amt = parseFloat(String(debt.amount)) || 0;
  let min = parseFloat(String(debt.min)) || 0;
  let apr = parseFloat(String(debt.rate)) || 0;
  
  if (amt <= 0) return 0;
  if (min <= 0) return Infinity; // Impossible to pay off without payments
  if (apr < 0) apr = 0; // Negative interest resolves to 0 interest
  
  let months = 0;
  // If no interest, it's just pure linear reduction
  if (apr === 0) {
    return Math.ceil(amt / min);
  }

  while (amt > 0 && months < 1200) {
    // scale rate based on loan type
    let monthlyRate = debt.isCreditCard 
      ? (Math.pow(1 + apr / 100 / 365, 30.416) - 1)
      : (apr / 100 / 12);
      
    let interest = amt * monthlyRate;
    let principalPaid = min - interest;
    
    // Negative amortization trap
    if (principalPaid <= 0) {
      return Infinity;
    }
    
    amt -= principalPaid;
    months++;
  }
  
  return months;
}
