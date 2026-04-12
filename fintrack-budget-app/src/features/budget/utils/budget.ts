import { C } from "../../../app/constants";
import type { Debt, Transaction, BudgetCategory, IncomeCategory, AppData } from '../../common/types';

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

export function calculatePayoffMonths(debt: Pick<Debt, 'amount' | 'rate' | 'min' | 'isCreditCard'>): number | typeof Infinity {
  let amt = parseFloat(String(debt.amount)) || 0;
  let min = parseFloat(String(debt.min)) || 0;
  let apr = parseFloat(String(debt.rate)) || 0;
  
  if (amt <= 0) return 0;
  if (min <= 0) return Infinity; 
  if (apr < 0) apr = 0; 
  
  let months = 0;
  if (apr === 0) return Math.ceil(amt / min);

  while (amt > 0 && months < 1200) {
    let monthlyRate = debt.isCreditCard 
      ? (Math.pow(1 + apr / 100 / 365, 30.416) - 1)
      : (apr / 100 / 12);
      
    let interest = amt * monthlyRate;
    let principalPaid = min - interest;
    
    if (principalPaid <= 0) return Infinity;
    
    amt -= principalPaid;
    months++;
  }
  return months;
}

const ALERT_CATEGORY_NAMES = new Set([
  "groceries",
  "miscellaneous (tp, shampoo etc)",
  "gas",
]);

export function buildBudgetSummary(data: any, month = new Date().getMonth(), year = new Date().getFullYear()) {
  const incomeCategories: IncomeCategory[] = data.incomeCategories || [];
  const categories: BudgetCategory[] = data.categories || [];
  const transactions: Transaction[] = data.transactions || [];
  
  const totalPlanned = categories.reduce(
    (sum, category) => sum + (parseFloat(String(category.amount)) || 0),
    0,
  );

  const spentByCategory: Record<string, number> = {};
  const earnedByCategory: Record<string, number> = {};

  transactions.forEach((transaction: any) => {
    if (transaction.isSplit && Array.isArray(transaction.splits)) {
      transaction.splits.forEach((split: any) => {
        const catId = String(split.categoryId);
        const amt = parseFloat(split.amount) || 0;
        if (incomeCategories.some(ic => String(ic.id) === catId)) {
          earnedByCategory[catId] = (earnedByCategory[catId] || 0) + Math.abs(amt);
        } else {
          spentByCategory[catId] = (spentByCategory[catId] || 0) + amt;
        }
      });
    } else {
      const catId = String(transaction.categoryId);
      const amt = parseFloat(String(transaction.amount)) || 0;
      if (incomeCategories.some(ic => String(ic.id) === catId)) {
        earnedByCategory[catId] = (earnedByCategory[catId] || 0) + Math.abs(amt);
      } else {
        spentByCategory[catId] = (spentByCategory[catId] || 0) + amt;
      }
    }
  });

  const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);

  const totalIncome = incomeCategories.reduce((sum, ic) => {
    const actual = earnedByCategory[String(ic.id)] || 0;
    const estimate = parseFloat(String(ic.amount)) || 0;
    return sum + (actual > 0 ? actual : estimate);
  }, 0);

  const leftover = totalPlanned - totalSpent;
  const expectedSurplus = totalIncome - totalPlanned;
  const now = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
  const isPastMonth =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());
  const elapsedDays = isPastMonth ? daysInMonth : isCurrentMonth ? now.getDate() : 0;
  const projectedMonthEndSpent =
    elapsedDays > 0 ? (totalSpent / elapsedDays) * daysInMonth : 0;
  
  const spendPct =
    totalIncome > 0 ? Math.min(Math.max((totalSpent / totalIncome) * 100, 0), 100) : 0;
  const leftoverPositive = leftover >= 0;
  const expectedSurplusPositive = expectedSurplus >= 0;
  const barColor = spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green;
  const pastNames = [...new Set(transactions.map((transaction) => transaction.name))];

  return {
    income: totalIncome,
    incomeCategories,
    totalPlanned,
    transactions,
    spentByCategory,
    earnedByCategory,
    totalSpent,
    leftover,
    expectedSurplus,
    projectedMonthEndSpent,
    spendPct,
    leftoverPositive,
    expectedSurplusPositive,
    barColor,
    pastNames,
  };
}

export function getCategoryAlerts(categories: BudgetCategory[], spentByCategory: Record<string, number>, thresholdPct = 85) {
  return (categories || [])
    .map((category) => {
      const budget = parseFloat(String(category.amount)) || 0;
      const spent = spentByCategory?.[String(category.id)] || 0;
      const pctUsed = budget > 0 ? (spent / budget) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        budget,
        spent,
        pctUsed,
      };
    })
    .filter(
      (category) =>
        ALERT_CATEGORY_NAMES.has(category.name.trim().toLowerCase()) &&
        category.budget > 0 &&
        category.pctUsed >= thresholdPct,
    )
    .sort((first, second) => second.pctUsed - first.pctUsed);
}

export function getCategoryById(categories: BudgetCategory[], id: string | number) {
  return categories.find((category) => String(category.id) === String(id));
}