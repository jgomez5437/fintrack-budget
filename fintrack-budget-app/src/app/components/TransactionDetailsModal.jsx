import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { C } from "../constants";

export default function TransactionDetailsModal({
  transaction,
  categories,
  incomeCategories = [],
  categoryId,
  formatCurrency,
  onCategoryChange,
  onSave,
  onClose,
  recurring = [],
  onToggleRecurring,
}) {
  const [isSplit, setIsSplit] = useState(transaction.isSplit || false);
  const [split1, setSplit1] = useState(
    transaction.isSplit && transaction.splits
      ? { categoryId: String(transaction.splits[0].categoryId), amount: String(transaction.splits[0].amount) }
      : { categoryId: categoryId || "", amount: "" }
  );
  const [split2, setSplit2] = useState(
    transaction.isSplit && transaction.splits
      ? { categoryId: String(transaction.splits[1].categoryId), amount: String(transaction.splits[1].amount) }
      : { categoryId: "", amount: "" }
  );

  const totalAmount = parseFloat(transaction.amount);

  useEffect(() => {
    if (isSplit && !split1.amount && !split2.amount) {
      const half = (totalAmount / 2).toFixed(2);
      setSplit1({ categoryId: categoryId || "", amount: half });
      setSplit2({ categoryId: "", amount: (totalAmount - parseFloat(half)).toFixed(2) });
    }
  }, [isSplit, totalAmount, categoryId, split1.amount, split2.amount]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSplit1AmountChange = (val) => {
    const amount1 = parseFloat(val) || 0;
    setSplit1((prev) => ({ ...prev, amount: val }));
    setSplit2((prev) => ({ ...prev, amount: (totalAmount - amount1).toFixed(2) }));
  };

  const handleSplit2AmountChange = (val) => {
    const amount2 = parseFloat(val) || 0;
    setSplit2((prev) => ({ ...prev, amount: val }));
    setSplit1((prev) => ({ ...prev, amount: (totalAmount - amount2).toFixed(2) }));
  };

  const handleSave = () => {
    if (isSplit) {
      if (!split1.categoryId || !split2.categoryId) {
        alert("Please select both categories for the split.");
        return;
      }
      const s1Amt = parseFloat(split1.amount) || 0;
      const s2Amt = parseFloat(split2.amount) || 0;
      
      if (Math.abs(s1Amt + s2Amt - totalAmount) > 0.01) {
        alert(`The split amounts ($${(s1Amt + s2Amt).toFixed(2)}) must equal the total ($${totalAmount.toFixed(2)}).`);
        return;
      }

      onSave({
        isSplit: true,
        splits: [
          { categoryId: parseInt(split1.categoryId, 10), amount: s1Amt },
          { categoryId: parseInt(split2.categoryId, 10), amount: s2Amt },
        ],
      });
    } else {
      onSave({ isSplit: false, splits: null });
    }
  };

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,77,0.46)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        zIndex: 35,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: C.surface,
          borderRadius: "24px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 70px rgba(15,28,77,0.18)",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.6px",
            color: C.blue,
            textTransform: "uppercase",
          }}
        >
          Transaction Details
        </div>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "26px",
            color: C.text,
            lineHeight: 1.15,
          }}
        >
          {transaction.name}
        </h2>

        <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                Date
              </div>
              <div style={{ marginTop: "4px", color: C.text, fontSize: "15px", fontWeight: 600 }}>
                {transaction.date}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                Amount
              </div>
              <div style={{
                marginTop: "4px",
                color: parseFloat(transaction.amount) < 0 ? C.green : C.red,
                fontSize: "18px",
                fontWeight: 700
              }}>
                {parseFloat(transaction.amount) < 0 ? "+" : ""}${formatCurrency(Math.abs(parseFloat(transaction.amount)))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px" }}>
            {!isSplit ? (
              <>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                  Category
                </div>
                <select
                  value={categoryId}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    background: C.surface,
                    border: `1.5px solid ${C.border}`,
                    color: C.text,
                    padding: "12px 14px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Uncategorized</option>
                  <optgroup label="Income Sources">
                    {incomeCategories.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Budget Categories">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <button
                  onClick={() => setIsSplit(true)}
                  style={{
                    marginTop: "12px",
                    background: "transparent",
                    border: "none",
                    color: C.blue,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 7l5 5-5 5M13 7l5 5-5 5" />
                  </svg>
                  Split Transaction
                </button>
              </>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: C.blue, letterSpacing: "1.2px", textTransform: "uppercase" }}>
                    Split Breakdown
                  </div>
                  <button
                    onClick={() => setIsSplit(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.textLight,
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Split
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "10px" }}>
                  <select
                    value={split1.categoryId}
                    onChange={(e) => setSplit1({ ...split1, categoryId: e.target.value })}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      color: C.text,
                      padding: "10px",
                      borderRadius: "10px",
                      fontSize: "13px",
                    }}
                  >
                    <option value="">Category 1</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={split1.amount}
                    onChange={(e) => handleSplit1AmountChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      color: parseFloat(split1.amount) < 0 ? C.green : C.red,
                      padding: "10px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "10px" }}>
                  <select
                    value={split2.categoryId}
                    onChange={(e) => setSplit2({ ...split2, categoryId: e.target.value })}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      color: C.text,
                      padding: "10px",
                      borderRadius: "10px",
                      fontSize: "13px",
                    }}
                  >
                    <option value="">Category 2</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={split2.amount}
                    onChange={(e) => handleSplit2AmountChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{
                      background: C.surface,
                      border: `1.5px solid ${C.border}`,
                      color: parseFloat(split2.amount) < 0 ? C.green : C.red,
                      padding: "10px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                  Recurring Transaction
                </div>
                <div style={{ fontSize: "12px", color: C.textMid, marginTop: "2px" }}>
                  Mark as recurring to track when it renews
                </div>
              </div>
              
              <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={recurring.some((r) => r.name.toLowerCase() === transaction.name.toLowerCase())}
                  onChange={() => {
                    if (onToggleRecurring) {
                      onToggleRecurring(transaction);
                    }
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: recurring.some((r) => r.name.toLowerCase() === transaction.name.toLowerCase()) ? C.blue : C.border,
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
                    transform: recurring.some((r) => r.name.toLowerCase() === transaction.name.toLowerCase()) ? "translateX(18px)" : "translateX(0)",
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleSave}
            style={{
              border: "none",
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.blue,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isSplit ? "Save Split Categories" : "Save Category"}
          </button>

          <button
            onClick={onClose}
            style={{
              border: `1.5px solid ${C.border}`,
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.surfaceAlt,
              color: C.text,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
