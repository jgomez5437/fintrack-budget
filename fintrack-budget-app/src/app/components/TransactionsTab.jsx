import { C } from "../constants";
import { inputStyle, selectStyle } from "../styles";

export default function TransactionsTab({
  categories,
  transactions,
  spentByCategory,
  formatCurrency,
  getCategoryById,
  importError,
  isImportDragActive,
  fileInputRef,
  showTxForm,
  newTx,
  autocomplete,
  nameInputRef,
  onOpenImportPicker,
  onImportDragOver,
  onImportDragLeave,
  onImportDrop,
  onOpenTxForm,
  onCloseTxForm,
  onNameChange,
  onPickSuggestion,
  onNewTransactionChange,
  onAddTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
}) {
  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "stretch" }}>
        <button
          className="import-btn"
          onClick={onOpenImportPicker}
          onDragOver={onImportDragOver}
          onDragLeave={onImportDragLeave}
          onDrop={onImportDrop}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: isImportDragActive ? C.blueLight : C.white,
            border: `1.5px dashed ${isImportDragActive ? C.blue : C.blueMid}`,
            color: isImportDragActive ? C.text : C.textMid,
            padding: "14px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.15s",
            boxShadow: isImportDragActive ? "0 10px 28px rgba(30,80,212,0.16)" : "0 2px 8px rgba(30,80,212,0.06)",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.08em" }}>XLS</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: C.text, fontWeight: 700 }}>{isImportDragActive ? "Drop file to import" : "Import from Excel"}</div>
            <div style={{ fontSize: "12px", color: C.textLight, marginTop: "1px" }}>Drag and drop or click to upload your bank's .xlsx export</div>
          </div>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onOpenImportPicker} style={{ display: "none" }} />

      {importError && (
        <div style={{ background: C.redLight, border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: C.red, marginBottom: "14px", fontWeight: 500 }}>
          {importError}
        </div>
      )}

      {showTxForm ? (
        <div className="slide-down" style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(30,80,212,0.1)" }}>
          <div style={{ fontSize: "12px", color: C.textLight, letterSpacing: "2px", marginBottom: "16px", fontWeight: 600 }}>
            NEW TRANSACTION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <input
                ref={nameInputRef}
                placeholder="What was this for?"
                value={newTx.name}
                onChange={(event) => onNameChange(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && onAddTransaction()}
                style={inputStyle}
              />
              {autocomplete.length > 0 && (
                <div className="slide-down" style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", zIndex: 20, boxShadow: "0 8px 24px rgba(30,80,212,0.12)" }}>
                  {autocomplete.map((name) => (
                    <div key={name} className="ac-item" onClick={() => onPickSuggestion(name)} style={{ padding: "12px 16px", fontSize: "14px", color: C.textMid, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${C.border}` }}>
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0 14px", gap: "6px" }}>
              <span style={{ color: C.textLight, fontWeight: 600, fontSize: "16px" }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={newTx.amount}
                onChange={(event) => onNewTransactionChange({ ...newTx, amount: event.target.value })}
                onKeyDown={(event) => event.key === "Enter" && onAddTransaction()}
                style={{ background: "transparent", border: "none", color: C.text, fontSize: "16px", padding: "13px 0", width: "100%", minWidth: 0 }}
              />
            </div>

            <select value={newTx.categoryId} onChange={(event) => onNewTransactionChange({ ...newTx, categoryId: event.target.value })} style={selectStyle}>
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => {
                const spent = spentByCategory[category.id] || 0;
                const budget = parseFloat(category.amount) || 0;
                return (
                  <option key={category.id} value={category.id}>
                    {category.name} (${formatCurrency(budget - spent)} left)
                  </option>
                );
              })}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="primary-btn" onClick={onAddTransaction} style={{ flex: 1, background: C.blue, border: "none", color: C.white, padding: "14px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "background 0.15s" }}>
                ADD TRANSACTION
              </button>
              <button className="cancel-btn" onClick={onCloseTxForm} style={{ background: "transparent", border: `1.5px solid ${C.border}`, color: C.textMid, padding: "14px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "all 0.15s" }}>
                Cancel
              </button>
            </div>
          </div>

          {categories.length === 0 && (
            <div style={{ marginTop: "12px", fontSize: "13px", color: C.orange, textAlign: "center", fontWeight: 500 }}>
              Add budget categories first.
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <button className="log-btn" onClick={() => onOpenTxForm()} style={{ width: "100%", background: C.white, border: `1.5px solid ${C.border}`, color: C.text, padding: "16px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "block", transition: "all 0.15s", boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
            + Log Transaction Manually
          </button>
          {transactions.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "12px 16px", background: C.goldLight, border: "1px solid #f5d68a", borderRadius: "8px" }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>TIP</span>
              <span style={{ fontSize: "13px", color: C.goldDark, fontWeight: 500, lineHeight: "1.5" }}>
                Import from Excel above or press this button to add manually.
              </span>
            </div>
          )}
        </div>
      )}

      {transactions.length > 0 ? (
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
          {transactions.map((transaction, index) => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <div
                key={transaction.id}
                className="tx-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  background: index % 2 === 0 ? C.white : C.surfaceAlt,
                  borderBottom: index < transactions.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {transaction.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                    {category ? (
                      <span style={{ fontSize: "11px", color: C.blue, background: C.blueLight, padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                        {category.name}
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: C.textLight, background: C.surfaceAlt, padding: "2px 8px", borderRadius: "4px" }}>
                        Uncategorized
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: C.textLight }}>{transaction.date}</span>
                  </div>
                </div>

                <div style={{ fontSize: "15px", color: C.red, fontWeight: 700, flexShrink: 0 }}>
                  -${formatCurrency(parseFloat(transaction.amount))}
                </div>

                <div className="tx-actions" style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                  <button className="dupe-btn" onClick={() => onDuplicateTransaction(transaction)} title="Repeat" style={{ background: "transparent", border: "none", color: C.textLight, cursor: "pointer", fontSize: "16px", padding: "4px 7px", borderRadius: "5px", transition: "all 0.15s", lineHeight: 1 }}>
                    DUP
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(transaction)}
                    title="Delete transaction"
                    aria-label={`Delete ${transaction.name}`}
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
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 7L8 19C8.1 20.1 8.9 21 10 21H14C15.1 21 15.9 20.1 16 19L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "40px 0" }}>
          No transactions yet this month
        </div>
      )}
    </div>
  );
}
