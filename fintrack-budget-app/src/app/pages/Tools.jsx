import { useOutletContext } from "react-router-dom";
import { C } from "../constants";

export default function Tools() {
  const { formatCurrency, income, totalSpent } = useOutletContext();

  const toolCards = [
    {
      title: "Currency Converter",
      description: "Quickly convert between USD, EUR, GBP and more.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      color: C.blue,
    },
    {
      title: "Savings Calculator",
      description: "Plan your future by calculating compound interest.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      color: C.green,
    },
    {
      title: "Debt Payoff",
      description: "Strategize your debt repayment using Snowball or Avalanche.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: C.red,
    },
    {
      title: "Tax Estimator",
      description: "Get a rough estimate of your tax liability for the year.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      color: C.gold,
    }
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", fontWeight: 700, marginBottom: "8px" }}>
          FINANCIAL TOOLS
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: C.text }}>
          What can we help you with today?
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {toolCards.map((tool, index) => (
          <div
            key={index}
            style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              borderRadius: "16px",
              padding: "24px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `${tool.color}15`,
              color: tool.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {tool.icon}
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                {tool.title}
              </div>
              <div style={{ fontSize: "14px", color: C.textMid, lineHeight: 1.5 }}>
                {tool.description}
              </div>
            </div>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: tool.color }}>Open Tool →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
