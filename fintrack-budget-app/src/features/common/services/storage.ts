import { defaultData } from "../../../app/constants";
import { ensureSupabaseSession, getSupabase, onAuthStateChange } from "../../../app/services/supabase";

export const LAST_CATEGORY_KEY = "fintrack-last-cat";
export const CATEGORY_ALERT_COUNT_KEY = "fintrack-category-alert-count";
export const FIRST_NAME_KEY = "fintrack-first-name";
const budgetKeyPattern = /^budget-(\d{1,2})-(\d{4})$/;
const preferenceColumnsByKey = {
  [LAST_CATEGORY_KEY]: "last_category_id",
  [CATEGORY_ALERT_COUNT_KEY]: "category_alert_auth_count",
  [FIRST_NAME_KEY]: "first_name",
};

// These preferences are personal to the signed-in user and should NOT
// be redirected to the primary/linked account's data.
const personalPreferenceKeys = new Set([FIRST_NAME_KEY]);

function isMissingPreferenceColumnError(error, columnName) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return message.includes(columnName.toLowerCase()) && message.includes("column");
}

let cachedEffectiveUserId = null;

export function clearStorageCache() {
  cachedEffectiveUserId = null;
}

if (typeof window !== "undefined") {
  onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      clearStorageCache();
    }
  });
}

async function getEffectiveUserId(supabase, sessionUserId) {
  if (cachedEffectiveUserId) return cachedEffectiveUserId;

  try {
    const { data } = await supabase
      .from("account_links")
      .select("primary_user_id")
      .eq("linked_user_id", sessionUserId)
      .maybeSingle();

    if (data?.primary_user_id) {
      cachedEffectiveUserId = data.primary_user_id;
      return cachedEffectiveUserId;
    }
  } catch (e) {
    // Ignore if table doesn't exist yet
  }

  cachedEffectiveUserId = sessionUserId;
  return cachedEffectiveUserId;
}

const browserStorage = {
  async get(key) {
    if (typeof window === "undefined") return null;

    const value = window.localStorage.getItem(key);
    return value === null ? null : { value };
  },

  async set(key, value) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(key, value);
  },
};

function parseBudgetKey(key) {
  const match = key.match(budgetKeyPattern);
  if (!match) return null;

  return {
    month: Number.parseInt(match[1], 10),
    year: Number.parseInt(match[2], 10),
  };
}

function normalizeBudgetRecord(record) {
  return {
    income: record?.income ?? "",
    currentSavings: record?.currentSavings ?? record?.current_savings ?? "",
    incomeCategories: Array.isArray(record?.income_categories) ? record.income_categories : (Array.isArray(record?.incomeCategories) ? record.incomeCategories : []),
    categories: Array.isArray(record?.categories) ? record.categories : [],
    transactions: Array.isArray(record?.transactions) ? record.transactions : [],
    bills: Array.isArray(record?.bills) ? record.bills : [],
    recurring: Array.isArray(record?.recurring) ? record.recurring : [],
    debt: Array.isArray(record?.debt) ? record.debt : [],
  };
}

async function loadLocalValue(key) {
  return browserStorage.get(key);
}

function createSupabaseStorage() {
  return {
    async get(key) {
      try {
        const supabase = getSupabase();
        if (!supabase) return browserStorage.get(key);

        const session = await ensureSupabaseSession();
        const sessionUserId = session?.user?.id;
        if (!sessionUserId) return browserStorage.get(key);

        const userId = await getEffectiveUserId(supabase, sessionUserId);

        const budgetKey = parseBudgetKey(key);
        if (budgetKey) {
          const { data, error } = await supabase
            .from("monthly_budgets")
            .select("income, income_categories, categories, transactions, bills, current_savings, recurring, debt")
            .eq("user_id", userId)
            .eq("month", budgetKey.month)
            .eq("year", budgetKey.year)
            .maybeSingle();

          if (error) throw error;
          if (!data) {
            const localValue = await loadLocalValue(key);
            if (localValue) {
              await this.set(key, localValue.value);
              return localValue;
            }

            return null;
          }

          return { value: JSON.stringify(normalizeBudgetRecord(data)) };
        }

        const preferenceColumn = preferenceColumnsByKey[key];
        if (preferenceColumn) {
          // Personal preferences (like name) always belong to the actual signed-in user.
          const prefUserId = personalPreferenceKeys.has(key) ? sessionUserId : userId;
          const { data, error } = await supabase
            .from("user_preferences")
            .select(preferenceColumn)
            .eq("user_id", prefUserId)
            .maybeSingle();

          if (error) {
            if (isMissingPreferenceColumnError(error, preferenceColumn)) {
              return browserStorage.get(key);
            }
            throw error;
          }
          const value = data?.[preferenceColumn];
          if (value === null || value === undefined || value === "") {
            const localValue = await loadLocalValue(key);
            if (localValue) {
              await this.set(key, localValue.value);
              return localValue;
            }

            return null;
          }

          return { value: String(value) };
        }

        return browserStorage.get(key);
      } catch {
        return browserStorage.get(key);
      }
    },

    async set(key, value) {
      try {
        const supabase = getSupabase();
        if (!supabase) {
          await browserStorage.set(key, value);
          return;
        }

        const session = await ensureSupabaseSession();
        const sessionUserId = session?.user?.id;
        if (!sessionUserId) {
          await browserStorage.set(key, value);
          return;
        }

        const userId = await getEffectiveUserId(supabase, sessionUserId);

        const budgetKey = parseBudgetKey(key);
        if (budgetKey) {
          const parsedValue = normalizeBudgetRecord({
            ...defaultData(),
            ...JSON.parse(value),
          });

          const { error } = await supabase.from("monthly_budgets").upsert(
            {
              user_id: userId,
              month: budgetKey.month,
              year: budgetKey.year,
              income: parsedValue.income,
              income_categories: parsedValue.incomeCategories,
              current_savings: parsedValue.currentSavings,
              categories: parsedValue.categories,
              transactions: parsedValue.transactions,
              bills: parsedValue.bills,
              recurring: parsedValue.recurring,
              debt: parsedValue.debt,
            },
            {
              onConflict: "user_id,year,month",
            },
          );

          if (error) throw error;
          return;
        }

        const preferenceColumn = preferenceColumnsByKey[key];
        if (preferenceColumn) {
          const { error } = await supabase.from("user_preferences").upsert(
            {
              user_id: userId,
              [preferenceColumn]:
                preferenceColumn === "category_alert_auth_count"
                  ? Number.parseInt(value, 10) || 0
                  : value,
            },
            {
              onConflict: "user_id",
            },
          );

          if (error) {
            if (isMissingPreferenceColumnError(error, preferenceColumn)) {
              await browserStorage.set(key, value);
              return;
            }
            throw error;
          }
          return;
        }
      } catch {
        // Fall through to local storage when Supabase is unavailable.
      }

      await browserStorage.set(key, value);
    },

    async getAllKeys() {
      const keys = [];
      try {
        const supabase = getSupabase();
        if (supabase) {
          const session = await ensureSupabaseSession();
          const sessionUserId = session?.user?.id;
          if (sessionUserId) {
            const userId = await getEffectiveUserId(supabase, sessionUserId);
            const { data, error } = await supabase
              .from("monthly_budgets")
              .select("month, year")
              .eq("user_id", userId);
            
            if (!error && data) {
              data.forEach(item => {
                keys.push(`budget-${item.month}-${item.year}`);
              });
            }
          }
        }
      } catch {}

      if (typeof window !== "undefined") {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && budgetKeyPattern.test(key) && !keys.includes(key)) {
            keys.push(key);
          }
        }
      }
      return keys;
    },
  };
}

const supabaseStorage = createSupabaseStorage();

export function getStorage() {
  if (typeof window === "undefined") {
    return browserStorage;
  }

  return window.storage ?? supabaseStorage;
}
