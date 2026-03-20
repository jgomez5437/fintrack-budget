import { C } from "../constants";

export default function ImportReviewModal({
  categories,
  importRows,
  onCancel,
  onConfirm,
  onUpdateRow,
  onDeleteRow,
}) {
  const included = importRows.filter((row) => row.include);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', sans-serif",
        color: C.text,
      }}
    >
      <div
        style={{
          background: C.blue,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(30,80,212,0.25)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: 900,
              color: C.white,
            }}
          >
            Review Import
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.65)",
              marginTop: "2px",
            }}
          >
            {importRows.length} transactions found · {included.length} selected
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: C.white,
              padding: "9px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: C.gold,
              border: "none",
              color: C.white,
              padding: "9px 22px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Import {included.length} Transactions
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 20px 60px" }}>
        <div
          style={{
            background: C.blueLight,
            border: `1.5px solid ${C.blueMid}`,
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "20px",
            fontSize: "13px",
            color: C.textMid,
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: C.blue }}>Review before importing.</strong>{" "}
          Merchant names have been cleaned automatically. Edit any name, assign
          categories, and uncheck rows you don't want. Transactions without a
          category will still be imported and can be categorized later.
        </div>

        <div className="import-table-container">
          <div
            className="import-table-row import-review-grid"
            style={{
              display: "grid",
              gap: "8px",
              padding: "8px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: C.textLight,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            <div />
            <div>Merchant</div>
            <div>Amount</div>
            <div>Category</div>
            <div />
          </div>

          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
            }}
          >
            {importRows.map((row, index) => (
              <div
                key={row.id}
                className="import-row import-table-row import-review-grid"
                style={{
                  display: "grid",
                  gap: "8px",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: !row.include
                    ? "#f8f8fc"
                    : index % 2 === 0
                      ? C.white
                      : C.surfaceAlt,
                  borderBottom:
                    index < importRows.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.1s",
                  opacity: row.include ? 1 : 0.45,
                }}
              >
                <input
                  type="checkbox"
                  checked={row.include}
                  onChange={(event) =>
                    onUpdateRow(row.id, "include", event.target.checked)
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: C.blue,
                    flexShrink: 0,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <input
                    value={row.name}
                    onChange={(event) =>
                      onUpdateRow(row.id, "name", event.target.value)
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.text,
                      fontSize: "14px",
                      fontWeight: 600,
                      width: "100%",
                      padding: "2px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={row.name}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.textLight,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                    title={row.rawDesc}
                  >
                    {row.rawDesc}
                  </div>
                </div>

                <div
                  className="import-amount-cell"
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: C.red,
                    whiteSpace: "nowrap",
                  }}
                >
                  -${row.amount}
                </div>

                <select
                  value={row.categoryId}
                  onChange={(event) =>
                    onUpdateRow(row.id, "categoryId", event.target.value)
                  }
                  style={{
                    background: row.categoryId ? C.white : C.surfaceAlt,
                    border: `1.5px solid ${row.categoryId ? C.border : C.blueMid}`,
                    color: row.categoryId ? C.text : C.textLight,
                    padding: "7px 10px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    width: "100%",
                    minWidth: 0,
                    cursor: "pointer",
                  }}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onDeleteRow(row.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: C.textLight,
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: 1,
                    padding: "0",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: C.white,
              border: `1.5px solid ${C.border}`,
              color: C.textMid,
              padding: "12px 22px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: C.blue,
              border: "none",
              color: C.white,
              padding: "12px 28px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Import {included.length} Transactions →
          </button>
        </div>
      </div>
    </div>
  );
}
