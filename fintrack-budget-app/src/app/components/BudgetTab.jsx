import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "../constants";
import CategoryEditModal from "./CategoryEditModal";
import { inputStyle } from "../styles";

export default function BudgetTab({
  categories,
  spentByCategory,
  editingId,
  editVal,
  inlineCatId,
  inlineTx,
  inlineAutocomplete,
  formatCurrency,
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteCategory,
  onOpenInline,
  onCloseInline,
  inlineNameRef,
  onInlineNameChange,
  onPickInlineSuggestion,
  onInlineAmountChange,
  onSubmitInline,
  onOpenAddCategory,
  onReorderCategories,
}) {
  const activeEditCategory = categories.find((category) => category.id === editingId);

  // ── Drag State ──
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [ghostStyle, setGhostStyle] = useState(null);

  const dragStateRef = useRef({
    active: false,
    fromIndex: null,
    startY: 0,
    startX: 0,
    offsetY: 0,
    offsetX: 0,
    currentY: 0,
    ghostHeight: 0,
    scrollRAF: null,
  });

  const listRef = useRef(null);

  const getRowEls = useCallback(() =>
    listRef.current ? Array.from(listRef.current.querySelectorAll(".cat-drag-row")) : [],
  []);

  const computeDropIndex = useCallback((clientY) => {
    const rows = getRowEls();
    let best = rows.length - 1;
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) { best = i; break; }
    }
    return best;
  }, [getRowEls]);

  const stopAutoScroll = useCallback(() => {
    if (dragStateRef.current.scrollRAF) {
      cancelAnimationFrame(dragStateRef.current.scrollRAF);
      dragStateRef.current.scrollRAF = null;
    }
  }, []);

  const startAutoScroll = useCallback((clientY) => {
    stopAutoScroll();
    const EDGE = 80; // px from viewport edge
    const MAX_SPEED = 18;

    const tick = () => {
      if (!dragStateRef.current.active) return;
      const vy = clientY;
      const winH = window.innerHeight;
      let speed = 0;
      if (vy < EDGE) speed = -MAX_SPEED * (1 - vy / EDGE);
      else if (vy > winH - EDGE) speed = MAX_SPEED * ((vy - (winH - EDGE)) / EDGE);

      if (speed !== 0) {
        window.scrollBy({ top: speed });
        // Update ghost position with scroll delta
        dragStateRef.current.currentY += speed;
        setGhostStyle((prev) => prev ? { ...prev, top: dragStateRef.current.currentY } : prev);
      }
      dragStateRef.current.scrollRAF = requestAnimationFrame(tick);
    };
    dragStateRef.current.scrollRAF = requestAnimationFrame(tick);
  }, [stopAutoScroll]);

  const handlePointerDown = useCallback((event, index) => {
    event.stopPropagation();
    event.preventDefault();

    const rows = getRowEls();
    const row = rows[index];
    if (!row) return;

    const rect = row.getBoundingClientRect();
    const state = dragStateRef.current;
    state.active = true;
    state.fromIndex = index;
    state.startY = event.clientY;
    state.startX = event.clientX;
    state.offsetY = event.clientY - rect.top;
    state.offsetX = event.clientX - rect.left;
    state.currentY = event.clientY - state.offsetY + window.scrollY;
    state.ghostHeight = rect.height;

    setDragIndex(index);
    setDropIndex(index);
    setGhostStyle({
      top: event.clientY - state.offsetY + window.scrollY,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [getRowEls]);

  useEffect(() => {
    if (dragIndex === null) return;

    const onMove = (event) => {
      if (!dragStateRef.current.active) return;
      const clientY = event.clientY ?? event.touches?.[0]?.clientY;
      const clientX = event.clientX ?? event.touches?.[0]?.clientX;
      if (clientY === undefined) return;

      const state = dragStateRef.current;
      state.currentY = clientY - state.offsetY + window.scrollY;

      setGhostStyle((prev) => prev ? {
        ...prev,
        top: state.currentY,
        left: (clientX ?? event.clientX) - state.offsetX,
      } : prev);

      setDropIndex(computeDropIndex(clientY));
      startAutoScroll(clientY);
    };

    const onUp = () => {
      const state = dragStateRef.current;
      if (!state.active) return;
      state.active = false;
      stopAutoScroll();

      setGhostStyle(null);
      setDropIndex((di) => {
        if (di !== null && di !== state.fromIndex) {
          const reordered = [...categories];
          const [removed] = reordered.splice(state.fromIndex, 1);
          reordered.splice(di, 0, removed);
          onReorderCategories(reordered);
        }
        return null;
      });
      setDragIndex(null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopAutoScroll();
    };
  }, [dragIndex, categories, computeDropIndex, startAutoScroll, stopAutoScroll, onReorderCategories]);


  return (
    <div className="fade-up">
      {activeEditCategory && (
        <CategoryEditModal
          editVal={editVal}
          onEditValueChange={onEditValueChange}
          onSave={() => onSaveEdit(activeEditCategory.id)}
          onCancel={onCancelEdit}
        />
      )}

      <div
        style={{
          fontSize: "12px",
          color: C.textLight,
          letterSpacing: "2px",
          marginBottom: "14px",
          fontWeight: 600,
        }}
      >
        BUDGET CATEGORIES
      </div>

      <div style={{ marginBottom: "16px" }}>
        <button
          className="add-cat-btn"
          onClick={onOpenAddCategory}
          style={{
            width: "100%",
            background: C.surface,
            border: `1.5px dashed ${C.blueMid}`,
            color: C.blue,
            padding: "15px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.15s",
          }}
        >
          + Add Category
        </button>
      </div>

      {categories.length > 0 && (
        <div
          ref={listRef}
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1.5px solid ${C.border}`,
            boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
            userSelect: "none",
          }}
        >
          {categories.map((category, index) => {
            const budget = parseFloat(category.amount) || 0;
            const spent = spentByCategory[category.id] || 0;
            const remaining = budget - spent;
            const categoryPct =
              budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const categoryBarColor =
              categoryPct > 90 ? C.red : categoryPct > 70 ? C.orange : C.blue;
            const overBudget = remaining < 0;
            const nearLimit = !overBudget && remaining < budget * 0.1;
            const remainingColor = overBudget
              ? C.red
              : nearLimit
                ? C.orange
                : C.green;

            const isDragging = dragIndex === index;
            const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index;

            return (
              <div
                key={category.id}
                className="cat-row cat-drag-row"
                onClick={() => { if (dragIndex === null) onStartEdit(category); }}
                style={{
                  padding: "14px 18px 14px 8px",
                  background: isDropTarget ? C.blueLight : index % 2 === 0 ? C.surface : C.surfaceAlt,
                  borderBottom: index < categories.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.15s, opacity 0.15s, transform 0.15s",
                  animation: dragIndex === null ? `fadeUp 0.25s ease ${index * 0.04}s both` : "none",
                  cursor: isDragging ? "grabbing" : "pointer",
                  opacity: isDragging ? 0.35 : 1,
                  outline: isDropTarget ? `2px solid ${C.blue}` : "none",
                  outlineOffset: "-2px",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* Drag handle */}
                  <div
                    style={{
                      flexShrink: 0,
                      color: C.textLight,
                      cursor: isDragging ? "grabbing" : "grab",
                      padding: "6px 4px",
                      display: "flex",
                      alignItems: "center",
                      touchAction: "none",
                      opacity: 0.5,
                      transition: "opacity 0.15s",
                    }}
                    onPointerDown={(e) => handlePointerDown(e, index)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to reorder"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                  <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
                    <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={C.border}
                        strokeWidth="4"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke={categoryBarColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={113.1}
                        strokeDashoffset={113.1 - (Math.min(categoryPct, 100) / 100) * 113.1}
                        style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: categoryBarColor,
                    }}>
                      {Math.round(categoryPct)}%
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: "15px",
                          fontWeight: 600,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {category.name}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: C.text,
                          flexShrink: 0,
                        }}
                      >
                        ${formatCurrency(budget)}
                      </div>
                      <button
                        className="cat-add-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          inlineCatId === category.id
                            ? onCloseInline()
                            : onOpenInline(category.id);
                        }}
                        title={`Add to ${category.name}`}
                        style={{
                          flexShrink: 0,
                          background:
                            inlineCatId === category.id ? C.gold : C.goldLight,
                          border: `1.5px solid ${
                            inlineCatId === category.id ? C.gold : "#f5d68a"
                          }`,
                          color: inlineCatId === category.id ? C.white : C.goldDark,
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          fontSize: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {inlineCatId === category.id ? "x" : "+"}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteCategory(category);
                        }}
                        title={`Delete ${category.name}`}
                        aria-label={`Delete ${category.name}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.textLight,
                          cursor: "pointer",
                          padding: "4px 6px",
                          borderRadius: "5px",
                          transition: "color 0.15s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 3H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 7L8 19C8.1 20.1 8.9 21 10 21H14C15.1 21 15.9 20.1 16 19L17 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 11V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14 11V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: C.textLight }}>
                        spent{" "}
                        <span style={{ color: C.textMid, fontWeight: 600 }}>
                          ${formatCurrency(spent)}
                        </span>
                      </span>
                      <span style={{ fontSize: "12px", color: remainingColor, fontWeight: 700 }}>
                        {remaining >= 0
                          ? `$${formatCurrency(remaining)} left`
                          : `$${formatCurrency(Math.abs(remaining))} over`}
                      </span>
                    </div>
                  </div>
                  </div>{/* end inner flex */}
                </div>{/* end outer flex */}

                {inlineCatId === category.id && (
                  <div
                    className="slide-down"
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      marginTop: "14px",
                      paddingTop: "14px",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "9px",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <input
                          ref={inlineNameRef}
                          placeholder="What was this for?"
                          value={inlineTx.name}
                          onChange={(event) =>
                            onInlineNameChange(event.target.value)
                          }
                          onKeyDown={(event) =>
                            event.key === "Enter" &&
                            onSubmitInline(category.id)
                          }
                          style={inputStyle}
                        />
                        {inlineAutocomplete.length > 0 && (
                          <div
                            className="slide-down"
                            style={{
                              position: "absolute",
                              top: "calc(100% + 4px)",
                              left: 0,
                              right: 0,
                              background: C.surface,
                              border: `1.5px solid ${C.border}`,
                              borderRadius: "8px",
                              overflow: "hidden",
                              zIndex: 30,
                              boxShadow: "0 8px 24px rgba(30,80,212,0.12)",
                            }}
                          >
                            {inlineAutocomplete.map((name) => (
                              <div
                                key={name}
                                className="ac-item"
                                onClick={() => onPickInlineSuggestion(name)}
                                style={{
                                  padding: "10px 14px",
                                  fontSize: "14px",
                                  color: C.textMid,
                                  cursor: "pointer",
                                  transition: "background 0.1s",
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                {name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: C.surface,
                            border: `1.5px solid ${C.border}`,
                            borderRadius: "8px",
                            padding: "0 12px",
                            flex: 1,
                            gap: "5px",
                          }}
                        >
                          <span style={{ color: C.textLight, fontWeight: 600 }}>
                            $
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={inlineTx.amount}
                            onChange={(event) =>
                              onInlineAmountChange(event.target.value)
                            }
                            onKeyDown={(event) =>
                              event.key === "Enter" &&
                              onSubmitInline(category.id)
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: C.text,
                              fontSize: "15px",
                              padding: "11px 0",
                              width: "100%",
                              minWidth: 0,
                            }}
                          />
                        </div>
                        <button
                          onClick={() => onSubmitInline(category.id)}
                          style={{
                            flexShrink: 0,
                            background: C.gold,
                            border: "none",
                            color: C.white,
                            padding: "11px 20px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 700,
                            transition: "opacity 0.15s",
                          }}
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}



      {categories.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: C.textLight,
            fontSize: "14px",
            padding: "32px 0",
          }}
        >
          No categories yet - add one above
        </div>
      )}

      {/* Ghost card — floats under finger/cursor while dragging */}
      {ghostStyle && dragIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: ghostStyle.top,
              left: ghostStyle.left,
              width: ghostStyle.width,
              height: ghostStyle.height,
              zIndex: 9999,
              pointerEvents: "none",
              transform: "rotate(1.5deg) scale(1.03)",
              transformOrigin: "top left",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25), 0 6px 20px rgba(30,80,212,0.15)",
              borderRadius: "10px",
              border: `2px solid ${C.blue}`,
              overflow: "hidden",
              background: C.surface,
              opacity: 0.97,
              transition: "box-shadow 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "14px 18px 14px 8px",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* Handle */}
              <div style={{ flexShrink: 0, padding: "6px 4px", color: C.blue, display: "flex", alignItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                {/* Circular progress ring */}
                {(() => {
                  const cat = categories[dragIndex];
                  const budget = parseFloat(cat?.amount) || 0;
                  const spent = spentByCategory[cat?.id] || 0;
                  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                  const barColor = pct > 90 ? C.red : pct > 70 ? C.orange : C.blue;
                  return (
                    <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
                      <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="22" cy="22" r="18" fill="none" stroke={C.border} strokeWidth="4"/>
                        <circle cx="22" cy="22" r="18" fill="none" stroke={barColor} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={113.1} strokeDashoffset={113.1 - (pct / 100) * 113.1}/>
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: barColor }}>
                        {Math.round(pct)}%
                      </div>
                    </div>
                  );
                })()}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {categories[dragIndex]?.name}
                  </div>
                  <div style={{ fontSize: "13px", color: C.textLight, marginTop: "2px" }}>
                    ${formatCurrency(parseFloat(categories[dragIndex]?.amount) || 0)} budget
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}
