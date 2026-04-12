import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../../app/constants";

function ConfirmBackModal({ open, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div 
      onClick={onCancel}
      style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,28,77,0.36)",
      display: "grid",
      placeItems: "center",
      zIndex: 2000,
      padding: "16px",
    }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
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
          You'll leave the retirement/savings calculator. Are you sure you want to go back?
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

export default function ToolsRetirement() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentBalance, setCurrentBalance] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState("");

  const num = (val) => {
    const n = parseFloat(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const projection = useMemo(() => {
    const monthlyRate = (num(annualReturn) / 100) / 12;
    const months = Math.max(0, Math.round(num(years) * 12));
    const points = [];
    let balance = num(currentBalance);
    let totalContribution = num(currentBalance);
    for (let m = 0; m <= months; m += 12) {
      const yearlyMonths = m === months ? months - (points.length ? points[points.length - 1].month : 0) : 12;
      // compound monthly in the loop for accuracy
      const startMonth = points.length ? points[points.length - 1].month : 0;
      for (let i = startMonth; i < startMonth + yearlyMonths; i++) {
        balance = balance * (1 + monthlyRate) + num(monthlyContribution);
        totalContribution += num(monthlyContribution);
      }
      points.push({ month: m, balance });
    }
    return {
      points,
      finalBalance: balance,
      totalContribution,
      totalGrowth: balance - totalContribution,
    };
  }, [annualReturn, years, currentBalance, monthlyContribution]);

  const formatMoney = (val, opts = {}) =>
    `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: opts.decimals ?? 0, maximumFractionDigits: opts.decimals ?? 0 })}`;

  const chartWidth = 560;
  const chartHeight = 220;
  const maxBalance = Math.max(...projection.points.map((p) => p.balance), 1);
  const yearsNum = num(years);
  const linePoints = projection.points.map((p, idx) => {
    const x = (p.month / (yearsNum * 12 || 1)) * chartWidth;
    const y = chartHeight - (p.balance / maxBalance) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  const barCount = Math.min(10, projection.points.length);
  const barStep = Math.max(1, Math.floor((projection.points.length - 1) / (barCount - 1)));
  const barData = projection.points.filter((_, idx) => idx % barStep === 0);

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
        <div style={{ fontSize: "22px", fontWeight: 800, color: C.text }}>Retirement / Savings Growth</div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Your inputs</div>

          <LabelInput label="Current balance" value={currentBalance} onChange={setCurrentBalance} />
          <LabelInput label="Monthly contribution" value={monthlyContribution} onChange={setMonthlyContribution} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <LabelInput label="Annual return (%)" value={annualReturn} onChange={setAnnualReturn} step="0.1" />
            <LabelInput label="Years to grow" value={years} onChange={setYears} />
          </div>
        </div>

        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Outcome</div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: C.text }}>
            {formatMoney(projection.finalBalance, { decimals: 0 })}
          </div>
          <div style={{ fontSize: "14px", color: C.textMid }}>
            If you save this much now, it'll grow to <strong style={{ color: C.green }}>{formatMoney(projection.finalBalance, { decimals: 0 })}</strong> in {yearsNum || 0} years.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginTop: "8px" }}>
            <StatBox label="Total contributed" value={formatMoney(projection.totalContribution, { decimals: 0 })} color={C.blue} />
            <StatBox label="Growth earned" value={formatMoney(projection.totalGrowth, { decimals: 0 })} color={C.green} />
          </div>

          <div style={{ marginTop: "8px" }}>
            <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700, marginBottom: "6px" }}>Growth over time</div>
            <div style={{ border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "12px", background: C.surfaceAlt }}>
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={`${C.green}`} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#areaFill)"
                  stroke="none"
                  points={`0,${chartHeight} ${linePoints} ${chartWidth},${chartHeight}`}
                />
                <polyline
                  fill="none"
                  stroke={C.green}
                  strokeWidth="3"
                  points={linePoints}
                />
                {barData.map((p, idx) => {
                  const x = (p.month / (years * 12 || 1)) * chartWidth;
                  const y = chartHeight - (p.balance / maxBalance) * chartHeight;
                  const barWidth = chartWidth / Math.max(barCount * 1.1, 1);
                  return (
                    <rect
                      key={idx}
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={chartHeight - y}
                      fill={`${C.green}40`}
                      stroke="none"
                      rx="4"
                    />
                  );
                })}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.textLight, marginTop: "6px" }}>
                <span>Today</span>
                <span>{yearsNum || 0} yrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelInput({ label, value, onChange, step = "1" }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>{label}</span>
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
        onFocus={(e) => e.target.select()}
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

function StatBox({ label, value, color }) {
  return (
    <div style={{
      border: `1.5px solid ${C.border}`,
      borderRadius: "12px",
      padding: "10px",
      background: C.surface,
    }}>
      <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
