import { useState } from "react";
import { C } from "../constants";

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: `1.5px solid ${C.border}`,
  fontSize: "14px",
  fontWeight: 500,
  color: C.text,
  background: C.surface,
  width: "100%",
  boxSizing: "border-box"
};

export default function DebtTab({ debts = [], onAddDebt, onDeleteDebt, formatCurrency }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    amount: "",
    date: "",
    rate: "",
    min: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    
    onAddDebt({
      ...newDebt,
      id: Date.now(),
    });
    
    setNewDebt({ name: "", amount: "", date: "", rate: "", min: "" });
    setShowAdd(false);
  };

  return (
    <div className="fade-up">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: C.textLight,
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          CURRENT DEBT
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: C.blueLight,
              border: "none",
              color: C.blue,
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            + Add Debt
          </button>
        )}
      </div>

      {showAdd && (
        <div
          className="slide-down"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: "0 4px 16px rgba(30,80,212,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "16px",
              color: C.text,
            }}
          >
            Add New Debt
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              <input
                placeholder="Debt Name (e.g. Credit Card)"
                value={newDebt.name}
                onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "0 12px",
                  gap: "5px",
                }}
              >
                <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  placeholder="Total Balance"
                  step="0.01"
                  value={newDebt.amount}
                  onChange={(e) => setNewDebt({ ...newDebt, amount: e.target.value })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "15px",
                    padding: "10px 0",
                    width: "100%",
                    minWidth: 0,
                  }}
                  required
                />
              </div>
              <input
                type="date"
                title="Current Payoff Date"
                value={newDebt.date}
                onChange={(e) => setNewDebt({ ...newDebt, date: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "0 12px",
                  gap: "5px",
                }}
              >
                <input
                  type="number"
                  placeholder="Interest Rate"
                  step="0.01"
                  value={newDebt.rate}
                  onChange={(e) => setNewDebt({ ...newDebt, rate: e.target.value })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "15px",
                    padding: "10px 0",
                    width: "100%",
                    minWidth: 0,
                  }}
                  required
                />
                <span style={{ color: C.textLight, fontWeight: 600 }}>%</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "0 12px",
                  gap: "5px",
                }}
              >
                <span style={{ color: C.textLight, fontWeight: 600 }}>$ min</span>
                <input
                  type="number"
                  placeholder="Min Payment"
                  step="0.01"
                  value={newDebt.min}
                  onChange={(e) => setNewDebt({ ...newDebt, min: e.target.value })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "15px",
                    padding: "10px 0",
                    width: "100%",
                    minWidth: 0,
                  }}
                  required
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: C.blue,
                  border: "none",
                  color: C.white,
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "background 0.15s",
                }}
              >
                Save Debt
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${C.border}`,
                  color: C.textMid,
                  padding: "12px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {debts.length === 0 && !showAdd && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: C.surface,
            border: `1.5px dashed ${C.border}`,
            borderRadius: "12px",
            color: C.textLight,
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: C.textMid }}>
            No debt tracked
          </div>
          <div style={{ fontSize: "14px" }}>
            Add your current debt to get AI payoff recommendations.
          </div>
        </div>
      )}

      {debts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {debts.map((debt) => (
            <div
              key={debt.id}
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                    {debt.name}
                  </div>
                  <div style={{ fontSize: "13px", color: C.textLight }}>
                    Est. Payoff: {debt.date ? new Date(debt.date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: C.text }}>
                  ${formatCurrency(debt.amount)}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "12px", background: C.surfaceAlt, padding: "10px", borderRadius: "8px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, textTransform: "uppercase" }}>Interest Rate</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{debt.rate}%</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, textTransform: "uppercase" }}>Min Payment</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>${formatCurrency(debt.min)}</div>
                </div>
              </div>
              
              <div style={{ marginTop: "auto", borderTop: `1px solid ${C.borderLight || C.border}`, paddingTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                 <button
                   onClick={() => onDeleteDebt(debt.id)}
                   style={{
                     background: "transparent",
                     border: "none",
                     color: C.red,
                     fontSize: "13px",
                     fontWeight: 600,
                     cursor: "pointer",
                     padding: "4px",
                   }}
                 >
                   Delete
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
