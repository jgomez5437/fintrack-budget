import { createPortal } from "react-dom";
import { C } from "../constants";
import { inputStyle } from "../styles";

export default function CategoryEditModal({
  editVal,
  onEditValueChange,
  onSave,
  onCancel,
}) {
  const modal = (
    <div
      onClick={onCancel}
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
          Edit Category
        </div>

        <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
          <input
            value={editVal.name}
            onChange={(event) =>
              onEditValueChange({ ...editVal, name: event.target.value })
            }
            placeholder="Category name"
            style={inputStyle}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: "8px",
              padding: "0 14px",
              gap: "6px",
            }}
          >
            <span style={{ color: C.textLight, fontWeight: 600, fontSize: "16px" }}>
              $
            </span>
            <input
              type="number"
              value={editVal.amount}
              onChange={(event) =>
                onEditValueChange({ ...editVal, amount: event.target.value })
              }
              placeholder="0.00"
              style={{
                background: "transparent",
                border: "none",
                color: C.text,
                fontSize: "16px",
                padding: "13px 0",
                width: "100%",
                minWidth: 0,
              }}
            />
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

  return createPortal(modal, document.body);
}
