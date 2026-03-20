import { C } from "../constants";
import { inputStyle, selectStyle } from "../styles";

export default function BudgetTab({
  categories,
  spentByCategory,
  editingId,
  editVal,
  inlineCatId,
  inlineTx,
  inlineAutocomplete,
  newCat,
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
  onNewCategoryChange,
  onAddCategory,
  quickNameRef,
  onOpenQuickAdd,
  onCloseQuickAdd,
  onQuickNameChange,
  onPickQuickSuggestion,
  onQuickAmountChange,
  onQuickCategoryChange,
  onSubmitQuickAdd,
}) {
  return (
    <div className="fade-up">
      <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "14px", fontWeight: 600 }}>
        BUDGET CATEGORIES
      </div>

      {categories.length > 0 && (
        <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
          {categories.map((category, index) => {
            const budget = parseFloat(category.amount) || 0;
            const spent = spentByCategory[category.id] || 0;
            const remaining = budget - spent;
            const categoryPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const categoryBarColor = categoryPct > 90 ? C.red : categoryPct > 70 ? C.orange : C.blue;
            const overBudget = remaining < 0;
            const nearLimit = !overBudget && remaining < budget * 0.1;
            const remainingColor = overBudget ? C.red : nearLimit ? C.orange : C.green;

            return (
              <div
                key={category.id}
                className="cat-row"
                style={{
                  padding: "14px 18px",
                  background: index % 2 === 0 ? C.white : C.surfaceAlt,
                  borderBottom: index < categories.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.15s",
                  animation: `fadeUp 0.25s ease ${index * 0.04}s both`,
                }}
              >
                {editingId === category.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      value={editVal.name}
                      onChange={(event) => onEditValueChange({ ...editVal, name: event.target.value })}
                      onKeyDown={(event) => event.key === "Enter" && onSaveEdit(category.id)}
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                    />
                    <span style={{ color: C.textLight }}>$</span>
                    <input
                      type="number"
                      value={editVal.amount}
                      onChange={(event) => onEditValueChange({ ...editVal, amount: event.target.value })}
                      onKeyDown={(event) => event.key === "Enter" && onSaveEdit(category.id)}
                      style={{ ...inputStyle, width: "90px" }}
                    />
                    <button className="save-btn" onClick={() => onSaveEdit(category.id)} style={{ background: C.greenLight, border: `1.5px solid ${C.green}`, color: C.green, padding: "8px 14px", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.15s", flexShrink: 0 }}>
                      SAVE
                    </button>
                    <button onClick={onCancelEdit} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "24px", padding: "0 4px", lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ flex: 1, minWidth: 0, fontSize: "15px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {category.name}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, flexShrink: 0 }}>${formatCurrency(budget)}</div>
                      <button
                        className="cat-add-btn"
                        onClick={() => (inlineCatId === category.id ? onCloseInline() : onOpenInline(category.id))}
                        title={`Add to ${category.name}`}
                        style={{
                          flexShrink: 0,
                          background: inlineCatId === category.id ? C.gold : C.goldLight,
                          border: `1.5px solid ${inlineCatId === category.id ? C.gold : "#f5d68a"}`,
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
                        {inlineCatId === category.id ? "×" : "+"}
                      </button>
                      <div className="row-actions" style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                        <button className="edit-lbl" onClick={() => onStartEdit(category)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", padding: "5px 7px", transition: "color 0.15s" }}>
                          EDIT
                        </button>
                        <button className="del-btn" onClick={() => onDeleteCategory(category.id)} style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "22px", padding: "0 4px", transition: "color 0.15s", lineHeight: 1 }}>
                          ×
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: C.textLight }}>
                        spent <span style={{ color: C.textMid, fontWeight: 600 }}>${formatCurrency(spent)}</span>
                      </span>
                      <span style={{ fontSize: "12px", color: remainingColor, fontWeight: 700 }}>
                        {remaining >= 0 ? `$${formatCurrency(remaining)} left` : `$${formatCurrency(Math.abs(remaining))} over`}
                      </span>
                    </div>

                    <div style={{ background: C.border, borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                      <div className="mini-bar-fill" style={{ width: `${categoryPct}%`, height: "100%", background: categoryBarColor, borderRadius: "4px" }} />
                    </div>

                    {inlineCatId === category.id && (
                      <div className="slide-down" style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                          <div style={{ position: "relative" }}>
                            <input
                              ref={inlineNameRef}
                              placeholder="What was this for?"
                              value={inlineTx.name}
                              onChange={(event) => onInlineNameChange(event.target.value)}
                              onKeyDown={(event) => event.key === "Enter" && onSubmitInline(category.id)}
                              style={inputStyle}
                            />
                            {inlineAutocomplete.length > 0 && (
                              <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 30, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                                {inlineAutocomplete.map((name) => (
                                  <div key={name} className="ac-item" onClick={() => onPickInlineSuggestion(name)} style={{ padding: "10px 14px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>
                                    {name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 12px", flex: 1, gap: "5px" }}>
                              <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={inlineTx.amount}
                                onChange={(event) => onInlineAmountChange(event.target.value)}
                                onKeyDown={(event) => event.key === "Enter" && onSubmitInline(category.id)}
                                style={{ background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "11px 0", width: "100%", minWidth: 0 }}
                              />
                            </div>
                            <button onClick={() => onSubmitInline(category.id)} style={{ flexShrink: 0, background: C.gold, border: "none", color: C.white, padding: "11px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "opacity 0.15s" }}>
                              ADD
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "stretch", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
        <input
          placeholder="New category name"
          value={newCat.name}
          onChange={(event) => onNewCategoryChange({ ...newCat, name: event.target.value })}
          onKeyDown={(event) => event.key === "Enter" && onAddCategory()}
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "14px 16px" }}
        />
        <div style={{ display: "flex", alignItems: "center", borderLeft: `1px solid ${C.border}`, padding: "0 10px", flexShrink: 0, gap: "4px" }}>
          <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
          <input
            type="number"
            placeholder="0.00"
            value={newCat.amount}
            onChange={(event) => onNewCategoryChange({ ...newCat, amount: event.target.value })}
            onKeyDown={(event) => event.key === "Enter" && onAddCategory()}
            style={{ width: "76px", background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "14px 0" }}
          />
        </div>
        <button className="add-cat-btn" onClick={onAddCategory} style={{ flexShrink: 0, background: C.blueLight, border: "none", borderLeft: `1px solid ${C.border}`, color: C.blue, padding: "14px 18px", cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap" }}>
          + ADD
        </button>
      </div>

      {categories.length > 0 &&
        (showQuickAdd ? (
          <div className="slide-down" style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "12px", padding: "18px", boxShadow: "0 4px 16px rgba(30,80,212,0.1)" }}>
            <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "12px", fontWeight: 600 }}>
              LOG TRANSACTION
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <input
                  ref={quickNameRef}
                  placeholder="What was this for?"
                  value={quickTx.name}
                  onChange={(event) => onQuickNameChange(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && onSubmitQuickAdd()}
                  style={inputStyle}
                />
                {quickAutocomplete.length > 0 && (
                  <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 20, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                    {quickAutocomplete.map((name) => (
                      <div key={name} className="ac-item" onClick={() => onPickQuickSuggestion(name)} style={{ padding: "11px 16px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 12px", flex: 1, gap: "5px" }}>
                  <span style={{ color: C.textLight, fontWeight: 600 }}>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={quickTx.amount}
                    onChange={(event) => onQuickAmountChange(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && onSubmitQuickAdd()}
                    style={{ background: "transparent", border: "none", color: C.text, fontSize: "15px", padding: "12px 0", width: "100%", minWidth: 0 }}
                  />
                </div>
                <select value={quickTx.categoryId} onChange={(event) => onQuickCategoryChange(event.target.value)} style={{ ...selectStyle, flex: 1 }}>
                  <option value="" disabled>
                    Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="primary-btn" onClick={onSubmitQuickAdd} style={{ flex: 1, background: C.blue, border: "none", color: C.white, padding: "13px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "background 0.15s" }}>
                  ADD
                </button>
                <button className="cancel-btn" onClick={onCloseQuickAdd} style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.textMid, padding: "13px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.15s" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="log-btn" onClick={onOpenQuickAdd} style={{ width: "100%", background: C.white, border: `1.5px dashed ${C.blueMid}`, color: C.blue, padding: "15px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.15s" }}>
            + Log Transaction
          </button>
        ))}

      {categories.length === 0 && (
        <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "32px 0" }}>
          No categories yet - add one above
        </div>
      )}
    </div>
  );
}
