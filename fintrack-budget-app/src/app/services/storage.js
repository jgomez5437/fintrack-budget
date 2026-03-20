import { defaultData } from "../constants";
import { ensureSupabaseSession, getSupabase } from "./supabase";

const LAST_CATEGORY_KEY = "fintrack-last-cat";
const budgetKeyPattern = /^budget-(\d{1,2})-(\d{4})$/;

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
    categories: Array.isArray(record?.categories) ? record.categories : [],
    transactions: Array.isArray(record?.transactions) ? record.transactions : [],
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
        const userId = session?.user?.id;
        if (!userId) return browserStorage.get(key);

        const budgetKey = parseBudgetKey(key);
        if (budgetKey) {
          const { data, error } = await supabase
            .from("monthly_budgets")
            .select("income, categories, transactions")
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

        if (key === LAST_CATEGORY_KEY) {
          const { data, error } = await supabase
            .from("user_preferences")
            .select("last_category_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;
          if (!data?.last_category_id) {
            const localValue = await loadLocalValue(key);
            if (localValue) {
              await this.set(key, localValue.value);
              return localValue;
            }

            return null;
          }

          return { value: String(data.last_category_id) };
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
        const userId = session?.user?.id;
        if (!userId) {
          await browserStorage.set(key, value);
          return;
        }

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
              categories: parsedValue.categories,
              transactions: parsedValue.transactions,
            },
            {
              onConflict: "user_id,year,month",
            },
          );

          if (error) throw error;
          return;
        }

        if (key === LAST_CATEGORY_KEY) {
          const { error } = await supabase.from("user_preferences").upsert(
            {
              user_id: userId,
              last_category_id: value,
            },
            {
              onConflict: "user_id",
            },
          );

          if (error) throw error;
          return;
        }
      } catch {
        // Fall through to local storage when Supabase is unavailable.
      }

      await browserStorage.set(key, value);
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
