import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";

function ConfirmBackModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,28,77,0.36)",
      display: "grid",
      placeItems: "center",
      zIndex: 2000,
      padding: "16px",
    }}>
      <div style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: "18px",
        padding: "20px",
        maxWidth: "360px",
        width: "100%",
        boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>
          Go back to Tools?
        </div>
        <div style={{ fontSize: "14px", color: C.textMid, lineHeight: 1.5, marginBottom: "16px" }}>
          You'll leave the debt payoff tool. Are you sure you want to go back?
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              color: C.textMid,
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Stay here
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: C.blue,
              border: "none",
              color: C.white,
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Yes, go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ToolsDebt() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const [debts, setDebts] = useState([
    { name: "", balance: "", rate: "", min: "" },
  ]);
  const [extra, setExtra] = useState("");
  const [strategy, setStrategy] = useState("snowball");

  const simulation = useMemo(() => simulate(debts, extra, strategy), [debts, extra, strategy]);

  const updateDebt = (idx, field, value) => {
    setDebts((curr) => curr.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  };

  const addDebt = () => setDebts((curr) => [...curr, { name: "", balance: "", rate: "", min: "" }]);
  const removeDebt = (idx) => setDebts((curr) => curr.filter((_, i) => i !== idx));

  const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <ConfirmBackModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => navigate("/tools")}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            border: `1.5px solid ${C.border}`,
            background: C.surface,
            color: C.text,
            padding: "10px 14px",
            borderRadius: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Back to Tools
        </button>
        <div style={{ fontSize: "22px", fontWeight: 800, color: C.text }}>Debt Payoff</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "start" }}>
        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, color: C.text }}>Your debts</div>
            <button
              onClick={addDebt}
              style={{
                background: C.blue,
                color: C.white,
                border: "none",
                padding: "8px 12px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Add
            </button>
          </div>

          {debts.map((debt, idx) => (
            <div key={idx} style={{ border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "12px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr)) 40px", gap: "10px", alignItems: "end" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: C.textLight, fontWeight: 700 }}>Name</span>
                <input value={debt.name} onChange={(e) => updateDebt(idx, "name", e.target.value)} style={inputStyle} />
              </label>
              <LabelNumber label="Balance" value={debt.balance} onChange={(v) => updateDebt(idx, "balance", v)} />
              <LabelNumber label="Rate %" value={debt.rate} onChange={(v) => updateDebt(idx, "rate", v)} step="0.1" />
              <LabelNumber label="Min / mo" value={debt.min} onChange={(v) => updateDebt(idx, "min", v)} />
              <button
                onClick={() => removeDebt(idx)}
                style={{
                  border: `1.5px solid ${C.border}`,
                  background: C.surfaceAlt,
                  color: C.red,
                  borderRadius: "10px",
                  padding: "8px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
                aria-label="Remove debt"
              >
                ×
              </button>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "6px" }}>
            <LabelNumber label="Extra to throw at debt / mo" value={extra} onChange={setExtra} />
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: C.textLight, fontWeight: 700 }}>Strategy</span>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: `1.5px solid ${C.border}`,
                  fontWeight: 700,
                  color: C.text,
                  background: C.surface,
                }}
              >
                <option value="snowball">Snowball (smallest balance first)</option>
                <option value="avalanche">Avalanche (highest rate first)</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Timeline</div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: C.text }}>
            {simulation.months === Infinity ? "—" : `${simulation.months} months`}
          </div>
          <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5 }}>
            Total interest: <strong style={{ color: C.red }}>{formatMoney(simulation.interest)}</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            {simulation.payoffOrder.map((item, idx) => (
              <div key={idx} style={{
                border: `1.5px solid ${C.border}`,
                borderRadius: "10px",
                padding: "10px",
                background: C.surfaceAlt,
              }}>
                <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>#{idx + 1} {item.name}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: C.text }}>{item.month} mo</div>
              </div>
            ))}
          </div>

          <div style={{
            background: C.surfaceAlt,
            borderRadius: "12px",
            padding: "12px",
            border: `1.5px solid ${C.border}`,
            marginTop: "6px",
          }}>
            <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Quick tips</div>
            <ul style={{ paddingLeft: "18px", marginTop: "6px", color: C.textMid, lineHeight: 1.5, fontSize: "13px" }}>
              <li>Snowball boosts motivation; Avalanche minimizes interest.</li>
              <li>Apply windfalls to the current focus debt for fastest payoff.</li>
              <li>Keep minimums paid on every debt to avoid fees.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelNumber({ label, value, onChange, step = "1" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "11px", color: C.textLight, fontWeight: 700 }}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder="0"
        step={step}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange("");
          if (!/^\d*\.?\d*$/.test(v)) return;
          onChange(v.replace(/^0+(\d)/, "$1"));
        }}
        onFocus={(e) => value === "0" && e.target.select()}
        style={inputStyle}
      />
    </label>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "10px",
  border: `1.5px solid ${C.border}`,
  fontWeight: 700,
  color: C.text,
  background: C.surface,
};

function simulate(debts, extra, strategy) {
  const cloned = debts
    .filter((d) => parseFloat(d.balance) > 0)
    .map((d, idx) => ({
      id: idx,
      name: d.name || `Debt ${idx + 1}`,
      balance: Number(d.balance) || 0,
      rate: Number(d.rate) || 0,
      min: Math.max(Number(d.min) || 0, 0),
    }));

  if (cloned.length === 0) return { months: 0, interest: 0, payoffOrder: [] };

  let month = 0;
  let interestPaid = 0;
  const payoffOrder = [];
  const maxMonths = 1200;

  while (cloned.some((d) => d.balance > 0) && month < maxMonths) {
    month += 1;

    // Apply interest
    cloned.forEach((d) => {
      if (d.balance <= 0) return;
      const interest = d.balance * (d.rate / 100 / 12);
      d.balance += interest;
      interestPaid += interest;
    });

    // Minimums
    cloned.forEach((d) => {
      if (d.balance <= 0) return;
      const pay = Math.min(d.min, d.balance);
      d.balance -= pay;
    });

    // Choose focus debt
    const remaining = cloned.filter((d) => d.balance > 0);
    if (remaining.length === 0) break;

    const target = [...remaining].sort((a, b) => {
      if (strategy === "snowball") return a.balance - b.balance;
      return b.rate - a.rate;
    })[0];

    let extraToUse = Number(extra) || 0;
    let focus = target;
    while (extraToUse > 0 && remaining.some((d) => d.balance > 0)) {
      const payAmount = Math.min(extraToUse, focus.balance);
      focus.balance -= payAmount;
      extraToUse -= payAmount;
      if (focus.balance <= 0.01) {
        const nextRemaining = cloned.filter((d) => d.balance > 0);
        if (nextRemaining.length === 0) break;
        focus = [...nextRemaining].sort((a, b) => {
          if (strategy === "snowball") return a.balance - b.balance;
          return b.rate - a.rate;
        })[0];
      }
    }

    // Capture payoffs
    cloned.forEach((d) => {
      if (d.balance <= 0 && !payoffOrder.some((p) => p.id === d.id)) {
        payoffOrder.push({ id: d.id, name: d.name, month });
        d.balance = 0;
      }
    });
  }

  const months = month >= maxMonths ? Infinity : month;

  return {
    months,
    interest: interestPaid,
    payoffOrder,
  };
}
