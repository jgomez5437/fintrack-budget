import { useState, useEffect } from "react";
import { C, MONTHS } from "../../constants";
import { getStorage } from "../../services/storage";

export default function MonthPickerModal({ currentMonth, currentYear, onSelectMonth, onCancel }) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [initializedKeys, setInitializedKeys] = useState(new Set());

  useEffect(() => {
    async function loadKeys() {
      const keys = await getStorage().getAllKeys();
      setInitializedKeys(new Set(keys));
    }
    loadKeys();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleConfirm = () => {
    if (isSelectionDisabled) return;
    onSelectMonth(selectedMonth, selectedYear);
  };

  const now = new Date();
  const realMonth = now.getMonth();
  const realYear = now.getFullYear();
  const selectedBudgetKey = `budget-${selectedMonth}-${selectedYear}`;
  const isSelectedPast = selectedYear < realYear || (selectedYear === realYear && selectedMonth < realMonth);
  const isSelectionDisabled = isSelectedPast && !initializedKeys.has(selectedBudgetKey);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 28, 77, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onCancel}
    >
      <div
        className="fade-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "340px",
          background: C.surface,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: `1px solid ${C.border}`,
          color: C.text,
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            style={{
              background: C.surfaceAlt,
              border: "none",
              color: C.text,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {"<"}
          </button>
          <div style={{ fontSize: "20px", fontWeight: 800 }}>{selectedYear}</div>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            style={{
              background: C.surfaceAlt,
              border: "none",
              color: C.text,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            {">"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {MONTHS.map((mName, idx) => {
            const isTarget = selectedMonth === idx;
            const budgetKey = `budget-${idx}-${selectedYear}`;
            
            const now = new Date();
            const realMonth = now.getMonth();
            const realYear = now.getFullYear();
            
            const isPast = selectedYear < realYear || (selectedYear === realYear && idx < realMonth);
            const isInitialized = initializedKeys.has(budgetKey);
            const isDisabled = isPast && !isInitialized;

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => setSelectedMonth(idx)}
                style={{
                  padding: "12px 0",
                  borderRadius: "12px",
                  border: isTarget ? `1.5px solid ${C.blue}` : `1.5px solid ${isDisabled ? C.border : C.border}`,
                  background: isTarget ? C.blue : "transparent",
                  color: isTarget ? C.white : isDisabled ? C.textLight : C.text,
                  fontWeight: isTarget ? 700 : 500,
                  fontSize: "13px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                {mName.slice(0, 3)}
              </button>
            )
          })}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              background: C.surfaceAlt,
              border: "none",
              color: C.text,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSelectionDisabled}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              background: C.blue,
              border: "none",
              color: C.white,
              fontWeight: 700,
              cursor: isSelectionDisabled ? "not-allowed" : "pointer",
              boxShadow: isSelectionDisabled ? "none" : "0 4px 12px rgba(30,80,212,0.2)",
              fontSize: "14px",
              opacity: isSelectionDisabled ? 0.4 : 1,
            }}
          >
            Go to Month
          </button>
        </div>
      </div>
    </div>
  );
}
