import { C } from "../constants";

export function buildBudgetSummary(data) {
  const income = parseFloat(data.income) || 0;
  const transactions = data.transactions || [];

  const spentByCategory = transactions.reduce((accumulator, transaction) => {
    accumulator[transaction.categoryId] =
      (accumulator[transaction.categoryId] || 0) +
      (parseFloat(transaction.amount) || 0);
    return accumulator;
  }, {});

  const totalSpent = transactions.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
    0,
  );
  const leftover = income - totalSpent;
  const spendPct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;
  const leftoverPositive = leftover >= 0;
  const barColor = spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green;
  const pastNames = [...new Set(transactions.map((transaction) => transaction.name))];

  return {
    income,
    transactions,
    spentByCategory,
    totalSpent,
    leftover,
    spendPct,
    leftoverPositive,
    barColor,
    pastNames,
  };
}

export function getCategoryById(categories, id) {
  return categories.find((category) => category.id === parseInt(id, 10));
}
