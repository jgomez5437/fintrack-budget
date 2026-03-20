import { C, MONTHS } from "../constants";

export default function Header({ month, year, onPrevMonth, onNextMonth }) {
  return (
    <div
      style={{
        background: C.blue,
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 16px rgba(30,80,212,0.25)",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            fontWeight: 900,
            color: C.white,
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          FinTrack
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "2px",
            marginTop: "3px",
          }}
        >
          Monthly Budget
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          className="nav-btn"
          onClick={onPrevMonth}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: C.white,
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: "center", minWidth: "110px" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: C.white,
              letterSpacing: "0.5px",
            }}
          >
            {MONTHS[month].toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              marginTop: "1px",
            }}
          >
            {year}
          </div>
        </div>
        <button
          className="nav-btn"
          onClick={onNextMonth}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: C.white,
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
