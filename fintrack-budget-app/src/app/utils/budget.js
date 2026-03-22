import { C } from "../constants";

const ALERT_CATEGORY_NAMES = new Set([
  "groceries",
  "miscellaneous (tp, shampoo etc)",
  "gas",
]);

export function buildBudgetSummary(data, month = new Date().getMonth(), year = new Date().getFullYear()) {
  const incomeCategories = data.incomeCategories || [];
  const categories = data.categories || [];
  const transactions = data.transactions || [];
  
  const totalPlanned = categories.reduce(
    (sum, category) => sum + (parseFloat(category.amount) || 0),
    0,
  );

  const spentByCategory = {};
  const earnedByCategory = {};

  transactions.forEach((transaction) => {
    if (transaction.isSplit && Array.isArray(transaction.splits)) {
      transaction.splits.forEach((split) => {
        const catId = split.categoryId;
        const amt = parseFloat(split.amount) || 0;
        // If catId is in incomeCategories, it's earned
        if (incomeCategories.some(ic => ic.id === parseInt(catId, 10))) {
          earnedByCategory[catId] = (earnedByCategory[catId] || 0) + Math.abs(amt);
        } else {
          spentByCategory[catId] = (spentByCategory[catId] || 0) + amt;
        }
      });
    } else {
      const catId = transaction.categoryId;
      const amt = parseFloat(transaction.amount) || 0;
      if (incomeCategories.some(ic => ic.id === parseInt(catId, 10))) {
        earnedByCategory[catId] = (earnedByCategory[catId] || 0) + Math.abs(amt);
      } else {
        spentByCategory[catId] = (spentByCategory[catId] || 0) + amt;
      }
    }
  });

  const totalSpent = transactions.reduce(
    (sum, transaction) => {
      const amt = parseFloat(transaction.amount) || 0;
      // If it's income, it reduces total spent (unless we want to track gross spending)
      // Actually, if it's assigned to an income category, we might want to exclude it from totalSpent
      // or treat it as negative. Let's treat it as negative for now to show "net spending".
      return sum + amt;
    },
    0,
  );

  // Dynamic Income Calculation: Sum of (Actual Earned if > 0, else Estimated)
  const totalIncome = incomeCategories.reduce((sum, ic) => {
    const actual = earnedByCategory[ic.id] || 0;
    const estimate = parseFloat(ic.amount) || 0;
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
  
  const spendPct = totalIncome > 0 ? Math.min((totalSpent / totalIncome) * 100, 100) : 0;
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

export function getCategoryAlerts(categories, spentByCategory, thresholdPct = 85) {
  return (categories || [])
    .map((category) => {
      const budget = parseFloat(category.amount) || 0;
      const spent = spentByCategory?.[category.id] || 0;
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

export function getCategoryById(categories, id) {
  return categories.find((category) => category.id === parseInt(id, 10));
}
