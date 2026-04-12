const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Sends a list of imported transactions to Gemini and asks it to identify
 * transactions that look like recurring subscriptions or bills (e.g., Netflix, Rent, Utilities).
 * 
 * @param {Array} transactions - Array of parsed rows from importTransactions.js
 * @returns {Array} An array of IDs for transactions identified as recurring
 */
export async function detectRecurringTransactions(transactions) {
  if (!GEMINI_API_KEY || !transactions || transactions.length === 0) {
    return [];
  }

  // To save tokens, we only send necessary info (id, name, amount)
  const txList = transactions
    .map((t) => `ID: ${t.id} | ${t.name} | ${t.amount}`)
    .join("\n");

  const prompt = `You are a financial analysis assistant.
Below is a list of transactions imported from a user's bank statement.
Your task is to identify which of these transactions are likely to be RECURRING subscriptions, bills, or memberships.
Examples of recurring items: Netflix, Spotify, Rent, Utilities, Gym Memberships, Insurance.
DO NOT include one-off purchases like groceries, gas, restaurants, or retail clothing.

Transactions:
${txList}

Return ONLY a valid JSON array of the IDs of the recurring transactions. Example output:
["1683901", "1683903"]

If none are recurring, return an empty array: []`;

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Low temperature for factual extraction
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      console.error("[aiRecurring] Gemini API error:", response.status);
      return [];
    }

    const json = await response.json();
    const resultText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!resultText) return [];

    const recurringIds = JSON.parse(resultText);
    return Array.isArray(recurringIds) ? recurringIds : [];
  } catch (err) {
    console.error("[aiRecurring] Failed to detect recurring transactions:", err);
    return [];
  }
}

/**
 * Helper to extract day of month from a date string (e.g. "Oct 15")
 */
export function extractDayOfMonth(dateString) {
  if (!dateString) return null;
  const match = dateString.match(/\d+/);
  if (match) {
    const day = parseInt(match[0], 10);
    if (day >= 1 && day <= 31) return day;
  }
  return null;
}
