import { useEffect } from "react";
import { C } from "../../../app/constants";

export default function AddIncomeModal({
  newIncome,
  onIncomeChange,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,77,0.46)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
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
            color: C.green,
            textTransform: "uppercase",
          }}
        >
          New Income Source
        </div>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "26px",
            color: C.text,
            lineHeight: 1.15,
          }}
        >
          Add an income stream
        </h2>
        <div style={{ fontSize: "14px", color: C.textMid, marginTop: "6px" }}>
          Track your paychecks, freelancing, or other income.
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <input
            placeholder="e.g. Primary Job, Dividends..."
            value={newIncome.name}
            onChange={(event) =>
              onIncomeChange({ ...newIncome, name: event.target.value })
            }
            onKeyDown={(event) => event.key === "Enter" && onConfirm()}
            style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: "12px",
              color: C.text,
              fontSize: "15px",
              padding: "14px 16px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: "12px",
              padding: "0 14px",
              gap: "6px",
            }}
          >
            <span style={{ color: C.textLight, fontWeight: 700, fontSize: "16px" }}>
              $
            </span>
            <input
              type="number"
              placeholder="Estimated amount (0.00)"
              value={newIncome.amount}
              onChange={(event) =>
                onIncomeChange({ ...newIncome, amount: event.target.value })
              }
              onFocus={(e) => e.target.select()}
              onKeyDown={(event) => event.key === "Enter" && onConfirm()}
              style={{
                background: "transparent",
                border: "none",
                color: C.text,
                fontSize: "15px",
                padding: "14px 0",
                width: "100%",
                minWidth: 0,
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <button
            onClick={onConfirm}
            style={{
              border: "none",
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.green,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Add income source
          </button>

          <button
            onClick={onCancel}
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
