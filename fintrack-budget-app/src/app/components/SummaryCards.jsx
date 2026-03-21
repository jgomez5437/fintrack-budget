import { C } from "../constants";

export default function SummaryCards({
  editingIncome,
  expectedSurplus,
  expectedSurplusPositive,
  income,
  incomeInput,
  incomeRef,
  leftover,
  leftoverPositive,
  onStartIncomeEdit,
  onIncomeInputChange,
  onSaveIncome,
  onCancelIncomeEdit,
  projectedMonthEndSpent,
  totalPlanned,
  totalSpent,
  transactionCount,
  formatCurrency,
  spendPct,
  barColor,
  currentSavings,
  editingSavings,
  savingsInput,
  savingsRef,
  onStartSavingsEdit,
  onSavingsInputChange,
  onSaveSavings,
  onCancelSavingsEdit,
}) {
  const neutralCardStyle = {
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "24px",
      }}
      className="fade-up"
    >
      <div
        className="income-card"
        onClick={!editingIncome ? onStartIncomeEdit : undefined}
        style={{
          background: C.blue,
          borderRadius: "14px",
          padding: "20px",
          cursor: editingIncome ? "default" : "pointer",
          position: "relative",
          transition: "box-shadow 0.2s",
          border: `1.5px solid ${C.blue}`,
          boxShadow: "0 4px 16px rgba(30,80,212,0.2)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          INCOME
        </div>
        {editingIncome ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: C.gold, fontSize: "20px", fontWeight: 700 }}>
              $
            </span>
            <input
              ref={incomeRef}
              type="number"
              value={incomeInput}
              onChange={(event) => onIncomeInputChange(event.target.value)}
              onBlur={onSaveIncome}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSaveIncome();
                if (event.key === "Escape") onCancelIncomeEdit();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: C.white,
                fontSize: "26px",
                fontWeight: 700,
                width: "100%",
                minWidth: 0,
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: C.white,
                letterSpacing: "-0.5px",
              }}
            >
              {income > 0 ? (
                `$${formatCurrency(income)}`
              ) : (
                <span
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  Tap to set
                </span>
              )}
            </div>
            <div
              className="edit-hint"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                fontSize: "10px",
                background: "rgba(255,255,255,0.2)",
                color: C.white,
                padding: "2px 7px",
                borderRadius: "4px",
                letterSpacing: "1px",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              EDIT
            </div>
          </>
        )}
      </div>

      <div
        style={neutralCardStyle}
      >
        <div
          style={{
            fontSize: "11px",
            color: C.textLight,
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          PLANNED
        </div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: C.text }}>
          ${formatCurrency(totalPlanned)}
        </div>
        <div style={{ fontSize: "12px", color: C.textLight, marginTop: "4px" }}>
          {totalPlanned > 0 ? "Total budgeted" : "No categories yet"}
        </div>
      </div>

      <div
        style={neutralCardStyle}
      >
        <div
          style={{
            fontSize: "11px",
            color: C.textLight,
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          SPENT
        </div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: C.text }}>
          ${formatCurrency(totalSpent)}
        </div>
        <div style={{ fontSize: "12px", color: C.textLight, marginTop: "4px" }}>
          {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div
        style={{
          background: expectedSurplusPositive ? C.greenLight : C.redLight,
          border: `1.5px solid ${expectedSurplusPositive ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: expectedSurplusPositive ? C.green : C.red,
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          EXPECTED SURPLUS
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: expectedSurplusPositive ? C.green : C.red,
          }}
        >
          {expectedSurplus < 0 ? "-" : ""}${formatCurrency(expectedSurplus)}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: expectedSurplusPositive ? C.green : C.red,
            marginTop: "4px",
          }}
        >
          Income - Spent
        </div>
      </div>

      <div
        style={{
          background: leftoverPositive ? C.greenLight : C.redLight,
          border: `1.5px solid ${leftoverPositive ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: leftoverPositive ? C.green : C.red,
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          LEFTOVER
        </div>
        <div
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: leftoverPositive ? C.green : C.red,
          }}
        >
          {leftover < 0 ? "-" : ""}${formatCurrency(leftover)}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: leftoverPositive ? C.green : C.red,
            marginTop: "4px",
          }}
        >
          Planned - Spent
        </div>
        {totalPlanned > 0 && !leftoverPositive && (
          <div
            style={{
              fontSize: "11px",
              color: C.red,
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            OVER BUDGET
          </div>
        )}
      </div>

      <div
        style={neutralCardStyle}
      >
        <div
          style={{
            fontSize: "11px",
            color: C.textLight,
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          PROJECTED END-OF-MONTH
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.3px",
            lineHeight: 1.15,
          }}
        >
          ${formatCurrency(projectedMonthEndSpent)}
        </div>
        <div style={{ fontSize: "11px", color: C.textLight, marginTop: "6px" }}>
          ${formatCurrency(totalSpent)} spent so far
        </div>
      </div>

      <div
        style={{
          ...neutralCardStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: C.textMid,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          INCOME USED
        </span>

        <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
          <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="24" cy="24" r="20" fill="none" stroke={C.surfaceAlt} strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke={barColor} strokeWidth="4"
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={(2 * Math.PI * 20) - (Math.min(spendPct, 100) / 100) * (2 * Math.PI * 20)}
              style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
            />
          </svg>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700,
            color: spendPct > 90 ? C.red : spendPct > 70 ? C.orange : C.green,
          }}>
            {Math.round(spendPct)}%
          </div>
        </div>
      </div>

      <div
        className="savings-card"
        onClick={!editingSavings ? onStartSavingsEdit : undefined}
        style={{
          background: C.blue,
          borderRadius: "14px",
          padding: "20px",
          cursor: editingSavings ? "default" : "pointer",
          position: "relative",
          transition: "box-shadow 0.2s",
          border: `1.5px solid ${C.blue}`,
          boxShadow: "0 4px 16px rgba(30,80,212,0.2)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "2px",
            marginBottom: "8px",
            fontWeight: 700,
          }}
        >
          CURRENT SAVINGS
        </div>
        {editingSavings ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: C.gold, fontSize: "20px", fontWeight: 700 }}>$</span>
            <input
              ref={savingsRef}
              type="number"
              value={savingsInput}
              onChange={(event) => onSavingsInputChange(event.target.value)}
              onBlur={onSaveSavings}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSaveSavings();
                if (event.key === "Escape") onCancelSavingsEdit();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: C.white,
                fontSize: "26px",
                fontWeight: 700,
                width: "100%",
                minWidth: 0,
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: C.white,
                letterSpacing: "-0.5px",
              }}
            >
              {currentSavings && currentSavings !== "" && parseFloat(currentSavings) > 0 ? (
                `$${formatCurrency(currentSavings)}`
              ) : (
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  Tap to set
                </span>
              )}
            </div>
            <div
              className="edit-hint"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                fontSize: "10px",
                background: "rgba(255,255,255,0.2)",
                color: C.white,
                padding: "2px 7px",
                borderRadius: "4px",
                letterSpacing: "1px",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
            >
              EDIT
            </div>
          </>
        )}
      </div>

    </div>
  );
}
