import { C } from "../../../app/constants";

export default function SpendProgress({ income, spendPct, barColor }) {
  if (income <= 0) return null;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(spendPct, 100);
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  return (
    <div
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      className="fade-up"
    >
      <span
        style={{
          fontSize: "18px",
          color: C.textMid,
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        INCOME USED
      </span>

      <div style={{ position: "relative", width: "56px", height: "56px", flexShrink: 0 }}>
        <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke={C.surfaceAlt}
            strokeWidth="5"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke={barColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          color: spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green,
        }}>
          {Math.round(spendPct)}%
        </div>
      </div>
    </div>
  );
}
