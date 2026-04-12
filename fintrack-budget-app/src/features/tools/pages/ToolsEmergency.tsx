import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../../app/constants";

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
          You'll leave the emergency fund builder. Are you sure you want to go back?
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

export default function ToolsEmergency() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const [monthlySpend, setMonthlySpend] = useState("");
  const [targetMonths, setTargetMonths] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const toNumber = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const goal = toNumber(monthlySpend) * toNumber(targetMonths);
  const gap = Math.max(goal - toNumber(currentSavings), 0);
  const monthsToGoal = toNumber(monthlyContribution) > 0 ? Math.ceil(gap / toNumber(monthlyContribution)) : Infinity;
  const progressPct = goal > 0 ? Math.min(100, Math.round((toNumber(currentSavings) / goal) * 100)) : 0;

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
        <div style={{ fontSize: "22px", fontWeight: 800, color: C.text }}>Emergency Fund Builder</div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Inputs</div>
          <LabelNumber label="Avg monthly spend" value={monthlySpend} onChange={setMonthlySpend} />
          <LabelNumber label="Target months of cushion" value={targetMonths} onChange={setTargetMonths} />
          <LabelNumber label="Current savings" value={currentSavings} onChange={setCurrentSavings} />
          <LabelNumber label="Monthly contribution" value={monthlyContribution} onChange={setMonthlyContribution} />
        </div>

        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Plan</div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: C.text }}>
            Goal: {formatMoney(goal)}
          </div>
          <div style={{ fontSize: "14px", color: C.textMid, lineHeight: 1.5 }}>
            You're {progressPct}% there. Keep saving {formatMoney(monthlyContribution)} monthly to hit {targetMonths} months of expenses.
          </div>

          <div style={{ background: C.surfaceAlt, borderRadius: "12px", padding: "12px", border: `1.5px solid ${C.border}` }}>
            <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Months to goal</div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: C.text }}>
              {monthsToGoal === Infinity ? "Add a monthly amount" : `${monthsToGoal} month${monthsToGoal === 1 ? "" : "s"}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700, marginBottom: "6px" }}>Progress</div>
            <div style={{ height: "12px", background: C.surfaceAlt, borderRadius: "999px", overflow: "hidden", border: `1.5px solid ${C.border}` }}>
              <div style={{
                width: `${progressPct}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${C.gold} 0%, ${C.blue} 100%)`,
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ marginTop: "6px", fontSize: "12px", color: C.textMid, display: "flex", justifyContent: "space-between" }}>
              <span>{formatMoney(currentSavings)} saved</span>
              <span>{formatMoney(goal)} goal</span>
            </div>
          </div>

          <div style={{
            background: C.surfaceAlt,
            borderRadius: "12px",
            padding: "12px",
            border: `1.5px solid ${C.border}`,
          }}>
            <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Quick actions</div>
            <ul style={{ paddingLeft: "18px", marginTop: "6px", color: C.textMid, lineHeight: 1.5, fontSize: "13px" }}>
              <li>Automate the monthly transfer on payday.</li>
              <li>Park funds in a high-yield savings to earn risk-free interest.</li>
              <li>Revisit the target if your expenses change.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelNumber({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder="0"
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange("");
          if (!/^\d*\.?\d*$/.test(v)) return;
          onChange(v.replace(/^0+(\d)/, "$1"));
        }}
        onFocus={(e) => value === "0" && e.target.select()}
        style={{
          padding: "10px",
          borderRadius: "10px",
          border: `1.5px solid ${C.border}`,
          fontWeight: 700,
          color: C.text,
          background: C.surface,
        }}
      />
    </label>
  );
}
