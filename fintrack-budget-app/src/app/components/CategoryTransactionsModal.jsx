import { createPortal } from "react-dom";
import { useEffect } from "react";
import { C } from "../constants";

export default function CategoryTransactionsModal({
  category,
  transactions,
  formatCurrency,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
        zIndex: 1000,
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
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.6px",
              color: C.blue,
              textTransform: "uppercase",
            }}
          >
            Activity
          </div>
          <h2
            style={{
              margin: "10px 0 0",
              fontSize: "26px",
              color: C.text,
              lineHeight: 1.15,
            }}
          >
            {category.name}
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", marginTop: "24px", paddingRight: "8px" }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.textLight }}>
              No transactions for this category.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: C.surfaceAlt, borderRadius: "14px", border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.text, fontSize: "15px" }}>{tx.name}</div>
                    <div style={{ fontSize: "12px", color: C.textLight, marginTop: "4px" }}>{tx.date}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: parseFloat(tx.amount) < 0 ? C.green : C.text, fontSize: "16px" }}>
                    {parseFloat(tx.amount) < 0 ? "+" : ""}${formatCurrency(Math.abs(parseFloat(tx.amount)))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: "24px", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
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
