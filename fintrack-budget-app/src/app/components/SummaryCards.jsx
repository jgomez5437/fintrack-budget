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
  mostMoneySpentCategory,
  onStartIncomeEdit,
  onIncomeInputChange,
  onSaveIncome,
  onCancelIncomeEdit,
  totalPlanned,
  totalSpent,
  transactionCount,
  formatCurrency,
}) {
  const neutralCardStyle = {
    background: C.white,
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
          MOST MONEY SPENT
        </div>
        <div
          style={{
            fontSize: mostMoneySpentCategory ? "24px" : "18px",
            fontWeight: 700,
            color: mostMoneySpentCategory ? C.text : C.textMid,
            letterSpacing: "-0.3px",
            lineHeight: 1.15,
          }}
        >
          {mostMoneySpentCategory || "None yet"}
        </div>
        <div style={{ fontSize: "12px", color: C.textLight, marginTop: "4px" }}>
          Category
        </div>
      </div>
    </div>
  );
}
