import { C, MONTHS } from "../constants";

export default function Header({
  userEmail,
  onSignOut,
  isSigningOut = false,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  canGoPrev = true,
  theme,
  onToggleTheme,
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
          Financial Tracker
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className="nav-btn"
            onClick={onPrevMonth}
            disabled={!canGoPrev}
            style={{
              background: canGoPrev ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: canGoPrev ? C.white : "rgba(255,255,255,0.45)",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              cursor: canGoPrev ? "pointer" : "not-allowed",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              flexShrink: 0,
              opacity: canGoPrev ? 1 : 0.75,
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
            <button
              onClick={onToggleTheme}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: C.white,
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              className="nav-btn"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <div
              className="desktop-email-pill"
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
                transition: "all 0.2s",
              }}
              className="nav-btn"
            >
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
