import { C, MONTHS } from "../constants";

export default function Header({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  userEmail,
  onSignOut,
  isSigningOut = false,
}) {
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
        flexWrap: "wrap",
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

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
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
            {"<"}
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
            {">"}
          </button>
        </div>

        {userEmail && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                maxWidth: "220px",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.92)",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={userEmail}
            >
              {userEmail}
            </div>
            <button
              onClick={onSignOut}
              disabled={isSigningOut}
              style={{
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: isSigningOut ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)",
                color: C.white,
                borderRadius: "999px",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isSigningOut ? "wait" : "pointer",
              }}
            >
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
