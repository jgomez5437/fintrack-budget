import { getSupabase } from "./supabase";

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── Date Helpers ──────────────────────────────────────────────────────────────

/** Returns today's local date as YYYY-MM-DD */
function todayISO() {
  const d = new Date();
  return toISO(d);
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True only on Sunday (local time) */
export function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

/**
 * The reporting window for a given sunday generation date:
 * week_start = the PREVIOUS Sunday (7 days back)
 * week_end   = the PREVIOUS Saturday (1 day back)
 */
export function getWeekWindow(sunday = new Date()) {
  const sat = new Date(sunday);
  sat.setDate(sat.getDate() - 1);          // Saturday
  const prevSun = new Date(sunday);
  prevSun.setDate(prevSun.getDate() - 7);  // Previous Sunday

  return {
    week_start: toISO(prevSun),
    week_end: toISO(sat),
    generated_on: toISO(sunday),
  };
}

// ── Supabase Queries ──────────────────────────────────────────────────────────

/** Returns the summary generated on today's date, or null */
export async function getTodaysSummary(userId) {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  const today = todayISO();
  const { data, error } = await supabase
    .from("weekly_ai_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("generated_on", today)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[weeklySummary] getTodaysSummary error:", error);
  }
  return data ?? null;
}

/** Returns all summaries for a user, newest first */
export async function getAllSummaries(userId) {
  const supabase = getSupabase();
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("weekly_ai_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("generated_on", { ascending: false });

  if (error) {
    console.error("[weeklySummary] getAllSummaries error:", error);
    return [];
  }
  return data ?? [];
}

// ── Gemini Prompt ─────────────────────────────────────────────────────────────

function buildPrompt(transactions, categories, weekStart, weekEnd) {
  // Filter transactions to only those within the week window
  const weekTxs = transactions.filter((t) => {
    if (!t.date) return false;
    return t.date >= weekStart && t.date <= weekEnd;
  });

  // Aggregate spent by category
  const spentMap = {};
  weekTxs.forEach((t) => {
    const key = t.categoryId ?? "__uncategorized__";
    spentMap[key] = (spentMap[key] || 0) + parseFloat(t.amount || 0);
  });

  const totalSpent = Object.values(spentMap).reduce((s, v) => s + v, 0);

  const categoryLines = categories
    .map((c) => {
      const spent = spentMap[c.id] || 0;
      const budget = parseFloat(c.amount) || 0;
      const overUnder = budget > 0 ? (spent > budget ? `⚠️ $${(spent - budget).toFixed(2)} over` : `$${(budget - spent).toFixed(2)} under`) : "";
      return `• ${c.name}: spent $${spent.toFixed(2)}${budget > 0 ? ` / $${budget.toFixed(2)} budget ${overUnder}` : ""}`;
    })
    .join("\n");

  const uncatSpent = spentMap["__uncategorized__"] || 0;
  const uncatLine = uncatSpent > 0 ? `• Uncategorized: $${uncatSpent.toFixed(2)}\n` : "";

  return `You are a personal financial advisor assistant inside a budgeting app called FinTrack. \
Your job is to give a brief, friendly, and specific weekly spending summary to the user based on their transaction data.

Write 3–5 sentences. Be specific — mention dollar amounts. \
Focus most of your commentary on the Groceries and Miscellaneous categories if they have activity. \
If spending is high, call it out honestly but encouragingly. \
End with one actionable tip the user can take this week to improve.

Week period: ${weekStart} through ${weekEnd}
Total transactions this week: ${weekTxs.length}
Total spent: $${totalSpent.toFixed(2)}

Spending by category:
${categoryLines}
${uncatLine}
Please write the summary now (no preamble, just the summary paragraph):`;
}

// ── Main Generator ────────────────────────────────────────────────────────────

/**
 * Calls Gemini, saves to DB, returns the saved row.
 * Uses effectiveUserId for shared budgets (secondary user routes to primary).
 */
export async function generateAndSaveSummary({ userId, transactions, categories }) {
  if (!GEMINI_API_KEY) {
    console.error("[weeklySummary] GEMINI_API_KEY not set in environment.");
    return null;
  }

  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  const now = new Date();
  const { week_start, week_end, generated_on } = getWeekWindow(now);

  const prompt = buildPrompt(transactions, categories, week_start, week_end);

  let summaryText;
  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[weeklySummary] Gemini API error:", response.status, body);
      return null;
    }

    const json = await response.json();
    summaryText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!summaryText) {
      console.error("[weeklySummary] Empty response from Gemini");
      return null;
    }
  } catch (err) {
    console.error("[weeklySummary] Fetch failed:", err);
    return null;
  }

  // Upsert to avoid race conditions if called twice simultaneously
  const { data, error } = await supabase
    .from("weekly_ai_summaries")
    .upsert(
      { user_id: userId, week_start, week_end, generated_on, summary_text: summaryText },
      { onConflict: "user_id,generated_on" }
    )
    .select()
    .single();

  if (error) {
    console.error("[weeklySummary] DB save error:", error);
    return null;
  }

  return data;
}
