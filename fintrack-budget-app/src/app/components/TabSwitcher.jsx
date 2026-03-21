import { C } from "../constants";

const tabs = [
  ["budget", "Budget"],
  ["transactions", "Transactions"],
  ["bills", "Bills"],
];

export default function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: "12px",
        padding: "4px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
      }}
    >
      {tabs.map(([key, label]) => (
        <button
          key={key}
          className="tab-btn"
          onClick={() => onTabChange(key)}
          style={{
            flex: 1,
            background: activeTab === key ? C.blue : "transparent",
            border: "none",
            color: activeTab === key ? C.white : C.textMid,
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: activeTab === key ? 700 : 500,
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
