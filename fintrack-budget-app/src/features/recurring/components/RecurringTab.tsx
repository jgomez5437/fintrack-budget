import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { C } from "../../../app/constants";

export default function RecurringTab({
  recurring,
  formatCurrency,
  getCategoryById,
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const scrollRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Group recurring items by dayOfMonth
  const groupedByDay = useMemo(() => {
    if (!recurring) return [];
    
    const map = new Map();
    recurring.forEach(item => {
      const day = item.dayOfMonth || 1;
      if (!map.has(day)) map.set(day, { items: [], totalAmount: 0 });
      const group = map.get(day);
      group.items.push(item);
      group.totalAmount += Math.abs(parseFloat(item.amount) || 0);
    });

    return Array.from(map.entries())
      .map(([day, data]) => ({ day, ...data }))
      .sort((a, b) => a.day - b.day);
  }, [recurring]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedDay !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedDay]);

  const getSuffix = (day) => ["st", "nd", "rd"][((day + 90) % 100 - 10) % 10 - 1] || "th";

  const renderTransactionItem = (item, index, hideBorder) => {
    const category = getCategoryById ? getCategoryById(item.categoryId) : null;
    return (
      <div
        key={item.id || index}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 18px",
          background: index % 2 === 0 ? C.surface : C.surfaceAlt,
          borderBottom: hideBorder ? "none" : `1px solid ${C.border}`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: C.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </div>
          {item.dayOfMonth && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "3px",
                flexWrap: "wrap",
              }}
            >
              {category ? (
                <div
                  style={{
                    fontSize: "11px",
                    color: C.blue,
                    background: C.blueLight,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  {category.name}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textLight,
                    background: C.surfaceAlt,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  Uncategorized
                </div>
              )}
              
              <div
                style={{
                  fontSize: "11px",
                  color: C.textLight,
                }}
              >
                Renews on the {item.dayOfMonth}{getSuffix(item.dayOfMonth)}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: C.text,
            flexShrink: 0
          }}
        >
          ${formatCurrency(Math.abs(parseFloat(item.amount)))}
        </div>
      </div>
    );
  };

  const selectedData = selectedDay !== null ? groupedByDay.find(g => g.day === selectedDay) : null;

  return (
    <div className="fade-up">

      {/* HORIZONTAL DATE SUMMARY */}
      {groupedByDay.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "12px",
              color: C.textLight,
              letterSpacing: "2px",
              fontWeight: 600,
              marginBottom: "12px",
              marginLeft: "4px"
            }}
          >
            UPCOMING RENEWALS
          </div>
          <div style={{ position: "relative", margin: "0 -20px" }}>
            <button
              className="carousel-arrow"
              style={{ left: "12px" }}
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="carousel-arrow"
              style={{ right: "12px" }}
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div
              ref={scrollRef}
              className="hide-scrollbar carousel-scroll-container"
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
            >
              {groupedByDay.map(({ day, items, totalAmount }) => (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  flexShrink: 0,
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "16px",
                  padding: "16px",
                  width: "120px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(30,80,212,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,80,212,0.1)";
                  e.currentTarget.style.borderColor = C.blueLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(30,80,212,0.06)";
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: C.text }}>
                    {day}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.textMid }}>
                    {getSuffix(day)}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: "13px", 
                  fontWeight: 700, 
                  color: C.blue, 
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <span style={{ 
                    display: "inline-block", 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    background: C.blue 
                  }}></span>
                  {items.length} Due
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL RECURRING LIST */}
      <div
        style={{
          marginBottom: "20px",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "14px",
          boxShadow: "0 4px 16px rgba(30,80,212,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: recurring && recurring.length > 0 ? `1px solid ${C.border}` : "none",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: C.textLight,
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            ALL SUBSCRIPTIONS & BILLS
          </div>
        </div>

        {recurring && recurring.length > 0 ? (
          <div>
            {recurring.map((item, index) => renderTransactionItem(item, index, index === recurring.length - 1))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: C.surfaceAlt,
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: C.textMid,
                marginBottom: "8px",
              }}
            >
              No recurring items yet
            </div>
            <div
              style={{
                fontSize: "14px",
                color: C.textLight,
                lineHeight: 1.5,
              }}
            >
              Import transactions from your bank statement. FinTrack AI will automatically detect subscriptions and recurring bills.
            </div>
          </div>
        )}
      </div>

      {/* MODAL PORTAL */}
      {selectedDay !== null && selectedData && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end", // Bottom sheet style for mobile
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div style={{ flex: 1, minHeight: "20vh" }} />
          <div
            className="slide-up"
            style={{
              background: C.surface,
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              borderTop: `1.5px solid ${C.border}`,
              borderLeft: `1.5px solid ${C.border}`,
              borderRight: `1.5px solid ${C.border}`,
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{ 
                padding: "24px 20px 16px 20px", 
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", color: C.textMid, fontWeight: 600, letterSpacing: "1px", marginBottom: "4px" }}>
                  DUE ON THE {selectedDay}{getSuffix(selectedDay).toUpperCase()}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text }}>
                  ${formatCurrency(selectedData.totalAmount)}
                </div>
                <div style={{ fontSize: "14px", color: C.textMid, marginTop: "4px", fontWeight: 500 }}>
                  {selectedData.items.length} transaction{selectedData.items.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.textMid,
                  cursor: "pointer",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div style={{ overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
              {selectedData.items.map((item, index) => 
                renderTransactionItem(item, index, index === selectedData.items.length - 1)
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Required CSS for animations and scroll behavior */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .carousel-scroll-container {
          padding: 0 20px 8px 20px;
        }
        @media (hover: hover) and (pointer: fine) {
          .carousel-scroll-container {
            padding: 0 44px 8px 44px;
          }
        }
        .slide-up {
          animation: slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUpModal {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .carousel-arrow {
          position: absolute;
          top: calc(50% - 4px);
          transform: translateY(-50%);
          background: ${C.surface};
          border: 1.5px solid ${C.borderHover};
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
          color: ${C.textMid};
          transition: all 0.2s;
        }
        .carousel-arrow:hover {
          background: ${C.surfaceAlt};
          color: ${C.text};
          transform: translateY(-50%) scale(1.05);
        }
        @media (hover: none) and (pointer: coarse) {
          .carousel-arrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
