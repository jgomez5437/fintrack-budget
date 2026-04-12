import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { C } from "../../../app/constants";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { inputStyle, selectStyle } from "../../../app/styles";

export default function TransactionsTab({
  categories,
  incomeCategories = [],
  transactions,
  uncategorizedTransactions,
  showUncategorizedSection,
  uncategorizedAssignments,
  uncategorizedSaveSuccess,
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
  onClearSelections,
  onDeleteSelectedTransactions,
  onUpdateTransactionCategory,
  onAssignSelectedTransactions,
  onUncategorizedAssignmentChange,
  onSaveUncategorizedAssignments,
  recurring,
  onToggleRecurring,
}) {
  const selectedCount = selectedTransactionIds.length;
  const allSelected = transactions.length > 0 && selectedCount === transactions.length;
  const allUncategorizedAssigned =
    uncategorizedTransactions.length > 0 &&
    uncategorizedTransactions.every((transaction) => uncategorizedAssignments[transaction.id]);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("__none__");
  const [isMobileSelectionMode, setIsMobileSelectionMode] = useState(false);
  const [showFloatingBulk, setShowFloatingBulk] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const isSelectionMode = isMobileSelectionMode || selectedCount > 0;
  const [isManualSplit, setIsManualSplit] = useState(false);
  const [manualSplit1, setManualSplit1] = useState({ categoryId: "", amount: "" });
  const [manualSplit2, setManualSplit2] = useState({ categoryId: "", amount: "" });

  const filteredTransactions = filterCategoryId
    ? transactions.filter((t) => (filterCategoryId === "__uncategorized__" ? !t.categoryId : String(t.categoryId) === filterCategoryId))
    : transactions;
  const longPressTimerRef = useRef(null);
  const hasLongPressedRef = useRef(false);
  const topSectionRef = useRef(null);

  useEffect(() => {
    if (!topSectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setShowFloatingBulk(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(topSectionRef.current);
    return () => observer.disconnect();
  }, [transactions.length]);

  const startLongPress = (id) => {
    hasLongPressedRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      hasLongPressedRef.current = true;
      setIsMobileSelectionMode(true);
      if (!selectedTransactionIds.includes(id)) {
        onToggleTransactionSelection(id);
      }
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const cancelSelectionMode = () => {
    setIsMobileSelectionMode(false);
    if (onClearSelections) onClearSelections();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showTxForm) {
          if (onCloseTxForm) onCloseTxForm();
        } else if (isSelectionMode) {
          cancelSelectionMode();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTxForm, isSelectionMode, onCloseTxForm]);

  const handleTransactionClick = (transaction) => {
    if (hasLongPressedRef.current) {
      hasLongPressedRef.current = false;
      return;
    }
    openTransactionDetails(transaction);
  };

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

  const saveTransactionCategory = (splitData) => {
    if (!activeTransaction) return;
    if (splitData && splitData.isSplit) {
      onUpdateTransactionCategory(activeTransaction.id, null, splitData);
    } else {
      onUpdateTransactionCategory(activeTransaction.id, activeCategoryId, splitData);
    }
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
          incomeCategories={incomeCategories}
          categoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
          onSave={saveTransactionCategory}
          onClose={closeTransactionDetails}
          formatCurrency={formatCurrency}
          recurring={recurring}
          onToggleRecurring={onToggleRecurring}
        />
      )}

      {showUncategorizedSection && (
        <div
          className="fade-up"
          style={{
            position: "relative",
            marginBottom: "20px",
            background: C.surface,
            border: `1.5px solid ${uncategorizedSaveSuccess ? C.green : C.blueMid}`,
            borderRadius: "18px",
            padding: "18px",
            boxShadow: uncategorizedSaveSuccess
              ? "0 14px 30px rgba(22,163,74,0.18)"
              : "0 8px 24px rgba(30,80,212,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "12px",
                color: uncategorizedSaveSuccess ? C.green : C.textLight,
                letterSpacing: "2px",
                marginBottom: "6px",
                fontWeight: 700,
              }}
            >
              UNCATEGORIZED REVIEW
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>
              Assign categories to these transactions
            </div>
            <div style={{ fontSize: "13px", color: C.textMid, marginTop: "4px" }}>
              Choose a category for each uncategorized transaction, then save them all at once.
            </div>
          </div>

          {!uncategorizedSaveSuccess && (
            <>
              <div style={{ display: "grid", gap: "10px" }}>
                {uncategorizedTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId);
                  return (
                  <div
                    key={transaction.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 180px",
                      gap: "12px",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: transaction.isSplit ? C.blue : (category ? C.blueMid : C.textLight),
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {transaction.isSplit ? (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M7 7l5 5-5 5M13 7l5 5-5 5" />
                            </svg>
                            <span>
                              {transaction.splits?.map((s, i) => {
                                const cat = getCategoryById(s.categoryId);
                                return (cat?.name || "Uncategorized") + (i < transaction.splits.length - 1 ? " + " : "");
                              })}
                            </span>
                          </>
                        ) : (
                          category?.name || "Uncategorized"
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {transaction.name}
                      </div>
                      <div style={{ fontSize: "12px", color: C.textMid, marginTop: "3px" }}>
                        {transaction.date} | <span style={{ color: parseFloat(transaction.amount) < 0 ? C.green : C.text, fontWeight: 700 }}>
                          {parseFloat(transaction.amount) < 0 ? "+" : ""}${formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                        </span>
                      </div>
                    </div>

                    <select
                      value={uncategorizedAssignments[transaction.id] || ""}
                      onChange={(event) =>
                        onUncategorizedAssignmentChange(transaction.id, event.target.value)
                      }
                      style={selectStyle}
                    >
                      <option value="">Choose category</option>
                      {parseFloat(transaction.amount) < 0 && (
                        <optgroup label="Income Sources">
                          {incomeCategories.map((ic) => (
                            <option key={ic.id} value={ic.id}>
                              {ic.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label={parseFloat(transaction.amount) < 0 ? "Refunds (Categories)" : "Budget Categories"}>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                );})}
              </div>

              <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={onSaveUncategorizedAssignments}
                  disabled={!allUncategorizedAssigned}
                  style={{
                    background: allUncategorizedAssigned ? C.blue : C.surfaceAlt,
                    border: "none",
                    color: allUncategorizedAssigned ? C.white : C.textLight,
                    padding: "12px 18px",
                    borderRadius: "10px",
                    cursor: allUncategorizedAssigned ? "pointer" : "default",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Save
                </button>
              </div>
            </>
          )}

          {uncategorizedSaveSuccess && (
            <div
              style={{
                display: "grid",
                placeItems: "center",
                minHeight: "220px",
                textAlign: "center",
                color: C.green,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                    <circle cx="48" cy="48" r="44" fill={C.greenLight} />
                    <path
                      d="M28 49L41 62L68 35"
                      stroke={C.green}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "10px" }}>
                  Uncategorized transactions saved
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onOpenImportPicker}
        style={{ display: "none" }}
      />

      {importError && (
        <div
          style={{
            background: C.redLight,
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            color: C.red,
            marginBottom: "14px",
            fontWeight: 500,
          }}
        >
          {importError}
        </div>
      )}

      {showTxForm ? (
        <div
          className="slide-down"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 16px rgba(30,80,212,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: C.textLight,
              letterSpacing: "2px",
              marginBottom: "16px",
              fontWeight: 600,
            }}
          >
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
                    zIndex: 20,
                    boxShadow: "0 8px 24px rgba(30,80,212,0.12)",
                  }}
                >
                  {autocomplete.map((name) => (
                    <div
                      key={name}
                      className="ac-item"
                      onClick={() => onPickSuggestion(name)}
                      style={{
                        padding: "12px 16px",
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: "8px",
                padding: "0 14px",
                gap: "6px",
              }}
            >
              <span style={{ color: C.textLight, fontWeight: 600, fontSize: "16px" }}>$</span>
              <input
                type="number"
                placeholder="0.00"
                value={newTx.amount}
                onChange={(event) =>
                  onNewTransactionChange({ ...newTx, amount: event.target.value })
                }
                onFocus={(e) => e.target.select()}
                onKeyDown={(event) => event.key === "Enter" && onAddTransaction()}
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.text,
                  fontSize: "16px",
                  padding: "13px 0",
                  width: "100%",
                  minWidth: 0,
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>CATEGORY</div>
              <button
                onClick={() => setIsManualSplit(!isManualSplit)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.blue,
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {isManualSplit ? "Cancel Split" : "Split Transaction"}
              </button>
            </div>

            {!isManualSplit ? (
              <select
                value={newTx.categoryId}
                onChange={(event) =>
                  onNewTransactionChange({ ...newTx, categoryId: event.target.value })
                }
                style={selectStyle}
              >
                <option value="">Category (Optional)</option>
                  <optgroup label="Income Sources">
                    {incomeCategories.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.name}
                      </option>
                    ))}
                  </optgroup>
                <optgroup label="Budget Categories">
                  {categories.map((category) => {
                    const budgetAmt = parseFloat(category.amount) || 0;
                    const spentAmt = spentByCategory[category.id] || 0;
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name} (${formatCurrency(budgetAmt - spentAmt)} left)
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "8px" }}>
                  <select
                    value={manualSplit1.categoryId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setManualSplit1(prev => {
                        const next = { ...prev, categoryId: cid };
                        if (!next.amount) {
                          const total = parseFloat(newTx.amount) || 0;
                          const half = (total / 2).toFixed(2);
                          next.amount = half;
                          setManualSplit2(s2 => ({ ...s2, amount: (total - parseFloat(half)).toFixed(2) }));
                        }
                        return next;
                      });
                    }}
                    style={selectStyle}
                  >
                    <option value="">Category 1</option>
                    <optgroup label="Income Sources">
                      {incomeCategories.map(ic => <option key={ic.id} value={ic.id}>{ic.name}</option>)}
                    </optgroup>
                    <optgroup label="Budget Categories">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  </select>
                  <input
                    type="number"
                    placeholder="Amt"
                    value={manualSplit1.amount}
                    onChange={(e) => {
                      const total = parseFloat(newTx.amount) || 0;
                      const val = e.target.value;
                      const amt1 = parseFloat(val) || 0;
                      setManualSplit1(prev => ({ ...prev, amount: val }));
                      setManualSplit2(prev => ({ ...prev, amount: (total - amt1).toFixed(2) }));
                    }}
                    onFocus={(e) => e.target.select()}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "8px" }}>
                  <select
                    value={manualSplit2.categoryId}
                    onChange={(e) => setManualSplit2(prev => ({ ...prev, categoryId: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">Category 2</option>
                    <optgroup label="Income Sources">
                      {incomeCategories.map(ic => <option key={ic.id} value={ic.id}>{ic.name}</option>)}
                    </optgroup>
                    <optgroup label="Budget Categories">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  </select>
                  <input
                    type="number"
                    placeholder="Amt"
                    value={manualSplit2.amount}
                    onChange={(e) => {
                      const total = parseFloat(newTx.amount) || 0;
                      const val = e.target.value;
                      const amt2 = parseFloat(val) || 0;
                      setManualSplit2(prev => ({ ...prev, amount: val }));
                      setManualSplit1(prev => ({ ...prev, amount: (total - amt2).toFixed(2) }));
                    }}
                    onFocus={(e) => e.target.select()}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="primary-btn"
                onClick={() => {
                  if (isManualSplit) {
                    if (!manualSplit1.categoryId || !manualSplit2.categoryId) {
                      alert("Please select both categories for the split.");
                      return;
                    }
                    const s1a = parseFloat(manualSplit1.amount) || 0;
                    const s2a = parseFloat(manualSplit2.amount) || 0;
                    const total = parseFloat(newTx.amount) || 0;
                    if (Math.abs(s1a + s2a - total) > 0.01) {
                      alert("Split amounts must equal the total.");
                      return;
                    }
                    onAddTransaction({
                      isSplit: true,
                      splits: [
                        { categoryId: parseInt(manualSplit1.categoryId, 10), amount: s1a },
                        { categoryId: parseInt(manualSplit2.categoryId, 10), amount: s2a }
                      ]
                    });
                    setIsManualSplit(false);
                    setManualSplit1({ categoryId: "", amount: "" });
                    setManualSplit2({ categoryId: "", amount: "" });
                  } else {
                    onAddTransaction();
                  }
                }}
                style={{
                  flex: 1,
                  background: C.blue,
                  border: "none",
                  color: C.white,
                  padding: "14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 700,
                  transition: "background 0.15s",
                }}
              >
                ADD TRANSACTION
              </button>
              <button
                className="cancel-btn"
                onClick={onCloseTxForm}
                style={{
                  background: "transparent",
                  border: `1.5px solid ${C.border}`,
                  color: C.textMid,
                  padding: "14px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {categories.length === 0 && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: C.orange,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              Add budget categories first.
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <button
            className="log-btn"
            onClick={() => onOpenTxForm()}
            style={{
              width: "100%",
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              color: C.text,
              padding: "16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              display: "block",
              transition: "all 0.15s",
              boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
            }}
          >
            + Log Transaction Manually
          </button>
          {transactions.length === 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "12px",
                padding: "12px 16px",
                background: C.goldLight,
                border: "1px solid #f5d68a",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>TIP</span>
              <span
                style={{
                  fontSize: "13px",
                  color: C.goldDark,
                  fontWeight: 500,
                  lineHeight: "1.5",
                }}
              >
                Import from Excel above or press this button to add manually.
              </span>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginBottom: "16px",
          padding: "10px 14px",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: mostRecentImportedTransactionLabel ? "space-between" : "flex-end",
          gap: "8px",
        }}
      >
        {mostRecentImportedTransactionLabel && (
          <span style={{ fontSize: "13px", color: C.textMid, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Most Recent: {mostRecentImportedTransactionLabel}
          </span>
        )}
        <button
          className="import-btn"
          onClick={onOpenImportPicker}
          onDragOver={onImportDragOver}
          onDragLeave={onImportDragLeave}
          onDrop={onImportDrop}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: isImportDragActive ? C.blue : C.blueLight,
            border: `1.5px solid ${C.blueMid}`,
            color: isImportDragActive ? C.white : C.blue,
            padding: "7px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {isImportDragActive ? "Drop here" : "Import Excel"}
        </button>
      </div>

      {selectedCount > 0 && showFloatingBulk && typeof document !== "undefined" && createPortal(
        <div
          className="show-btn-mobile slide-down"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "20px",
            right: "20px",
            background: C.surface,
            borderRadius: "18px",
            padding: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            border: `1px solid ${C.borderHover}`,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.text, paddingLeft: "4px" }}>
              {selectedCount} selected
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", width: "100%", alignItems: "stretch" }}>
            <select
              value={bulkCategoryId}
              onChange={(e) => setBulkCategoryId(e.target.value)}
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: bulkCategoryId === "__none__" ? C.textLight : C.text,
                padding: "8px",
                borderRadius: "10px",
                fontSize: "13px",
                minWidth: "0",
                flex: 1,
                cursor: "pointer",
                outline: "none"
              }}
            >
               <option value="__none__">Category</option>
               <option value="">Uncategorized</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button
              onClick={assignSelectedTransactions}
              disabled={bulkCategoryId === "__none__"}
              style={{
                background: bulkCategoryId === "__none__" ? C.surfaceAlt : C.blue,
                color: bulkCategoryId === "__none__" ? C.textLight : C.white,
                border: "none",
                borderRadius: "10px",
                padding: "0 12px",
                fontWeight: 700,
                opacity: bulkCategoryId === "__none__" ? 0.7 : 1,
                cursor: bulkCategoryId === "__none__" ? "not-allowed" : "pointer",
                fontSize: "13px"
              }}
            >
              Assign
            </button>
            <button
              onClick={onDeleteSelectedTransactions}
              style={{ background: C.red, color: C.white, border: "none", borderRadius: "10px", padding: "0 12px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
            >
              Del
            </button>
            <button
               onClick={cancelSelectionMode}
               style={{ background: C.redLight, border: 'none', color: C.red, fontWeight: 700, fontSize: "13px", cursor: "pointer", padding: "0 12px", borderRadius: "10px" }}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {transactions.length > 0 ? (
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: `1.5px solid ${C.border}`,
            boxShadow: "0 2px 8px rgba(30,80,212,0.06)",
          }}
        >
          <div
            ref={topSectionRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "12px 14px",
              background: C.surface,
              borderBottom: `1px solid ${C.border}`,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
              <label
                className={!isSelectionMode ? "hide-chk-mobile" : ""}
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

              {!isSelectionMode && (
                <button
                  className="show-btn-mobile"
                  onClick={() => setIsMobileSelectionMode(true)}
                  style={{
                    background: "transparent",
                    border: `1.5px solid ${C.border}`,
                    color: C.textMid,
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: "5px 11px",
                    borderRadius: "999px",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  Select Transactions
                </button>
              )}

              <span 
                className={!isSelectionMode ? "hide-chk-mobile" : ""}
                style={{ fontSize: "13px", color: C.textLight, fontWeight: 600 }}
              >
                {selectedCount} selected
              </span>
            </div>

            {/* Filter button — always visible on the right */}
            {!isSelectionMode && (
              <button
                onClick={() => setShowFilterDropdown((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  background: filterCategoryId ? C.blue : "transparent",
                  border: `1.5px solid ${filterCategoryId ? C.blue : C.border}`,
                  color: filterCategoryId ? C.white : C.textMid,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "5px 11px",
                  borderRadius: "999px",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="7" y1="12" x2="17" y2="12"/>
                  <line x1="10" y1="18" x2="14" y2="18"/>
                </svg>
                {filterCategoryId ? "Filtered" : "Filter"}
              </button>
            )}

            {isSelectionMode && (
              <button
                className="show-btn-mobile"
                onClick={cancelSelectionMode}
                style={{
                  background: C.redLight,
                  border: "none",
                  color: C.red,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginLeft: "auto",
                }}
              >
                Cancel
              </button>
            )}

            {selectedCount > 0 && (
              <div
                className="tx-bulk-actions"
                style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
              >
                <select
                  value={bulkCategoryId}
                  onChange={(event) => setBulkCategoryId(event.target.value)}
                  style={{
                    background: C.surface,
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
                  <optgroup label="Income Sources">
                    {incomeCategories.map((ic) => (
                      <option key={ic.id} value={ic.id}>{ic.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Budget Categories">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </optgroup>
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

          {/* Filter dropdown */}
          {showFilterDropdown && (
            <div
              className="slide-down"
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${C.border}`,
                background: C.surfaceAlt,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.textLight, flexShrink: 0 }}>Filter by:</span>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                style={{
                  flex: 1,
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  color: filterCategoryId ? C.text : C.textLight,
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">All Categories</option>
                <option value="__uncategorized__">Uncategorized</option>
                <optgroup label="Income Sources">
                  {incomeCategories.map((ic) => (
                    <option key={ic.id} value={ic.id}>{ic.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Budget Categories">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              </select>
              {filterCategoryId && (
                <button
                  onClick={() => { setFilterCategoryId(""); }}
                  style={{
                    flexShrink: 0,
                    background: "transparent",
                    border: "none",
                    color: C.red,
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div>
            {filteredTransactions.map((transaction, index) => {
              const category = getCategoryById(transaction.categoryId);
              const isSelected = selectedTransactionIds.includes(transaction.id);
              return (
                <div
                  key={transaction.id}
                  className="tx-row"
                  onTouchStart={() => startLongPress(transaction.id)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  onMouseDown={() => startLongPress(transaction.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    background: isSelected
                      ? C.blueLight
                      : index % 2 === 0
                        ? C.surface
                        : C.surfaceAlt,
                    borderBottom:
                      index < filteredTransactions.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background 0.15s",
                    userSelect: "none",
                    WebkitUserSelect: "none"
                  }}
                >
                  <div
                    className={!isSelectionMode ? "hide-chk-mobile" : ""}
                    style={{ flexShrink: 0, display: "flex" }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleTransactionSelection(transaction.id)}
                      aria-label={`Select ${transaction.name}`}
                      className="modern-checkbox"
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => handleTransactionClick(transaction)}
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "3px",
                        flexWrap: "wrap",
                      }}
                    >
                      {transaction.isSplit ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                          <span style={{ 
                            fontSize: "10px", 
                            color: C.blue, 
                            fontWeight: 800, 
                            background: C.blueLight, 
                            padding: "1px 5px", 
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px" 
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M7 7l5 5-5 5M13 7l5 5-5 5" />
                            </svg>
                            SPLIT
                          </span>
                          {transaction.splits?.map((s, i) => {
                            const cat = getCategoryById(s.categoryId);
                            return (
                              <button
                                key={i}
                                onClick={() => handleTransactionClick(transaction)}
                                style={{
                                  fontSize: "10px",
                                  color: C.textMid,
                                  background: C.surfaceAlt,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: 600,
                                  border: `1px solid ${C.border}`,
                                  cursor: "pointer",
                                }}
                              >
                                {cat?.name || "Uncategorized"}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        category ? (
                          <button
                            onClick={() => handleTransactionClick(transaction)}
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
                            onClick={() => handleTransactionClick(transaction)}
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
                        )
                      )}
                      <button
                        onClick={() => handleTransactionClick(transaction)}
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

                  <div style={{ 
                    fontSize: "15px", 
                    color: parseFloat(transaction.amount) < 0 ? C.green : C.red, 
                    fontWeight: 700, 
                    flexShrink: 0 
                  }}>
                    {parseFloat(transaction.amount) < 0 ? "+" : ""}${formatCurrency(Math.abs(parseFloat(transaction.amount)))}
                  </div>

                  <div
                    className="tx-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      flexShrink: 0,
                    }}
                  >
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
                        <path
                          d="M7 7L8 19C8.1 20.1 8.9 21 10 21H14C15.1 21 15.9 20.1 16 19L17 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
