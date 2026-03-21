import { useEffect, useState } from "react";
import { C } from "../constants";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { inputStyle, selectStyle } from "../styles";

export default function TransactionsTab({
  categories,
  transactions,
  selectedTransactionIds,
  spentByCategory,
  formatCurrency,
  getCategoryById,
  importError,
  isImportDragActive,
  mostRecentImportedTransactionLabel,
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
  onDeleteTransaction,
  onToggleTransactionSelection,
  onToggleAllTransactions,
  onDeleteSelectedTransactions,
  onUpdateTransactionCategory,
  onAssignSelectedTransactions,
}) {
  const selectedCount = selectedTransactionIds.length;
  const allSelected = transactions.length > 0 && selectedCount === transactions.length;
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("__none__");

  useEffect(() => {
    if (!activeTransaction) return;

    const latestTransaction = transactions.find(
      (transaction) => transaction.id === activeTransaction.id,
    );

    if (!latestTransaction) {
      setActiveTransaction(null);
      setActiveCategoryId("");
      return;
    }

    setActiveTransaction(latestTransaction);
    setActiveCategoryId(latestTransaction.categoryId?.toString() || "");
  }, [activeTransaction, transactions]);

  const openTransactionDetails = (transaction) => {
    setActiveTransaction(transaction);
    setActiveCategoryId(transaction.categoryId?.toString() || "");
  };

  const closeTransactionDetails = () => {
    setActiveTransaction(null);
    setActiveCategoryId("");
  };

  const saveTransactionCategory = () => {
    if (!activeTransaction) return;
    onUpdateTransactionCategory(activeTransaction.id, activeCategoryId);
    closeTransactionDetails();
  };

  const assignSelectedTransactions = () => {
    if (selectedCount === 0 || bulkCategoryId === "__none__") return;

    onAssignSelectedTransactions(bulkCategoryId);
    setBulkCategoryId("__none__");
  };

  return (
    <div className="fade-up">
      {activeTransaction && (
        <TransactionDetailsModal
          transaction={activeTransaction}
          categories={categories}
          categoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
          onSave={saveTransactionCategory}
          onClose={closeTransactionDetails}
        />
      )}

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

      {mostRecentImportedTransactionLabel && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            background: C.white,
            border: `1.5px solid ${C.border}`,
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
            fontSize: "13px",
            color: C.textMid,
            fontWeight: 600,
          }}
        >
          Most Recent Transactions: {mostRecentImportedTransactionLabel}
        </div>
      )}

      {transactions.length > 0 ? (
        <div style={{ borderRadius: "12px", overflow: "hidden", border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(30,80,212,0.06)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "12px 14px",
              background: C.white,
              borderBottom: `1px solid ${C.border}`,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: C.text,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAllTransactions}
                  className="modern-checkbox"
                  style={{ cursor: "pointer" }}
                />
                Select All
              </label>
              <span style={{ fontSize: "13px", color: C.textLight, fontWeight: 600 }}>
                {selectedCount} selected
              </span>
            </div>

            {selectedCount > 0 && (
              <div
                className="tx-bulk-actions"
                style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
              >
                <select
                  value={bulkCategoryId}
                  onChange={(event) => setBulkCategoryId(event.target.value)}
                  style={{
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    color: bulkCategoryId === "__none__" ? C.textLight : C.text,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    minWidth: "150px",
                    cursor: "pointer",
                  }}
                >
                  <option value="__none__">Choose category</option>
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="tx-bulk-buttons" style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={assignSelectedTransactions}
                    disabled={bulkCategoryId === "__none__"}
                    style={{
                      background: bulkCategoryId === "__none__" ? C.surfaceAlt : C.blue,
                      border: "none",
                      color: bulkCategoryId === "__none__" ? C.textLight : C.white,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      cursor: bulkCategoryId === "__none__" ? "default" : "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                      opacity: bulkCategoryId === "__none__" ? 0.7 : 1,
                    }}
                  >
                    Assign
                  </button>

                  <button
                    onClick={onDeleteSelectedTransactions}
                    style={{
                      background: C.red,
                      border: "none",
                      color: C.white,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            {transactions.map((transaction, index) => {
              const category = getCategoryById(transaction.categoryId);
              const isSelected = selectedTransactionIds.includes(transaction.id);
              return (
                <div
                  key={transaction.id}
                  className="tx-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    background: isSelected
                      ? C.blueLight
                      : index % 2 === 0
                        ? C.white
                        : C.surfaceAlt,
                    borderBottom: index < transactions.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background 0.15s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleTransactionSelection(transaction.id)}
                    aria-label={`Select ${transaction.name}`}
                    className="modern-checkbox"
                    style={{ cursor: "pointer", flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => openTransactionDetails(transaction)}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 600,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {transaction.name}
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                      {category ? (
                        <button
                          onClick={() => openTransactionDetails(transaction)}
                          style={{
                            fontSize: "11px",
                            color: C.blue,
                            background: C.blueLight,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {category.name}
                        </button>
                      ) : (
                        <button
                          onClick={() => openTransactionDetails(transaction)}
                          style={{
                            fontSize: "11px",
                            color: C.textLight,
                            background: C.surfaceAlt,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Uncategorized
                        </button>
                      )}
                      <button
                        onClick={() => openTransactionDetails(transaction)}
                        style={{
                          fontSize: "11px",
                          color: C.textLight,
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        {transaction.date}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "15px", color: C.red, fontWeight: 700, flexShrink: 0 }}>
                    -${formatCurrency(parseFloat(transaction.amount))}
                  </div>

                  <div className="tx-actions" style={{ display: "flex", alignItems: "center", gap: "2px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
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
        </div>
      ) : (
        <div style={{ textAlign: "center", color: C.textLight, fontSize: "14px", padding: "40px 0" }}>
          No transactions yet this month
        </div>
      )}
    </div>
  );
}
