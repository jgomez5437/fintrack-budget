import { createPortal } from "react-dom";
import { useEffect } from "react";
import { C } from "../../constants";

function calculatePayoff(debts) {
  let maxMonths = 0;
  let infinity = false;

  const debtInfos = debts.map((d) => ({
    amount: parseFloat(d.amount) || 0,
    rate: d.isCreditCard ? (Math.pow(1 + (parseFloat(d.rate) || 0) / 100 / 365, 30.416) - 1) : ((parseFloat(d.rate) || 0) / 100 / 12),
    min: parseFloat(d.min) || 0,
    name: d.name,
  }));

  for (let d of debtInfos) {
    if (d.amount <= 0) continue;
    let months = 0;
    let amt = d.amount;
    while (amt > 0 && months < 1200) {
      let interest = amt * d.rate;
      let principalPaid = d.min - interest;
      if (principalPaid <= 0) {
        infinity = true;
        months = Infinity;
        break;
      }
      amt -= principalPaid;
      months++;
    }
    if (months > maxMonths) maxMonths = months;
  }

  if (infinity || maxMonths === 0) {
    return { months: infinity ? Infinity : 0, years: 0, date: null };
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + maxMonths);
  return {
    months: maxMonths,
    years: (maxMonths / 12).toFixed(1),
    date: payoffDate,
  };
}

export default function DebtDashboardModal({ debts, formatCurrency, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const total = debts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const payoff = calculatePayoff(debts);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  const colors = [
    C.blue,
    C.red,
    C.green,
    "#FF9800",
    "#9C27B0",
    "#00BCD4",
    "#E91E63",
    "#3F51B5",
    "#009688",
    "#FFEB3B",
  ];

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,77,0.5)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        zIndex: 50,
      }}
    >
      <div
        className="slide-down"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "460px",
          background: C.surface,
          borderRadius: "24px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 70px rgba(15,28,77,0.18)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: C.text, fontWeight: 800 }}>
            Debt Dashboard
          </h2>
          <div style={{ fontSize: "14px", color: C.textMid, marginTop: "4px" }}>
            A comprehensive overview of your active debts.
          </div>
        </div>

        {total > 0 ? (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: "220px",
                  height: "220px",
                  margin: "0 auto",
                }}
              >
                <svg
                  width="220"
                  height="220"
                  viewBox="0 0 100 100"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {debts.map((d, i) => {
                    const amt = parseFloat(d.amount) || 0;
                    if (amt <= 0) return null;
                    const percent = amt / total;
                    const strokeLength = percent * circumference;
                    const offset = -(accumulated / total) * circumference;
                    accumulated += amt;

                    return (
                      <circle
                        key={d.id || i}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={colors[i % colors.length]}
                        strokeWidth="10"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={offset}
                        style={{ transition: "all 0.5s ease" }}
                      />
                    );
                  })}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: C.textLight,
                      fontWeight: 700,
                      letterSpacing: "1px",
                    }}
                  >
                    TOTAL DEBT
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: C.text }}>
                    ${formatCurrency(total)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {debts.map((d, i) => {
                if (parseFloat(d.amount) <= 0) return null;
                return (
                  <div key={d.id || i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: colors[i % colors.length],
                      }}
                    />
                    <div style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: C.text }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                      ${formatCurrency(parseFloat(d.amount))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                background: C.blueLight,
                border: `1px solid ${C.blue}`,
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "14px", color: C.blue, fontWeight: 700, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Payoff Projection
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: C.blue, fontWeight: 600, textTransform: "uppercase" }}>
                    Years to Payoff
                  </div>
                  <div style={{ fontSize: "24px", color: C.blue, fontWeight: 800, marginTop: "4px" }}>
                    {payoff.months === Infinity ? "Never" : payoff.years}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: C.blue, fontWeight: 600, textTransform: "uppercase" }}>
                    Debt Free Date
                  </div>
                  <div style={{ fontSize: "18px", color: C.blue, fontWeight: 800, marginTop: "8px" }}>
                    {payoff.date ? payoff.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "N/A"}
                  </div>
                </div>
              </div>
              {payoff.months === Infinity && (
                <div style={{ marginTop: "12px", fontSize: "12px", color: C.red, fontWeight: 600 }}>
                  Warning: Minimum payments do not cover interest on one or more loans.
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: C.textMid, fontWeight: 500 }}>
            No debt recorded. You are debt free! 🎉
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            border: "none",
            borderRadius: "16px",
            padding: "16px",
            background: C.surfaceAlt,
            color: C.text,
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
            transition: "all 0.15s",
          }}
        >
          Close Dashboard
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
