import { useEffect, useState } from "react";
import { C } from "../constants";
import { getAllSummaries } from "../services/weeklySummary";

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function formatWeekLabel(row) {
  if (!row) return "";
  const opts = { month: "short", day: "numeric" };
  const start = new Date(row.week_start + "T00:00:00");
  const end = new Date(row.week_end + "T00:00:00");
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}, ${end.getFullYear()}`;
}

export default function WeeklySummaryModal({ userId, isGenerating, onClose }) {
  const [summaries, setSummaries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getAllSummaries(userId).then((rows) => {
      setSummaries(rows);
      setLoading(false);
    });
  }, [userId, isGenerating]);

  const current = summaries[currentIndex] ?? null;
  const hasPrev = currentIndex < summaries.length - 1;
  const hasNext = currentIndex > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 4000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "20px",
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ color: C.blue }}>
            <SparkleIcon />
          </div>
          <div>
            <div style={{ fontSize: "11px", color: C.textLight, letterSpacing: "2px", fontWeight: 700 }}>
              AI ADVISOR
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: C.text }}>
              Weekly Summary
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: C.textLight,
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
              padding: "2px 6px",
            }}
          >
            ×
          </button>
        </div>

        {/* Loading / Generating States */}
        {(loading || isGenerating) ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: "40px", height: "40px",
              border: `3px solid ${C.border}`,
              borderTop: `3px solid ${C.blue}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <div style={{ fontSize: "14px", color: C.textMid, fontWeight: 600 }}>
              {isGenerating ? "Generating your summary…" : "Loading…"}
            </div>
            <div style={{ fontSize: "12px", color: C.textLight, marginTop: "6px" }}>
              {isGenerating ? "Gemini is analyzing your week" : ""}
            </div>
          </div>
        ) : summaries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textLight, fontSize: "14px" }}>
            No summaries yet — check back this Sunday!
          </div>
        ) : (
          <>
            {/* Week navigation */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              gap: "8px",
            }}>
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!hasPrev}
                style={{
                  background: hasPrev ? C.surfaceAlt : "transparent",
                  border: `1.5px solid ${hasPrev ? C.border : "transparent"}`,
                  color: hasPrev ? C.textMid : C.border,
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: hasPrev ? "pointer" : "default",
                  display: "flex", alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <ChevronLeft />
              </button>

              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
                  {formatWeekLabel(current)}
                </div>
                {currentIndex === 0 && (
                  <div style={{ fontSize: "11px", color: C.blue, fontWeight: 600, marginTop: "2px" }}>
                    Most recent
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={!hasNext}
                style={{
                  background: hasNext ? C.surfaceAlt : "transparent",
                  border: `1.5px solid ${hasNext ? C.border : "transparent"}`,
                  color: hasNext ? C.textMid : C.border,
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: hasNext ? "pointer" : "default",
                  display: "flex", alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <ChevronRight />
              </button>
            </div>

            {/* Summary text */}
            <div style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              borderRadius: "14px",
              padding: "18px",
              fontSize: "14px",
              lineHeight: "1.7",
              color: C.textMid,
              fontWeight: 500,
            }}>
              {current?.summary_text}
            </div>

            {/* History count */}
            {summaries.length > 1 && (
              <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12px", color: C.textLight }}>
                {currentIndex + 1} of {summaries.length} summaries
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
