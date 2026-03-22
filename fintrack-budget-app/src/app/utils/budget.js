import { C } from "../constants";

const ALERT_CATEGORY_NAMES = new Set([
  "groceries",
  "miscellaneous (tp, shampoo etc)",
  "gas",
]);

export function buildBudgetSummary(data, month = new Date().getMonth(), year = new Date().getFullYear()) {
  const income = parseFloat(data.income) || 0;
  const categories = data.categories || [];
  const transactions = data.transactions || [];
  const totalPlanned = categories.reduce(
    (sum, category) => sum + (parseFloat(category.amount) || 0),
    0,
  );

  const spentByCategory = transactions.reduce((accumulator, transaction) => {
    if (transaction.isSplit && Array.isArray(transaction.splits)) {
      transaction.splits.forEach((split) => {
        const catId = split.categoryId;
        const amt = parseFloat(split.amount) || 0;
        accumulator[catId] = (accumulator[catId] || 0) + amt;
      });
    } else {
      accumulator[transaction.categoryId] =
        (accumulator[transaction.categoryId] || 0) +
        (parseFloat(transaction.amount) || 0);
    }
    return accumulator;
  }, {});

  const totalSpent = transactions.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
    0,
  );
  const leftover = totalPlanned - totalSpent;
  const expectedSurplus = income - totalPlanned;
  const now = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
  const isPastMonth =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());
  const elapsedDays = isPastMonth ? daysInMonth : isCurrentMonth ? now.getDate() : 0;
  const projectedMonthEndSpent =
    elapsedDays > 0 ? (totalSpent / elapsedDays) * daysInMonth : 0;
  const spendPct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;
  const leftoverPositive = leftover >= 0;
  const expectedSurplusPositive = expectedSurplus >= 0;
  const barColor = spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green;
  const pastNames = [...new Set(transactions.map((transaction) => transaction.name))];

  return {
    income,
    totalPlanned,
    transactions,
    spentByCategory,
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
