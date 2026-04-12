import { useState } from "react";
import { C } from "../../constants";
import DebtDashboardModal from "../modals/DebtDashboardModal";

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

export default function DebtTab({ debts = [], onAddDebt, onEditDebt, onDeleteDebt, formatCurrency, onToggleAutopay }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [newDebt, setNewDebt] = useState({
    name: "",
    amount: "",
    payoffDate: "",
    rate: "",
    min: "",
    autopay: false,
    dueDay: "",
    isCreditCard: true,
  });

  const startEdit = (debt) => {
    setNewDebt({ ...debt });
    setEditingDebtId(debt.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingDebtId(null);
    setNewDebt({ name: "", amount: "", payoffDate: "", rate: "", min: "", autopay: false, dueDay: "", isCreditCard: true });
    setShowAdd(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    
    let finalPayoffDate = newDebt.payoffDate;
    if (!finalPayoffDate) {
      let amt = parseFloat(newDebt.amount);
      let min = parseFloat(newDebt.min);
      let apr = parseFloat(newDebt.rate) || 0;
      let months = 0;
      let isCC = newDebt.isCreditCard;
      while(amt > 0 && months < 1200) {
        let rate = isCC ? (Math.pow(1 + apr/100/365, 30.416) - 1) : (apr/100/12);
        let interest = amt * rate;
        let p = min - interest;
        if(p <= 0) break;
        amt -= p;
        months++;
      }
      if (months > 0 && months < 1200) {
        let d = new Date();
        d.setMonth(d.getMonth() + months);
        finalPayoffDate = d.toISOString().split('T')[0];
      }
    }

    if (editingDebtId) {
      onEditDebt({
        ...newDebt,
        payoffDate: finalPayoffDate || "",
        id: editingDebtId,
      });
      setEditingDebtId(null);
    } else {
      onAddDebt({
        ...newDebt,
        payoffDate: finalPayoffDate || "",
        lastAutopayDate: new Date().toISOString().split('T')[0],
        id: Date.now(),
      });
    }
    
    setNewDebt({ name: "", amount: "", payoffDate: "", rate: "", min: "", autopay: false, dueDay: "", isCreditCard: true });
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
        <div style={{ display: "flex", gap: "8px" }}>
          {debts.length > 0 && !showAdd && (
            <button
              onClick={() => setShowDashboard(true)}
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.text,
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Dashboard
            </button>
          )}
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
            {editingDebtId ? "Edit Debt" : "Add New Debt"}
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
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.textLight, textTransform: "uppercase", marginBottom: "6px" }}>Interest Rate {!newDebt.isCreditCard && "(Optional)"}</div>
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
                    placeholder="Rate"
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
                    required={newDebt.isCreditCard}
                  />
                  <span style={{ color: C.textLight, fontWeight: 600 }}>%</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.textLight, textTransform: "uppercase", marginBottom: "6px" }}>Min Payment</div>
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
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surfaceAlt, padding: "12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>Credit Card / Daily Compound</div>
                <div style={{ fontSize: "11px", color: C.textMid }}>If off, evaluates as Simple Interest (Car Loan)</div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={newDebt.isCreditCard}
                  onChange={(e) => setNewDebt({ ...newDebt, isCreditCard: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: newDebt.isCreditCard ? C.blue : C.border, transition: ".4s", borderRadius: "24px",
                }}>
                  <span style={{
                    position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px",
                    backgroundColor: "white", transition: ".4s", borderRadius: "50%",
                    transform: newDebt.isCreditCard ? "translateX(18px)" : "translateX(0)",
                  }}></span>
                </span>
              </label>
            </div>

            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.textLight, textTransform: "uppercase", marginBottom: "6px" }}>Expected Payoff Date (Leave blank to auto-calculate)</div>
              <input
                type="date"
                title="Leave blank to auto-calculate"
                value={newDebt.payoffDate}
                onChange={(e) => setNewDebt({ ...newDebt, payoffDate: e.target.value })}
                style={inputStyle}
              />
            </div>
            
            <div style={{ padding: "12px", border: `1.5px solid ${C.border}`, borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                    Autopay
                  </div>
                  <div style={{ fontSize: "12px", color: C.textMid, marginTop: "2px" }}>
                    Automatically decrement balance on due date
                  </div>
                </div>
                
                <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                  <input
                    type="checkbox"
                    checked={newDebt.autopay}
                    onChange={(e) => setNewDebt({ ...newDebt, autopay: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: newDebt.autopay ? C.blue : C.border,
                    transition: ".4s",
                    borderRadius: "24px",
                  }}>
                    <span style={{
                      position: "absolute",
                      content: '""',
                      height: "18px",
                      width: "18px",
                      left: "3px",
                      bottom: "3px",
                      backgroundColor: "white",
                      transition: ".4s",
                      borderRadius: "50%",
                      transform: newDebt.autopay ? "translateX(18px)" : "translateX(0)",
                    }}></span>
                  </span>
                </label>
              </div>
              {newDebt.autopay && (
                 <div>
                   <div style={{ fontSize: "11px", fontWeight: 700, color: C.textLight, textTransform: "uppercase", marginBottom: "6px" }}>Due Date (Day 1-31)</div>
                   <input
                     type="number"
                     min="1"
                     max="31"
                     placeholder="e.g. 15"
                     value={newDebt.dueDay}
                     onChange={(e) => setNewDebt({ ...newDebt, dueDay: e.target.value })}
                     style={inputStyle}
                     required
                   />
                 </div>
              )}
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
                {editingDebtId ? "Update Debt" : "Save Debt"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
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
                    Est. Payoff: {debt.payoffDate ? new Date(debt.payoffDate).toLocaleDateString() : (debt.date ? new Date(debt.date).toLocaleDateString() : 'N/A')}
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: C.text }}>
                  ${formatCurrency(debt.amount)}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "12px", background: C.surfaceAlt, padding: "10px", borderRadius: "8px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, textTransform: "uppercase" }}>Interest Rate</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{debt.rate ? `${debt.rate}%` : "0%"}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, textTransform: "uppercase" }}>Min Payment</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>${formatCurrency(debt.min)}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: "12px", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                    <input
                      type="checkbox"
                      checked={debt.autopay || false}
                      onChange={() => onToggleAutopay && onToggleAutopay(debt.id)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: debt.autopay ? C.blue : C.border,
                      transition: ".4s",
                      borderRadius: "24px",
                    }}>
                      <span style={{
                        position: "absolute",
                        content: '""',
                        height: "18px",
                        width: "18px",
                        left: "3px",
                        bottom: "3px",
                        backgroundColor: "white",
                        transition: ".4s",
                        borderRadius: "50%",
                        transform: debt.autopay ? "translateX(18px)" : "translateX(0)",
                      }}></span>
                    </span>
                  </label>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: C.textLight }}>Autopay</span>
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                 <button
                   onClick={() => startEdit(debt)}
                   style={{
                     background: "transparent",
                     border: `1.5px solid ${C.border}`,
                     borderRadius: "8px",
                     color: C.blue,
                     fontSize: "12px",
                     fontWeight: 700,
                     cursor: "pointer",
                     padding: "6px 14px",
                     transition: "background 0.15s",
                   }}
                 >
                   Edit
                 </button>                
                 <button
                   onClick={() => onDeleteDebt(debt.id)}
                   style={{
                     background: C.surfaceAlt,
                     border: `1.5px solid ${C.border}`,
                     borderRadius: "8px",
                     color: C.red,
                     fontSize: "12px",
                     fontWeight: 700,
                     cursor: "pointer",
                     padding: "6px 10px",
                   }}
                 >
                   Delete
                 </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDashboard && (
        <DebtDashboardModal
          debts={debts}
          formatCurrency={formatCurrency}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </div>
  );
}
