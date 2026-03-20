import { C } from "../constants";

export default function SpendProgress({ income, spendPct, barColor }) {
  if (income <= 0) return null;

  return (
    <div
      style={{
        background: C.white,
        border: `1.5px solid ${C.border}`,
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
      }}
      className="fade-up"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: C.textMid,
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          INCOME USED
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green,
          }}
        >
          {spendPct.toFixed(1)}%
        </span>
      </div>
      <div
        style={{
          background: C.surfaceAlt,
          borderRadius: "6px",
          height: "8px",
          overflow: "hidden",
        }}
      >
        <div
          className="bar-fill"
          style={{
            width: `${spendPct}%`,
            height: "100%",
            background: barColor,
            borderRadius: "6px",
          }}
        />
      </div>
    </div>
  );
}
