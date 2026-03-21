const PERSONAL_IMPORT_CATEGORY_RULES = [
  ["Us Mobile Www.usmobile.", "Phone Bill"],
  ["Dd *doordashdashpa Doordash", "Subscriptions"],
  ["Shs*tucsonmedical Tucson", "TMC"],
  ["Usconnect Tmdra", "Groceries"],
  ["Mister Car Wash", "Subscriptions"],
  ["Trader Joe S", "Groceries"],
  ["Innago Llc Innago", "Rent"],
  ["Google *ascension", "Subscriptions"],
  ["American Strateg Ach", "Renters Insurance"],
  ["Disney Plus Wilmington", "Subscriptions"],
  ["Prog Advanced Ins", "Car Insurance"],
  ["Makanstudio Nepean Can", "Subscriptions"],
  ["Spotify P3ff4f0c32 New", "Spotify"],
  ["Tep Corporate", "Electric"],
];

function normalizeMerchantValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function autoAssignImportCategory(rows, categories) {
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
    const matchedRule = normalizedRules.find(
      (rule) =>
        normalizedRaw.includes(rule.merchant) || normalizedName.includes(rule.merchant),
    );

    return matchedRule ? { ...row, categoryId: matchedRule.categoryId } : row;
  });
}
