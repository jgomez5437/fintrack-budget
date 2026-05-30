import { useEffect } from "react";
import { createPortal } from "react-dom";
import { C } from "../constants";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export default function IncomeUsedModal({
  isOpen,
  onClose,
  spentByCategory,
  categories,
  totalIncome,
  totalSpent,
  formatCurrency,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Process data for chart
  const items = [];
  categories.forEach((cat) => {
    const spent = spentByCategory[cat.id] || 0;
    if (spent > 0) {
      items.push({ name: cat.name, spent });
    }
  });

  const uncategorizedSpent = spentByCategory["null"] || spentByCategory["undefined"] || 0;
  if (uncategorizedSpent > 0) {
    items.push({ name: "Uncategorized", spent: uncategorizedSpent });
  }

  // Sort by spent descending
  items.sort((a, b) => b.spent - a.spent);

  // Assign colors and build conic gradient
  let currentPercentage = 0;
  const gradientStops = items.map((item, index) => {
    const percentage = totalSpent > 0 ? (item.spent / totalSpent) * 100 : 0;
    const color = COLORS[index % COLORS.length];
    item.color = color;
    item.percentage = percentage;
    
    const start = currentPercentage;
    const end = currentPercentage + percentage;
    currentPercentage = end;
    
    return `${color} ${start}% ${end}%`;
  });

  const conicGradient = gradientStops.length > 0 
    ? `conic-gradient(${gradientStops.join(", ")})` 
    : `conic-gradient(${C.surfaceAlt} 0% 100%)`;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: "24px",
          width: "100%",
          maxWidth: "400px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: "20px", color: C.text }}>Income Used</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: C.textLight,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", flex: 1 }}>
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: conicGradient,
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: `2px solid ${C.surface}`,
              flexShrink: 0,
            }}
          />

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color }} />
                  <span style={{ fontSize: "14px", color: C.text, fontWeight: 500 }}>{item.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: C.text, fontWeight: 700 }}>${formatCurrency(item.spent)}</span>
                  <span style={{ fontSize: "12px", color: C.textLight, width: "36px", textAlign: "right" }}>{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "20px 0" }}>
                No spending data available.
              </div>
            )}
          </div>
        </div>

        <div style={{ width: "100%", borderTop: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-around", flexShrink: 0, background: C.surface }}>
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>TOTAL INCOME</div>
               <div style={{ fontSize: "18px", color: C.green, fontWeight: 700 }}>${formatCurrency(totalIncome)}</div>
             </div>
             <div style={{ width: "1px", backgroundColor: C.border }} />
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: "11px", color: C.textLight, fontWeight: 700, letterSpacing: "1px", marginBottom: "4px" }}>TOTAL SPENT</div>
               <div style={{ fontSize: "18px", color: C.text, fontWeight: 700 }}>${formatCurrency(totalSpent)}</div>
             </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
