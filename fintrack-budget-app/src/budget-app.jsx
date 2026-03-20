import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const defaultData = () => ({ income: "", categories: [], transactions: [] });

const C = {
  bg:"#f0f4ff", surface:"#ffffff", surfaceAlt:"#eef2ff",
  border:"#d0d9f5", borderHover:"#9aaee8",
  blue:"#1e50d4", blueDark:"#163ba8", blueLight:"#e8eeff", blueMid:"#c5d0f7",
  gold:"#f5a623", goldDark:"#d9891a", goldLight:"#fff8ec",
  green:"#16a34a", greenLight:"#dcfce7",
  red:"#dc2626", redLight:"#fee2e2",
  orange:"#ea580c",
  text:"#0f1c4d", textMid:"#4a5a8a", textLight:"#8896bb", white:"#ffffff",
};

// ── Merchant name extractor ──────────────────────────────────────────────────
// Wells Fargo descriptions look like:
//   "PURCHASE AUTHORIZED ON 03/18 CIRCLE K 01634 5801 N TUCSON AZ P000000840680898 CARD 1729"
//   "RECURRING PAYMENT AUTHORIZED ON 03/17 NETFLIX.COM 866-579-7172 CA S000000000000000 CARD 1729"
//   "ONLINE TRANSFER TO CHECKING xxxxxx1234 ON 03/15"
//   "ATM WITHDRAWAL 03/14 #000001234 WELLS FARGO 123 MAIN ST"
//   "DIRECT DEPOSIT EMPLOYER NAME"
//   "ZELLE PAYMENT TO JOHN SMITH"
//   "CHECK # 1042"
function cleanMerchant(raw) {
  if (!raw || typeof raw !== "string") return raw || "Unknown";
  let s = raw.trim();

  // Strip leading transaction type prefixes + date pattern
  s = s.replace(/^(PURCHASE AUTHORIZED ON|RECURRING PAYMENT AUTHORIZED ON|BILL PAYMENT AUTHORIZED ON|CARD PURCHASE|NON-CHASE ATM WITHDRAW|ATM WITHDRAWAL|ONLINE TRANSFER\s+\w+\s+\w+\s+ON|ONLINE PAYMENT TO|WIRE TRANSFER TO|WIRE TRANSFER FROM|DIRECT DEPOSIT|ACH DEBIT|ACH CREDIT|ACH|OVERDRAFT|RETURNED|POS PURCHASE|DEBIT CARD PURCHASE)\s+/i, "");

  // Strip leading date like "03/18 " or "03/18/2024 "
  s = s.replace(/^\d{1,2}\/\d{1,2}(\/\d{2,4})?\s+/, "");

  // Strip trailing noise: card ref, auth codes, phone numbers, addresses, zip codes
  // Card number pattern: "CARD 1729", "S000000...", "P000000..."
  s = s.replace(/\s+(CARD\s+\d{4}|[SP]\d{10,}|\d{15,})\s*$/i, "");
  // Auth/ref codes: long digit string at end
  s = s.replace(/\s+\d{8,}\s*$/, "");
  // State + zip at end: "AZ 85704" or just "AZ P000..." or city-like patterns
  s = s.replace(/\s+[A-Z]{2}\s+\d{5}(-\d{4})?\s*$/, "");
  s = s.replace(/\s+[A-Z]{2}\s*$/, "");
  // Phone numbers: "866-579-7172" or similar
  s = s.replace(/\s+\d{3}[-.\s]\d{3}[-.\s]\d{4}\s*$/, "");
  // Strip store number patterns: " 01634" " #00001234"
  s = s.replace(/\s+#\d+\s*$/, "");
  s = s.replace(/\s+\d{4,}\s*$/, ""); // trailing store numbers or reference codes
  
  // Strip trailing addresses: common street words followed by numbers/cities
  s = s.replace(/\s+\d{1,5}\s+(ST|AVE|BLVD|RD|DR|LN|CT|HWY|FWY|PKWY|STE|WAY|PL|CIR)\b.*$/i, "");

  // Keep only the first meaningful words (usually the merchant name)
  const words = s.trim().split(/\s+/);

  // If it starts with ZELLE / CHECK / ATM, keep the phrase short
  if (/^(ZELLE|CHECK|ATM)/i.test(words[0])) {
    return toTitleCase(words.slice(0, 4).join(" "));
  }

  // Find where the merchant name ends
  const streetSuffixes = new Set(["ST","AVE","BLVD","RD","DR","LN","CT","HWY","FWY","PKWY","STE","WAY","PL","CIR"]);
  let end = words.length;
  
  // Stop at common address/city markers or long digit sequences
  for (let i = 1; i < words.length; i++) {
    const w = words[i].replace(/[^A-Z0-9]/gi, "").toUpperCase();
    // Stop if we hit a long number (store ID, reference code)
    if (/^\d{4,}$/.test(w)) { end = i; break; }
    // Stop at street suffix (if we have at least 2 words)
    if (streetSuffixes.has(w) && i >= 2) { end = i; break; }
    // Stop at 2-letter state code (if we have at least 2 words)
    if (/^[A-Z]{2}$/.test(w) && i >= 2) { end = i; break; }
  }

  // Cap at 3 words max for merchant names to keep them concise
  end = Math.min(end, 3);
  const result = words.slice(0, end).join(" ").trim();

  // Clean up domain suffixes for display
  const cleaned = result.replace(/\.COM$/i, "").replace(/\.NET$/i, "").replace(/\.ORG$/i, "").replace(/\.CO$/i, "");
  const titled = toTitleCase(cleaned);
  
  return titled || toTitleCase(words[0]);
}

function toTitleCase(str) {
  const minorWords = new Set(["a","an","the","and","but","or","for","of","in","on","at","to","with"]);
  return str.toLowerCase().split(" ").map((w, i) => {
    if (!w) return w;
    if (i > 0 && minorWords.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}
// ─────────────────────────────────────────────────────────────────────────────

export default function BudgetApp() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState(() => defaultData());
  const [newCat, setNewCat] = useState({ name: "", amount: "" });
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [activeTab, setActiveTab] = useState("budget");
  const [showTxForm, setShowTxForm] = useState(false);
  const [newTx, setNewTx] = useState({ name: "", amount: "", categoryId: "" });
  const [autocomplete, setAutocomplete] = useState([]);
  const [lastCategoryId, setLastCategoryId] = useState("");
  const [inlineCatId, setInlineCatId] = useState(null);
  const [inlineTx, setInlineTx] = useState({ name: "", amount: "" });
  const [inlineAC, setInlineAC] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTx, setQuickTx] = useState({ name: "", amount: "", categoryId: "" });
  const [quickAutocomplete, setQuickAutocomplete] = useState([]);

  // ── Import state ──
  const [importRows, setImportRows] = useState(null);   // parsed rows pending review
  const [importError, setImportError] = useState("");

  const incomeRef = useRef(null);
  const nameInputRef = useRef(null);
  const inlineNameRef = useRef(null);
  const quickNameRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(`budget-${month}-${year}`);
        if (result) setData({ ...defaultData(), ...JSON.parse(result.value) });
        else setData(defaultData());
      } catch { setData(defaultData()); }
    }
    load();
  }, [month, year]);

  useEffect(() => {
    async function loadPref() {
      try {
        const r = await window.storage.get("fintrack-last-cat");
        if (r) setLastCategoryId(r.value);
      } catch {}
    }
    loadPref();
  }, []);

  const persist = useCallback(async (d) => {
    try { await window.storage.set(`budget-${month}-${year}`, JSON.stringify(d)); } catch {}
  }, [month, year]);

  const update = (d) => { setData(d); persist(d); };

  const income = parseFloat(data.income) || 0;
  const transactions = data.transactions || [];
  const spentByCategory = transactions.reduce((acc, tx) => {
    acc[tx.categoryId] = (acc[tx.categoryId] || 0) + (parseFloat(tx.amount) || 0);
    return acc;
  }, {});
  const totalSpent = transactions.reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
  const leftover = income - totalSpent;
  const spendPct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;
  const leftoverPositive = leftover >= 0;
  const barColor = spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green;
  const fmt = (val) => Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pastNames = [...new Set(transactions.map(t => t.name))];
  const getCatById = (id) => data.categories.find(c => c.id === parseInt(id));

  const addCategory = () => {
    if (!newCat.name.trim() || !newCat.amount) return;
    update({ ...data, categories: [...data.categories, { id: Date.now(), name: newCat.name.trim(), amount: newCat.amount }] });
    setNewCat({ name: "", amount: "" });
  };
  const deleteCategory = (id) => update({ ...data, categories: data.categories.filter(c => c.id !== id), transactions: transactions.filter(t => t.categoryId !== id) });
  const startEdit = (cat) => { setEditingId(cat.id); setEditVal({ name: cat.name, amount: cat.amount }); };
  const saveEdit = (id) => {
    if (!editVal.name.trim() || !editVal.amount) return;
    update({ ...data, categories: data.categories.map(c => c.id === id ? { ...c, ...editVal } : c) });
    setEditingId(null);
  };

  const startIncomeEdit = () => { setIncomeInput(data.income); setEditingIncome(true); setTimeout(() => incomeRef.current?.focus(), 50); };
  const saveIncome = () => { update({ ...data, income: incomeInput }); setEditingIncome(false); };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const openTxForm = (prefill = {}) => {
    setNewTx({ name: prefill.name || "", amount: prefill.amount || "", categoryId: prefill.categoryId || lastCategoryId || (data.categories[0]?.id?.toString() || "") });
    setAutocomplete([]);
    setShowTxForm(true);
    setTimeout(() => nameInputRef.current?.focus(), 60);
  };
  const closeTxForm = () => { setShowTxForm(false); setNewTx({ name: "", amount: "", categoryId: "" }); setAutocomplete([]); };

  const handleNameChange = (val) => {
    setNewTx(v => ({ ...v, name: val }));
    setAutocomplete(val.length >= 1 ? pastNames.filter(n => n.toLowerCase().includes(val.toLowerCase()) && n.toLowerCase() !== val.toLowerCase()).slice(0, 5) : []);
  };
  const pickSuggestion = (name) => {
    const last = transactions.find(t => t.name === name);
    setNewTx(v => ({ ...v, name, amount: last?.amount || v.amount, categoryId: last?.categoryId?.toString() || v.categoryId }));
    setAutocomplete([]);
  };

  const rememberCat = (id) => { setLastCategoryId(id); try { window.storage.set("fintrack-last-cat", id); } catch {} };

  const addTransaction = () => {
    if (!newTx.name.trim() || !newTx.amount || !newTx.categoryId) return;
    const tx = { id: Date.now(), name: newTx.name.trim(), amount: newTx.amount, categoryId: parseInt(newTx.categoryId), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    update({ ...data, transactions: [tx, ...transactions] });
    rememberCat(newTx.categoryId);
    closeTxForm();
  };
  const deleteTransaction = (id) => update({ ...data, transactions: transactions.filter(t => t.id !== id) });
  const duplicateTx = (tx) => openTxForm({ name: tx.name, amount: tx.amount, categoryId: tx.categoryId?.toString() });

  const openInline = (catId) => { setInlineCatId(catId); setInlineTx({ name: "", amount: "" }); setInlineAC([]); setTimeout(() => inlineNameRef.current?.focus(), 60); };
  const closeInline = () => { setInlineCatId(null); setInlineTx({ name: "", amount: "" }); setInlineAC([]); };
  const handleInlineNameChange = (val) => {
    setInlineTx(v => ({ ...v, name: val }));
    setInlineAC(val.length >= 1 ? pastNames.filter(n => n.toLowerCase().includes(val.toLowerCase()) && n.toLowerCase() !== val.toLowerCase()).slice(0, 4) : []);
  };
  const pickInlineAC = (name) => {
    const last = transactions.find(t => t.name === name);
    setInlineTx(v => ({ ...v, name, amount: last?.amount || v.amount }));
    setInlineAC([]);
  };
  const submitInline = (catId) => {
    if (!inlineTx.name.trim() || !inlineTx.amount) return;
    const tx = { id: Date.now(), name: inlineTx.name.trim(), amount: inlineTx.amount, categoryId: parseInt(catId), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    update({ ...data, transactions: [tx, ...transactions] });
    rememberCat(catId.toString());
    closeInline();
  };

  const openQuickAdd = () => { setQuickTx({ name: "", amount: "", categoryId: lastCategoryId || (data.categories[0]?.id?.toString() || "") }); setShowQuickAdd(true); setTimeout(() => quickNameRef.current?.focus(), 60); };
  const handleQuickNameChange = (val) => {
    setQuickTx(v => ({ ...v, name: val }));
    setQuickAutocomplete(val.length >= 1 ? pastNames.filter(n => n.toLowerCase().includes(val.toLowerCase()) && n.toLowerCase() !== val.toLowerCase()).slice(0, 4) : []);
  };
  const pickQuickSuggestion = (name) => {
    const last = transactions.find(t => t.name === name);
    setQuickTx(v => ({ ...v, name, amount: last?.amount || v.amount, categoryId: last?.categoryId?.toString() || v.categoryId }));
    setQuickAutocomplete([]);
  };
  const submitQuickAdd = () => {
    if (!quickTx.name.trim() || !quickTx.amount || !quickTx.categoryId) return;
    const tx = { id: Date.now(), name: quickTx.name.trim(), amount: quickTx.amount, categoryId: parseInt(quickTx.categoryId), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    update({ ...data, transactions: [tx, ...transactions] });
    rememberCat(quickTx.categoryId);
    setShowQuickAdd(false); setQuickTx({ name: "", amount: "", categoryId: "" }); setQuickAutocomplete([]);
  };

  // ── Excel import ──────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const wb = XLSX.read(data, { type: file.name.toLowerCase().endsWith('csv') ? 'string' : 'array', raw: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        const parsed = [];
        for (const row of rows) {
          const rawAmount = row[1]; // Column B (index 1)
          const rawDesc   = row[4]; // Column E (index 4)
          if (rawDesc === "" && rawAmount === "") continue;

          const amount = parseFloat(String(rawAmount).replace(/[^0-9.\-]/g, ""));
          if (isNaN(amount)) continue;
          // Only import debits (negative values = money leaving account)
          if (amount >= 0) continue;

          const name = cleanMerchant(String(rawDesc));
          const absAmt = Math.abs(amount).toFixed(2);
          parsed.push({
            id: Date.now() + Math.random(),
            name,
            rawDesc: String(rawDesc),
            amount: absAmt,
            categoryId: "",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            include: true,
          });
        }

        if (parsed.length === 0) {
          setImportError("No debit transactions found. Make sure column B has amounts and column E has descriptions.");
          return;
        }
        setImportRows(parsed);
      } catch (err) {
        setImportError("Couldn't read the file. Make sure it's a valid .xlsx, .xls, or .csv file.");
      }
    };

    if (file.name.toLowerCase().endsWith('csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  const updateImportRow = (id, field, value) => {
    setImportRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const confirmImport = () => {
    const toAdd = importRows
      .filter(r => r.include && r.name.trim() && r.amount)
      .map(r => ({ id: Date.now() + Math.random(), name: r.name.trim(), amount: r.amount, categoryId: r.categoryId ? parseInt(r.categoryId) : null, date: r.date }));
    update({ ...data, transactions: [...toAdd, ...transactions] });
    setImportRows(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  const iStyle = { background: C.white, border: `1.5px solid ${C.border}`, color: C.text, padding: "12px 14px", borderRadius: "8px", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", width: "100%" };
  const selStyle = { ...iStyle, cursor: "pointer" };

  // ── Import Review Modal ───────────────────────────────────────────────────
  if (importRows) {
    const included = importRows.filter(r => r.include);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@900&display=swap');
          * { box-sizing: border-box; }
          input, select { outline: none; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          input::placeholder { color: ${C.textLight}; }
          select option { background: ${C.white}; color: ${C.text}; }
          .import-row:hover { background: ${C.blueLight} !important; }
          .import-table-container { overflow-x: auto; }
          @media (max-width: 768px) {
            .import-table-container { overflow-x: scroll; -webkit-overflow-scrolling: touch; }
            .import-table-row { min-width: 600px; }
          }
        `}</style>

        {/* Modal header */}
        <div style={{ background: C.blue, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 16px rgba(30,80,212,0.25)" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 900, color: C.white }}>Review Import</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "2px" }}>{importRows.length} transactions found · {included.length} selected</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setImportRows(null)} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: C.white, padding: "9px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Cancel</button>
            <button onClick={confirmImport} style={{ background: C.gold, border: "none", color: C.white, padding: "9px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Import {included.length} Transactions</button>
          </div>
        </div>

        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 20px 60px" }}>
          {/* Instructions */}
          <div style={{ background: C.blueLight, border: `1.5px solid ${C.blueMid}`, borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", fontSize: "13px", color: C.textMid, lineHeight: "1.6" }}>
            <strong style={{ color: C.blue }}>Review before importing.</strong> Merchant names have been cleaned automatically. Edit any name, assign categories, and uncheck rows you don't want. Transactions without a category will still be imported and can be categorized later.
          </div>

          <div className="import-table-container">
            {/* Column headers */}
            <div className="import-table-row" style={{ display: "grid", gridTemplateColumns: "32px minmax(0, 2fr) 90px minmax(0, 1.5fr) 32px", gap: "8px", padding: "8px 14px", fontSize: "11px", fontWeight: 700, color: C.textLight, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              <div></div><div>Merchant</div><div>Amount</div><div>Category</div><div></div>
            </div>

            {/* Rows */}
            <div style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
              {importRows.map((row, i) => (
                <div key={row.id} className="import-row import-table-row" style={{ display: "grid", gridTemplateColumns: "32px minmax(0, 2fr) 90px minmax(0, 1.5fr) 32px", gap: "8px", alignItems: "center", padding: "10px 14px", background: !row.include ? "#f8f8fc" : i % 2 === 0 ? C.white : C.surfaceAlt, borderBottom: i < importRows.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.1s", opacity: row.include ? 1 : 0.45 }}>
                  {/* Checkbox */}
                  <input type="checkbox" checked={row.include} onChange={e => updateImportRow(row.id, "include", e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: C.blue, flexShrink: 0 }} />
                  {/* Merchant name — editable */}
                  <div style={{ minWidth: 0 }}>
                    <input value={row.name} onChange={e => updateImportRow(row.id, "name", e.target.value)} style={{ background: "transparent", border: "none", color: C.text, fontSize: "14px", fontWeight: 600, width: "100%", padding: "2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.name} />
                    <div style={{ fontSize: "11px", color: C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }} title={row.rawDesc}>{row.rawDesc}</div>
                  </div>
                  {/* Amount */}
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.red, whiteSpace: "nowrap" }}>−${row.amount}</div>
                  {/* Category picker */}
                  <select value={row.categoryId} onChange={e => updateImportRow(row.id, "categoryId", e.target.value)} style={{ background: row.categoryId ? C.white : C.surfaceAlt, border: `1.5px solid ${row.categoryId ? C.border : C.blueMid}`, color: row.categoryId ? C.text : C.textLight, padding: "7px 10px", borderRadius: "7px", fontSize: "13px", width: "100%", minWidth: 0, cursor: "pointer" }}>
                    <option value="">No category</option>
                    {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {/* Row delete */}
                  <button onClick={() => setImportRows(rows => rows.filter(r => r.id !== row.id))} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "0", flexShrink: 0 }} onMouseOver={e => e.target.style.color = C.red} onMouseOut={e => e.target.style.color = C.textLight}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom confirm */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
            <button onClick={() => setImportRows(null)} style={{ background: C.white, border: `1.5px solid ${C.border}`, color: C.textMid, padding: "12px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Cancel</button>
            <button onClick={confirmImport} style={{ background: C.blue, border: "none", color: C.white, padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Import {included.length} Transactions →</button>
          </div>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@900&display=swap');
        * { box-sizing: border-box; }
        input, select { outline: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: ${C.textLight}; }
        select option { background: ${C.white}; color: ${C.text}; }
        .nav-btn:hover { background: rgba(255,255,255,0.3) !important; }
        .income-card:hover { box-shadow: 0 4px 20px rgba(30,80,212,0.25) !important; }
        .income-card:hover .edit-hint { opacity: 1 !important; }
        .tab-btn:hover { color: ${C.blue} !important; }
        .cat-row:hover { background: ${C.blueLight} !important; }
        .cat-row:hover .row-actions { opacity: 1 !important; }
        .tx-row:hover { background: ${C.blueLight} !important; }
        .tx-row:hover .tx-actions { opacity: 1 !important; }
        .del-btn:hover { color: ${C.red} !important; }
        .edit-lbl:hover { color: ${C.blue} !important; }
        .dupe-btn:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }
        .cat-add-btn:hover { background: ${C.gold} !important; color: ${C.white} !important; border-color: ${C.gold} !important; }
        .add-cat-btn:hover { background: ${C.blue} !important; color: ${C.white} !important; }
        .log-btn:hover { background: ${C.blueLight} !important; border-color: ${C.blue} !important; color: ${C.blue} !important; }
        .primary-btn:hover { background: ${C.blueDark} !important; }
        .cancel-btn:hover { border-color: ${C.borderHover} !important; color: ${C.textMid} !important; }
        .save-btn:hover { background: ${C.green} !important; color: ${C.white} !important; }
        .ac-item:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }
        .import-btn:hover { background: ${C.blueLight} !important; border-color: ${C.blue} !important; color: ${C.blue} !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease both; }
        .slide-down { animation: slideDown 0.2s ease both; }
        .bar-fill { transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
        .mini-bar-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: "none" }} />

      {/* ── Header ── */}
      <div style={{ background: C.blue, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 16px rgba(30,80,212,0.25)" }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 900, color: C.white, letterSpacing: "-0.5px", lineHeight: 1 }}>FinTrack</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", letterSpacing: "2px", marginTop: "3px" }}>Monthly Budget</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="nav-btn" onClick={prevMonth} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: C.white, width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>‹</button>
          <div style={{ textAlign: "center", minWidth: "110px" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: C.white, letterSpacing: "0.5px" }}>{MONTHS[month].toUpperCase()}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "1px" }}>{year}</div>
          </div>
          <button className="nav-btn" onClick={nextMonth} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: C.white, width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>›</button>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ── Summary Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "12px", marginBottom: "24px" }} className="fade-up">
          <div className="income-card" onClick={!editingIncome ? startIncomeEdit : undefined} style={{ background: C.blue, borderRadius: "14px", padding: "20px", cursor: editingIncome ? "default" : "pointer", position: "relative", transition: "box-shadow 0.2s", border: `1.5px solid ${C.blue}`, boxShadow: "0 4px 16px rgba(30,80,212,0.2)" }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", letterSpacing: "2px", marginBottom: "8px", fontWeight: 600 }}>INCOME</div>
            {editingIncome ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: C.gold, fontSize: "20px", fontWeight: 700 }}>$</span>
                <input ref={incomeRef} type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} onBlur={saveIncome} onKeyDown={e => { if (e.key === "Enter") saveIncome(); if (e.key === "Escape") setEditingIncome(false); }} style={{ background: "transparent", border: "none", color: C.white, fontSize: "26px", fontWeight: 700, width: "100%", minWidth: 0 }} />
              </div>
            ) : (
              <>
                <div style={{ fontSize: "26px", fontWeight: 700, color: C.white, letterSpacing: "-0.5px" }}>{income > 0 ? `$${fmt(income)}` : <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", fontWeight: 500 }}>Tap to set</span>}</div>
                <div className="edit-hint" style={{ position: "absolute", top: "14px", right: "14px", fontSize: "10px", background: "rgba(255,255,255,0.2)", color: C.white, padding: "2px 7px", borderRadius: "4px", letterSpacing: "1px", opacity: 0, transition: "opacity 0.2s" }}>EDIT</div>
              </>
            )}
          </div>
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
            <div style={{ fontSize: "11px", color: C.textLight, letterSpacing: "2px", marginBottom: "8px", fontWeight: 600 }}>SPENT</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: C.text }}>${fmt(totalSpent)}</div>
            <div style={{ fontSize: "12px", color: C.textLight, marginTop: "4px" }}>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ background: leftoverPositive ? C.greenLight : C.redLight, border: `1.5px solid ${leftoverPositive ? "#bbf7d0" : "#fecaca"}`, borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "11px", color: leftoverPositive ? C.green : C.red, letterSpacing: "2px", marginBottom: "8px", fontWeight: 600 }}>LEFTOVER</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: leftoverPositive ? C.green : C.red }}>{leftover < 0 ? "-" : ""}${fmt(leftover)}</div>
            {income > 0 && !leftoverPositive && <div style={{ fontSize: "11px", color: C.red, marginTop: "4px", fontWeight: 600 }}>OVER BUDGET</div>}
          </div>
        </div>

        {/* ── Spend bar ── */}
        {income > 0 && (
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }} className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: C.textMid, fontWeight: 600, letterSpacing: "1px" }}>INCOME USED</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green }}>{spendPct.toFixed(1)}%</span>
            </div>
            <div style={{ background: C.surfaceAlt, borderRadius: "6px", height: "8px", overflow: "hidden" }}>
              <div className="bar-fill" style={{ width: `${spendPct}%`, height: "100%", background: barColor, borderRadius: "6px" }} />
            </div>
          </div>
        )}

        {/* ── Tab switcher ── */}
        <div style={{ display: "flex", gap: "4px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "4px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
          {[["budget", "Budget"], ["transactions", "Transactions"]].map(([key, label]) => (
            <button key={key} className="tab-btn" onClick={() => setActiveTab(key)} style={{ flex: 1, background: activeTab === key ? C.blue : "transparent", border: "none", color: activeTab === key ? C.white : C.textMid, padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === key ? 700 : 500, transition: "all 0.15s" }}>{label}</button>
          ))}
        </div>

        {/* ══ BUDGET TAB ══ */}
        {activeTab === "budget" && (
          <div className="fade-up">
            <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "14px", fontWeight: 600 }}>BUDGET CATEGORIES</div>

            {data.categories.length > 0 && (
              <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
                {data.categories.map((cat, i) => {
                  const budget = parseFloat(cat.amount) || 0;
                  const spent = spentByCategory[cat.id] || 0;
                  const remaining = budget - spent;
                  const catPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                  const catBarColor = catPct > 90 ? C.red : catPct > 70 ? C.orange : C.blue;
                  const overBudget = remaining < 0;
                  const nearLimit = !overBudget && remaining < budget * 0.1;
                  const remainColor = overBudget ? C.red : nearLimit ? C.orange : C.green;
                  return (
                    <div key={cat.id} className="cat-row" style={{ padding: "14px 18px", background: i % 2 === 0 ? C.white : C.surfaceAlt, borderBottom: i < data.categories.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.15s", animation: `fadeUp 0.25s ease ${i * 0.04}s both` }}>
                      {editingId === cat.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input value={editVal.name} onChange={e => setEditVal(v => ({ ...v, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveEdit(cat.id)} style={{ ...iStyle, flex: 1, minWidth: 0 }} />
                          <span style={{ color: C.textLight }}>$</span>
                          <input type="number" value={editVal.amount} onChange={e => setEditVal(v => ({ ...v, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveEdit(cat.id)} style={{ ...iStyle, width: "90px" }} />
                          <button className="save-btn" onClick={() => saveEdit(cat.id)} style={{ background: C.greenLight, border: `1.5px solid ${C.green}`, color: C.green, padding: "8px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.15s", flexShrink: 0 }}>SAVE</button>
                          <button onClick={() => setEditingId(null)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "24px", padding: "0 4px", lineHeight: 1 }}>×</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <div style={{ flex: 1, minWidth: 0, fontSize: "15px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, flexShrink: 0 }}>${fmt(budget)}</div>
                            <button className="cat-add-btn" onClick={() => inlineCatId === cat.id ? closeInline() : openInline(cat.id)} title={`Add to ${cat.name}`} style={{ flexShrink: 0, background: inlineCatId === cat.id ? C.gold : C.goldLight, border: `1.5px solid ${inlineCatId === cat.id ? C.gold : "#f5d68a"}`, color: inlineCatId === cat.id ? C.white : C.goldDark, width: "28px", height: "28px", borderRadius: "7px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "all 0.15s" }}>{inlineCatId === cat.id ? "×" : "+"}</button>
                            <div className="row-actions" style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                              <button className="edit-lbl" onClick={() => startEdit(cat)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", padding: "5px 7px", transition: "color 0.15s" }}>EDIT</button>
                              <button className="del-btn" onClick={() => deleteCategory(cat.id)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "22px", padding: "0 4px", transition: "color 0.15s", lineHeight: 1 }}>×</button>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: C.textLight }}>spent <span style={{ color: C.textMid, fontWeight: 600 }}>${fmt(spent)}</span></span>
                            <span style={{ fontSize: "12px", color: remainColor, fontWeight: 700 }}>{remaining >= 0 ? `$${fmt(remaining)} left` : `$${fmt(Math.abs(remaining))} over`}</span>
                          </div>
                          <div style={{ background: C.border, borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                            <div className="mini-bar-fill" style={{ width: `${catPct}%`, height: "100%", background: catBarColor, borderRadius: "4px" }} />
                          </div>
                          {inlineCatId === cat.id && (
                            <div className="slide-down" style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                                <div style={{ position: "relative" }}>
                                  <input ref={inlineNameRef} placeholder="What was this for?" value={inlineTx.name} onChange={e => handleInlineNameChange(e.target.value)} onKeyDown={e => e.key === "Enter" && submitInline(cat.id)} style={iStyle} />
                                  {inlineAC.length > 0 && (
                                    <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 30, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                                      {inlineAC.map(name => <div key={name} className="ac-item" onClick={() => pickInlineAC(name)} style={{ padding: "10px 14px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>{name}</div>)}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 12px", flex: 1, gap: "5px" }}>
                                    <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                                    <input type="number" placeholder="0.00" value={inlineTx.amount} onChange={e => setInlineTx(v => ({ ...v, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitInline(cat.id)} style={{ background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "11px 0", width: "100%", minWidth: 0 }} />
                                  </div>
                                  <button onClick={() => submitInline(cat.id)} style={{ flexShrink: 0, background: C.gold, border: "none", color: C.white, padding: "11px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "opacity 0.15s" }} onMouseOver={e => e.currentTarget.style.opacity = "0.85"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>ADD</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "stretch", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
              <input placeholder="New category name" value={newCat.name} onChange={e => setNewCat(v => ({ ...v, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && addCategory()} style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "14px 16px" }} />
              <div style={{ display: "flex", alignItems: "center", borderLeft: `1px solid ${C.border}`, padding: "0 10px", flexShrink: 0, gap: "4px" }}>
                <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                <input type="number" placeholder="0.00" value={newCat.amount} onChange={e => setNewCat(v => ({ ...v, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && addCategory()} style={{ width: "76px", background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "14px 0" }} />
              </div>
              <button className="add-cat-btn" onClick={addCategory} style={{ flexShrink: 0, background: C.blueLight, border: "none", borderLeft: `1px solid ${C.border}`, color: C.blue, padding: "14px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap" }}>+ ADD</button>
            </div>

            {data.categories.length > 0 && (
              showQuickAdd ? (
                <div className="slide-down" style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "18px", boxShadow: "0 4px 16px rgba(30,80,212,0.1)" }}>
                  <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "12px", fontWeight: 600 }}>LOG TRANSACTION</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ position: "relative" }}>
                      <input ref={quickNameRef} placeholder="What was this for?" value={quickTx.name} onChange={e => handleQuickNameChange(e.target.value)} onKeyDown={e => e.key === "Enter" && submitQuickAdd()} style={iStyle} />
                      {quickAutocomplete.length > 0 && (
                        <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 20, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                          {quickAutocomplete.map(name => <div key={name} className="ac-item" onClick={() => pickQuickSuggestion(name)} style={{ padding: "11px 16px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>{name}</div>)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 12px", flex: 1, gap: "5px" }}>
                        <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                        <input type="number" placeholder="0.00" value={quickTx.amount} onChange={e => setQuickTx(v => ({ ...v, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitQuickAdd()} style={{ background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "12px 0", width: "100%", minWidth: 0 }} />
                      </div>
                      <select value={quickTx.categoryId} onChange={e => setQuickTx(v => ({ ...v, categoryId: e.target.value }))} style={{ ...selStyle, flex: 1 }}>
                        <option value="" disabled>Category</option>
                        {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="primary-btn" onClick={submitQuickAdd} style={{ flex: 1, background: C.blue, border: "none", color: C.white, padding: "13px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "background 0.15s" }}>ADD</button>
                      <button className="cancel-btn" onClick={() => { setShowQuickAdd(false); setQuickTx({ name: "", amount: "", categoryId: "" }); setQuickAutocomplete([]); }} style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.textMid, padding: "13px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.15s" }}>Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="log-btn" onClick={openQuickAdd} style={{ width: "100%", background: C.white, border: `1.5px dashed ${C.blueMid}`, color: C.blue, padding: "15px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.15s" }}>
                  + Log Transaction
                </button>
              )
            )}
            {data.categories.length === 0 && <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "32px 0" }}>No categories yet — add one above</div>}
          </div>
        )}

        {/* ══ TRANSACTIONS TAB ══ */}
        {activeTab === "transactions" && (
          <div className="fade-up">

            {/* ── Import from Excel button ── */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "stretch" }}>
              <button className="import-btn" onClick={() => fileInputRef.current?.click()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: C.white, border: `1.5px solid ${C.border}`, color: C.textMid, padding: "14px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.15s", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: C.text, fontWeight: 700 }}>Import from Excel</div>
                  <div style={{ fontSize: "12px", color: C.textLight, marginTop: "1px" }}>Upload your bank's .xlsx export</div>
                </div>
              </button>
            </div>
            {importError && <div style={{ background: C.redLight, border: `1px solid #fecaca`, borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: C.red, marginBottom: "14px", fontWeight: 500 }}>{importError}</div>}

            {/* Manual add */}
            {showTxForm ? (
              <div className="slide-down" style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(30,80,212,0.1)" }}>
                <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "16px", fontWeight: 600 }}>NEW TRANSACTION</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <input ref={nameInputRef} placeholder="What was this for?" value={newTx.name} onChange={e => handleNameChange(e.target.value)} onKeyDown={e => e.key === "Enter" && addTransaction()} style={iStyle} />
                    {autocomplete.length > 0 && (
                      <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 20, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                        {autocomplete.map(name => <div key={name} className="ac-item" onClick={() => pickSuggestion(name)} style={{ padding: "12px 16px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>{name}</div>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 14px", gap: "6px" }}>
                    <span style={{ color: C.textLight, fontWeight: 600, fontSize: "16px" }}>$</span>
                    <input type="number" placeholder="0.00" value={newTx.amount} onChange={e => setNewTx(v => ({ ...v, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTransaction()} style={{ background: "transparent", border: "none", color: C.text, fontSize: "16px", padding: "13px 0", width: "100%", minWidth: 0 }} />
                  </div>
                  <select value={newTx.categoryId} onChange={e => setNewTx(v => ({ ...v, categoryId: e.target.value }))} style={selStyle}>
                    <option value="" disabled>Select a category</option>
                    {data.categories.map(cat => {
                      const spent = spentByCategory[cat.id] || 0;
                      const budget = parseFloat(cat.amount) || 0;
                      return <option key={cat.id} value={cat.id}>{cat.name} (${fmt(budget - spent)} left)</option>;
                    })}
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="primary-btn" onClick={addTransaction} style={{ flex: 1, background: C.blue, border: "none", color: C.white, padding: "14px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "background 0.15s" }}>ADD TRANSACTION</button>
                    <button className="cancel-btn" onClick={closeTxForm} style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.textMid, padding: "14px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.15s" }}>Cancel</button>
                  </div>
                </div>
                {data.categories.length === 0 && <div style={{ marginTop: "12px", fontSize: "13px", color: C.orange, textAlign: "center", fontWeight: 500 }}>Add budget categories first.</div>}
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                <button className="log-btn" onClick={() => openTxForm()} style={{ width: "100%", background: C.white, border: `1.5px dashed ${C.blueMid}`, color: C.blue, padding: "16px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "block", transition: "all 0.15s" }}>
                  + Log Transaction Manually
                </button>
                {transactions.length === 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "12px 16px", background: C.goldLight, border: `1px solid #f5d68a`, borderRadius: "8px" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>👆</span>
                    <span style={{ fontSize: "13px", color: C.goldDark, fontWeight: 500, lineHeight: "1.5" }}>Import from Excel above or press this button to add manually.</span>
                  </div>
                )}
              </div>
            )}

            {/* Transaction list */}
            {transactions.length > 0 ? (
              <div style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
                {transactions.map((tx, i) => {
                  const cat = getCatById(tx.categoryId);
                  return (
                    <div key={tx.id} className="tx-row" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", background: i % 2 === 0 ? C.white : C.surfaceAlt, borderBottom: i < transactions.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.15s" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                          {cat ? <span style={{ fontSize: "11px", color: C.blue, background: C.blueLight, padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{cat.name}</span> : <span style={{ fontSize: "11px", color: C.textLight, background: C.surfaceAlt, padding: "2px 8px", borderRadius: "4px" }}>Uncategorized</span>}
                          <span style={{ fontSize: "11px", color: C.textLight }}>{tx.date}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: "15px", color: C.red, fontWeight: 700, flexShrink: 0 }}>−${fmt(parseFloat(tx.amount))}</div>
                      <div className="tx-actions" style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                        <button className="dupe-btn" onClick={() => duplicateTx(tx)} title="Repeat" style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "16px", padding: "4px 7px", borderRadius: "5px", transition: "all 0.15s", lineHeight: 1 }}>↻</button>
                        <button onClick={() => deleteTransaction(tx.id)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "22px", padding: "0 4px", lineHeight: 1, transition: "color 0.15s" }} onMouseOver={e => e.target.style.color = C.red} onMouseOut={e => e.target.style.color = C.textLight}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "40px 0" }}>No transactions yet this month</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
