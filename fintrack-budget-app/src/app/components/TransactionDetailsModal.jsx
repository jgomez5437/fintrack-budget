import { createPortal } from "react-dom";
import { C } from "../constants";

export default function TransactionDetailsModal({
  transaction,
  categories,
  categoryId,
  onCategoryChange,
  onSave,
  onClose,
}) {
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
          background: C.white,
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
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Date
            </div>
            <div style={{ marginTop: "6px", color: C.text, fontSize: "15px", fontWeight: 600 }}>
              {transaction.date}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Amount
            </div>
            <div style={{ marginTop: "6px", color: C.red, fontSize: "18px", fontWeight: 700 }}>
              -${transaction.amount}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase" }}>
              Category
            </div>
            <select
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              style={{
                width: "100%",
                marginTop: "8px",
                background: C.white,
                border: `1.5px solid ${C.border}`,
                color: C.text,
                padding: "12px 14px",
                borderRadius: "10px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <button
            onClick={onSave}
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
            Save Category
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
