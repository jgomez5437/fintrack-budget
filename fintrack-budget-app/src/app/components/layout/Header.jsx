import { useState } from "react";
import { C, MONTHS } from "../../constants";
import MonthPickerModal from "../modals/MonthPickerModal";

export default function Header({
  userEmail,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  canGoPrev = true,
  theme,
  onToggleTheme,
  onGoToMonth,
  onOpenSettings,
}) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  return (
    <div
      style={{
        background: C.blue,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 16px rgba(30,80,212,0.25)",
      }}
    >
      {/* Left: Logo */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
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
            fontSize: "10px",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "2px",
            marginTop: "2px",
          }}
        >
          Financial Tracker
        </div>
      </div>

      {/* Right: everything always in ONE row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Email pill — desktop only */}
        {userEmail && (
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
              marginRight: "4px",
            }}
            title={userEmail}
          >
            {userEmail}
          </div>
        )}

        {/* Prev month */}
        <button
          className="nav-btn"
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          style={{
            background: canGoPrev ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: canGoPrev ? C.white : "rgba(255,255,255,0.45)",
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            cursor: canGoPrev ? "pointer" : "not-allowed",
            fontSize: "18px",
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

        {/* Month/Year label */}
        <div
          style={{ textAlign: "center", minWidth: "80px", cursor: "pointer", transition: "all 0.15s" }}
          onClick={() => setShowMonthPicker(true)}
          className="header-month-btn"
        >
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.white, letterSpacing: "0.5px" }}>
            {MONTHS[month].toUpperCase()}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "1px" }}>
            {year}
          </div>
        </div>

        {/* Next month */}
        <button
          className="nav-btn"
          onClick={onNextMonth}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: C.white,
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          {">"}
        </button>

        {userEmail && (
          <>
            {/* Dark mode toggle */}
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
                flexShrink: 0,
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

            {/* Settings */}
            <button
              onClick={onOpenSettings}
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
                flexShrink: 0,
              }}
              className="nav-btn"
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
          </>
        )}
      </div>

      {showMonthPicker && (
        <MonthPickerModal
          currentMonth={month}
          currentYear={year}
          onSelectMonth={(m, y) => {
            setShowMonthPicker(false);
            onGoToMonth(m, y);
          }}
          onCancel={() => setShowMonthPicker(false)}
        />
      )}
    </div>
  );
}
