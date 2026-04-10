import { useEffect, useState, useRef } from "react";
import { C } from "../constants";
import { getAllSummaries, askFollowUpQuestion } from "../services/weeklySummary";

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

export default function WeeklySummaryModal({ userId, transactions = [], categories = [], isGenerating, onClose }) {
  const [summaries, setSummaries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chat UI states
  const [isChatView, setIsChatView] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatting, isChatView]);

  const handleSendQuestion = async () => {
    if (!chatInput.trim() || isChatting || !current) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsChatting(true);

    try {
      const reply = await askFollowUpQuestion({
        summary: current,
        transactions,
        categories,
        messages: [...chatMessages, { role: "user", content: text }],
      });
      setChatMessages((prev) => [...prev, { role: "model", content: reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "model", content: "Sorry, I couldn't process that right now. Please try again." }]);
    } finally {
      setIsChatting(false);
    }
  };

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
        ) : isChatView ? (
          <div style={{ display: "flex", flexDirection: "column", height: "400px" }}>
            {/* Chat header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
                Discussion: {formatWeekLabel(current)}
              </div>
              <button
                onClick={() => setIsChatView(false)}
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: C.textMid,
                  cursor: "pointer",
                }}
              >
                Back to Summary
              </button>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              <div style={{ alignSelf: "flex-start", background: C.surface, border: `1.5px solid ${C.border}`, padding: "10px 14px", borderRadius: "12px", color: C.textMid, fontSize: "13px", lineHeight: "1.5" }}>
                I'm ready! Ask me anything about your spending between {formatWeekLabel(current)}.
              </div>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    background: msg.role === "user" ? C.blue : C.surface,
                    color: msg.role === "user" ? C.white : C.textMid,
                    border: msg.role === "user" ? "none" : `1.5px solid ${C.border}`,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    maxWidth: "85%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {isChatting && (
                <div style={{ alignSelf: "flex-start", background: C.surface, border: `1.5px solid ${C.border}`, padding: "10px 14px", borderRadius: "12px", color: C.textLight, fontSize: "13px" }}>
                   Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
                disabled={isChatting}
                placeholder="Ask a question..."
                style={{
                  flex: 1,
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: C.text,
                }}
              />
              <button
                onClick={handleSendQuestion}
                disabled={isChatting || !chatInput.trim()}
                style={{
                  background: C.blue,
                  border: "none",
                  padding: "0 18px",
                  borderRadius: "10px",
                  color: C.white,
                  fontWeight: 700,
                  cursor: isChatting || !chatInput.trim() ? "default" : "pointer",
                  opacity: isChatting || !chatInput.trim() ? 0.6 : 1,
                }}
              >
                Send
              </button>
            </div>
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

            <button
              onClick={() => {
                setChatMessages([]);
                setChatInput("");
                setIsChatView(true);
              }}
              style={{
                width: "100%",
                marginTop: "16px",
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                color: C.blue,
                padding: "12px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Ask a question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
