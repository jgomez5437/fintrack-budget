import { C } from "../constants";

export default function AddCategoryModal({
  newCat,
  onCategoryChange,
  onCancel,
  onConfirm,
}) {
  return (
    <div
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
          New Category
        </div>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "26px",
            color: C.text,
            lineHeight: 1.15,
          }}
        >
          Add a budget category
        </h2>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <input
            placeholder="Category name"
            value={newCat.name}
            onChange={(event) =>
              onCategoryChange({ ...newCat, name: event.target.value })
            }
            onKeyDown={(event) => event.key === "Enter" && onConfirm()}
            style={{
              background: C.white,
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
              background: C.white,
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
              placeholder="0.00"
              value={newCat.amount}
              onChange={(event) =>
                onCategoryChange({ ...newCat, amount: event.target.value })
              }
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
              background: C.blue,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Add category
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
