const PERSONAL_IMPORT_CATEGORY_RULES = [
  ["Us Mobile", "Phone Bill"],
  ["doordashdashpa", "Subscriptions"],
  ["tucsonmedical", "TMC"],
  ["Usconnect Tmdra", "Groceries"],
  ["Mister Car Wash", "Subscriptions"],
  ["Trader Joe", "Groceries"],
  ["Innago", "Rent"],
  ["ascension", "Subscriptions"],
  ["google one", "Subscriptions"],
  ["American Strateg", "Renters Insurance"],
  ["Prog Advanced", "Car Insurance"],
  ["Makanstudio", "Subscriptions"],
  ["Tep Corporate", "Electric"],
  
  // Specific subscriptions
  ["Blink", "Subscriptions"],
  ["Disney", "Subscriptions"],
  ["Prime", "Subscriptions"],
  ["Spotify", "Subscriptions"],
  ["Nintendo", "Subscriptions"],
  
  // Mapped categories from transaction list
  ["Freddy", "Fast Food"],
  ["Jersey Mike", "Fast Food"],
  ["Albertson", "Groceries"],
  ["TruWest", "Car Payment"],
  ["Chick Fil A", "Fast Food"],
  ["Sofi Bank", "SoFi CC"],
  ["Sofi", "SoFi CC"],
  ["Chase", "Credit Card Payments"],
  ["Raising Canes", "Fast Food"],
  ["Prestige Vending", "Groceries"],
  ["Oahu", "Fast Food"],
  ["Ops barcelona", "Laundry"],
  ["doordash", "Fast Food"],
  ["Frys", "Groceries"],
  ["Starbucks", "Fast Food"],
  ["McDonald", "Fast Food"],
];

function normalizeMerchantValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function autoAssignImportCategory(rows, categories, recurring = []) {
  const categoriesByName = new Map(
    categories.map((category) => [category.name.trim().toLowerCase(), String(category.id)]),
  );

  const normalizedRules = PERSONAL_IMPORT_CATEGORY_RULES.map(([merchant, categoryName]) => ({
    merchant: normalizeMerchantValue(merchant),
    categoryId: categoriesByName.get(categoryName.trim().toLowerCase()) || "",
  })).filter((rule) => rule.categoryId);

  return rows.map((row) => {
    const normalizedRaw = normalizeMerchantValue(row.rawDesc);
    const normalizedName = normalizeMerchantValue(row.name);
    
    // Special rule for gas stations (amount >= 20)
    const isGasStation = ["circle k", "qt", "quiktrip"].some(
      (gas) => normalizedRaw.includes(gas) || normalizedName.includes(gas)
    );
    if (isGasStation && Math.abs(row.amount) >= 20) {
      const gasCategoryId = categoriesByName.get("gas");
      if (gasCategoryId) {
        return { ...row, categoryId: gasCategoryId };
      }
    }

    // First check against hard-coded rules
    const matchedRule = normalizedRules.find(
      (rule) =>
        normalizedRaw.includes(rule.merchant) || normalizedName.includes(rule.merchant),
    );

    if (matchedRule) {
      return { ...row, categoryId: matchedRule.categoryId };
    }

    // Then check against known recurring transactions (must match name exactly or normalized, and price)
    const matchedRecurring = recurring.find(
      (r) => 
        (r.name.trim().toLowerCase() === row.name.trim().toLowerCase() ||
         normalizeMerchantValue(r.name) === normalizedName) &&
        Math.abs(r.amount) === Math.abs(row.amount) &&
        r.categoryId
    );

    if (matchedRecurring) {
      return { ...row, categoryId: String(matchedRecurring.categoryId) };
    }

    return row;
  });
}
