import { C } from "../constants";
import CategoryEditModal from "./CategoryEditModal";
import { inputStyle, selectStyle } from "../styles";

export default function BudgetTab({
  categories,
  spentByCategory,
  editingId,
  editVal,
  inlineCatId,
  inlineTx,
  inlineAutocomplete,
  quickTx,
  quickAutocomplete,
  showQuickAdd,
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
  quickNameRef,
  onOpenQuickAdd,
  onCloseQuickAdd,
  onQuickNameChange,
  onPickQuickSuggestion,
  onQuickAmountChange,
  onQuickCategoryChange,
  onSubmitQuickAdd,
}) {
  const activeEditCategory = categories.find((category) => category.id === editingId);

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
            background: C.white,
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
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1.5px solid ${C.border}`,
            boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
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

            return (
              <div
                key={category.id}
                className="cat-row"
                onClick={() => onStartEdit(category)}
                style={{
                  padding: "14px 18px",
                  background: index % 2 === 0 ? C.white : C.surfaceAlt,
                  borderBottom:
                    index < categories.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                  transition: "background 0.15s",
                  animation: `fadeUp 0.25s ease ${index * 0.04}s both`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                </div>

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
                              background: C.white,
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
                            background: C.white,
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
    </div>
  );
}
