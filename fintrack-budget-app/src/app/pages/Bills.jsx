import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import BillsTab from "../components/BillsTab";
import DebtTab from "../components/DebtTab";
import { C } from "../constants";

export default function Bills() {
  const context = useOutletContext();
  const [activeView, setActiveView] = useState("bills"); // "bills" | "debt"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "12px",
          padding: "4px",
          gap: "4px",
        }}
      >
        <button
          onClick={() => setActiveView("bills")}
          style={{
            flex: 1,
            background: activeView === "bills" ? C.blue : "transparent",
            color: activeView === "bills" ? C.white : C.textMid,
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Bills
        </button>
        <button
          onClick={() => setActiveView("debt")}
          style={{
            flex: 1,
            background: activeView === "debt" ? C.blue : "transparent",
            color: activeView === "debt" ? C.white : C.textMid,
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Debt
        </button>
      </div>

      {activeView === "bills" && (
        <BillsTab
          bills={context.data.bills || []}
          onAddBill={context.addBill}
          onDeleteBill={context.deleteBill}
          formatCurrency={context.formatCurrency}
        />
      )}

      {activeView === "debt" && (
        <DebtTab
          debts={context.data.debt || []}
          onAddDebt={context.addDebt}
          onDeleteDebt={context.deleteDebt}
          onToggleAutopay={context.toggleDebtAutopay}
          formatCurrency={context.formatCurrency}
        />
      )}
    </div>
  );
}
