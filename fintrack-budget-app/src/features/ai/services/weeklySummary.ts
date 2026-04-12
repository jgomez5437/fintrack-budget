import { getSupabase } from "../../../app/services/supabase";

const OLLAMA_URL = (import.meta.env.VITE_OLLAMA_URL || "").replace(/\/+$/, "");
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "gemma4";

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

function buildPrompt(spentByCategory, categories, totalSpent, weekStart, weekEnd, transactions = [], income, currentSavings, debt = []) {
  const categoryLines = categories
    .map((c) => {
      const spent = spentByCategory[c.id] || 0;
      const budget = parseFloat(c.amount) || 0;
      const overUnder = budget > 0
        ? (spent > budget
          ? `⚠️ $${(spent - budget).toFixed(2)} over budget`
          : `$${(budget - spent).toFixed(2)} under budget`)
        : "";
      return `• ${c.name}: spent $${spent.toFixed(2)}${budget > 0 ? ` / $${budget.toFixed(2)} budgeted ${overUnder}` : ""}`;
    })
    .join("\n");

  const uncatSpent = spentByCategory["__uncategorized__"] || spentByCategory[null] || spentByCategory[undefined] || 0;
  const uncatLine = uncatSpent > 0 ? `• Uncategorized: $${uncatSpent.toFixed(2)}\n` : "";

  // Build per-transaction detail for Groceries and Miscellaneous
  const focusNames = ["groceri", "misc"];
  const focusCatIds = new Set(
    categories
      .filter((c) => focusNames.some((kw) => c.name.toLowerCase().includes(kw)))
      .map((c) => c.id)
  );
  const focusTxLines = categories
    .filter((c) => focusCatIds.has(c.id))
    .map((c) => {
      const catTxs = transactions.filter((t) => String(t.categoryId) === String(c.id));
      if (catTxs.length === 0) return null;
      const txList = catTxs
        .map((t) => `    - ${t.name}: $${parseFloat(t.amount).toFixed(2)}`)
        .join("\n");
      return `  ${c.name} transactions:\n${txList}`;
    })
    .filter(Boolean)
    .join("\n");

  const txSection = focusTxLines
    ? `\nIndividual transactions for key categories:\n${focusTxLines}\n`
    : "";

  const incomeStr = income ? `\nMonthly Income: $${income}` : "";
  const savingsStr = currentSavings ? `\nCurrent Savings: $${currentSavings}` : "";
  const debtLines = (debt || []).map(d => `  - ${d.name}: $${d.amount} (Rate: ${d.rate}%, Min Pay: $${d.minPayment || d.min})`);
  const debtStr = debtLines.length > 0 ? `\nCurrent Debt:\n${debtLines.join("\n")}` : "";

  return `You are a helpful financial assistant.

Write a short weekly summary (3-4 sentences max).

Priorities:
- Focus mainly on groceries and miscellaneous spending
- Highlight if those categories went over budget or felt unusually high
- Simplify numbers (round when possible, avoid too many exact figures)
- Mention 1–2 specific merchants ONLY if they help explain the behavior

Tone:
- Natural and conversational (like one person talking to another)
- Slightly blunt but supportive
- Avoid sounding like a report or lecture

Guidelines:
- Do NOT list too many numbers
- Do NOT give generic advice
- Instead, give one specific, realistic nudge based on the data

Goal:
Make it feel like a quick, honest check-in that sparks a real conversation.

Week period: ${weekStart} through ${weekEnd}
Total spent this period: $${totalSpent.toFixed(2)}${incomeStr}${savingsStr}${debtStr}

Spending by category:
${categoryLines}
${uncatLine}${txSection}`;
}

// ── Main Generator ────────────────────────────────────────────────────────────

/**
 * Calls Gemini, saves to DB, returns the saved row.
 * Uses effectiveUserId for shared budgets (secondary user routes to primary).
 */
export async function generateAndSaveSummary({ userId, spentByCategory, totalSpent, categories, transactions = [], income, currentSavings, debt = [] }) {
  if (!OLLAMA_URL) {
    console.error("[weeklySummary] VITE_OLLAMA_URL not set in environment.");
    return null;
  }

  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  const now = new Date();
  const { week_start, week_end, generated_on } = getWeekWindow(now);

  const prompt = buildPrompt(spentByCategory, categories, totalSpent, week_start, week_end, transactions, income, currentSavings, debt);

  let summaryText;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        keep_alive: "10m",
        options: {
          temperature: 0.7,
          num_predict: 3048,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[weeklySummary] Ollama API error:", response.status, body);
      return null;
    }

    const json = await response.json();
    summaryText = json?.response?.trim();
    if (!summaryText) {
      console.error("[weeklySummary] Empty response from Ollama");
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

/**
 * Handles multi-turn chat for a weekly summary.
 * `messages` should be an array of `{ role: "user" | "model", content: string }`.
 */
export async function askFollowUpQuestion({ summary, transactions = [], categories = [], income, currentSavings, debt = [], messages }) {
  if (!OLLAMA_URL) {
    throw new Error("VITE_OLLAMA_URL not set in environment.");
  }

  const txLines = transactions.map(t => {
    const cat = categories.find(c => c.id === parseInt(t.categoryId, 10))?.name || "Uncategorized";
    const amt = parseFloat(t.amount);
    return `- ${t.date} | ${cat} | ${t.name} : $${amt.toFixed(2)}`;
  }).join("\n");

  const categoryContext = categories.map(c => {
    const budget = parseFloat(c.amount) || 0;
    const catTxs = transactions.filter(t => String(t.categoryId) === String(c.id));
    const spentThisMonth = catTxs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const leftThisMonth = budget - spentThisMonth;
    return `- ${c.name}: Budget $${budget.toFixed(2)} | Spent this month $${spentThisMonth.toFixed(2)} | Remaining $${leftThisMonth.toFixed(2)}`;
  }).join("\n");

  const debtLines = (debt || []).map(d => `- ${d.name}: $${d.amount}`).join("\n");
  const debtContext = debtLines ? `\nCurrent Debt:\n${debtLines}` : "";
  const incomeContext = income ? `\nMonthly Income: $${income}` : "";
  const savingsContext = currentSavings ? `\nCurrent Savings: $${currentSavings}` : "";

  const systemContext = `You are a helpful financial assistant answering follow-up questions about the user's weekly summary.
Keep your answers very concise, direct, formatting friendly (use bullet points), and helpful.

Context: 
Summary generated on ${summary.generated_on} for the week of ${summary.week_start} to ${summary.week_end}.
Weekly Summary Text:
"${summary.summary_text}"${incomeContext}${savingsContext}${debtContext}

Monthly Category Overview (Budget vs Spent):
${categoryContext}

Monthly Transactions Reference:
${txLines}
`;

  const ollamaMessages = [
    { role: "system", content: systemContext },
    ...messages.map(msg => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.content
    }))
  ];

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false,
        keep_alive: "10m",
        options: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[askFollowUpQuestion] API Error Details:", errText);
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const json = await response.json();
    const reply = json?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from Ollama");

    return reply;
  } catch (err) {
    console.error("[askFollowUpQuestion] Fetch failed:", err);
    throw err;
  }
}

