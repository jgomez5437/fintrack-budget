import { useState } from "react";
import { C } from "../../../app/constants";
import { inputStyle } from "../../../app/styles";

export default function BillsTab({ bills = [], onAddBill, onDeleteBill, formatCurrency }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    date: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.date) return;
    
    onAddBill({
      ...newBill,
      id: Date.now(),
    });
    
    setNewBill({ name: "", amount: "", date: "", description: "" });
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
          PENDING BILLS
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
            + Add Bill
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
            Add New Bill
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <input
                placeholder="Bill Name"
                value={newBill.name}
                onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                style={inputStyle}
                required
              />
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
                  placeholder="0.00"
                  step="0.01"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.text,
                    fontSize: "15px",
                    padding: "12px 0",
                    width: "100%",
                    minWidth: 0,
                  }}
                  required
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
              <input
                type="date"
                value={newBill.date}
                onChange={(e) => setNewBill({ ...newBill, date: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                placeholder="Description (optional)"
                value={newBill.description}
                onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                style={inputStyle}
              />
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
                Save Bill
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

      {bills.length === 0 && !showAdd && (
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
            No pending bills
          </div>
          <div style={{ fontSize: "14px" }}>
            Add your upcoming bills to track when they are due.
          </div>
        </div>
      )}

      {bills.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {bills.map((bill) => (
            <div
              key={bill.id}
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                    {bill.name}
                  </div>
                  <div style={{ fontSize: "13px", color: C.textLight, display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Due {new Date(bill.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: C.text }}>
                  ${formatCurrency(bill.amount)}
                </div>
              </div>
              
              {bill.description && (
                <div style={{ fontSize: "13px", color: C.textMid, background: C.surfaceAlt, padding: "8px 12px", borderRadius: "6px", marginBottom: "16px" }}>
                  {bill.description}
                </div>
              )}
              
              <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: `1px solid ${C.borderLight || C.border}`, display: "flex", justifyContent: "flex-end" }}>
                 <button
                   onClick={() => onDeleteBill(bill.id)}
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
