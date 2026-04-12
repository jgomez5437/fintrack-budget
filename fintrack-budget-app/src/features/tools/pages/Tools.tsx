import { useNavigate } from "react-router-dom";
import { C } from "../../../app/constants";

export default function Tools() {
  const navigate = useNavigate();

  const toolCards = [
    {
      title: "Mortgage Calculator",
      description: "See your monthly payment and principal vs interest over the life of the loan.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7" />
          <path d="M9 22V12h6v10" />
          <path d="M3 9v12h18V9" />
        </svg>
      ),
      color: C.blue,
      to: "/tools/mortgage",
    },
    {
      title: "Retirement / Savings Growth",
      description: "Project how today’s savings and monthly contributions compound over time.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      ),
      color: C.green,
      to: "/tools/retirement",
    },
    {
      title: "Debt Payoff",
      description: "Compare Snowball vs Avalanche, payoff timelines, and total interest saved.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: C.red,
      to: "/tools/debt",
    },
    {
      title: "Emergency Fund Builder",
      description: "Pick months of expenses, see your goal, and map out how to hit it.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      color: C.gold,
      to: "/tools/emergency",
    },
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
            onClick={() => navigate(tool.to)}
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
              <span style={{ fontSize: "13px", fontWeight: 700, color: tool.color }}>Open Tool &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
