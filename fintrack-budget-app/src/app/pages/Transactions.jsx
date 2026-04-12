import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import TransactionsTab from "../components/tabs/TransactionsTab";
import RecurringTab from "../components/tabs/RecurringTab";
import { C } from "../constants";

export default function Transactions() {
  const context = useOutletContext();
  const [internalTab, setInternalTab] = useState("transactions");

  return (
    <>
      <div 
        style={{
          display: "flex",
          background: C.surfaceAlt,
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: `1px solid ${C.border}`,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
        }}
      >
        <button
          onClick={() => setInternalTab("transactions")}
          style={{
            flex: 1,
            padding: "8px 0",
            background: internalTab === "transactions" ? C.surface : "transparent",
            color: internalTab === "transactions" ? C.text : C.textLight,
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: internalTab === "transactions" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s"
          }}
        >
          Transactions
        </button>
        <button
          onClick={() => setInternalTab("recurring")}
          style={{
            flex: 1,
            padding: "8px 0",
            background: internalTab === "recurring" ? C.surface : "transparent",
            color: internalTab === "recurring" ? C.text : C.textLight,
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: internalTab === "recurring" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s"
          }}
        >
          Recurring
        </button>
      </div>

      {internalTab === "transactions" ? (
        <TransactionsTab
          categories={context.data.categories}
          incomeCategories={context.incomeCategories}
          transactions={context.transactions}
          uncategorizedTransactions={context.uncategorizedTransactions}
          showUncategorizedSection={context.showUncategorizedSection}
          uncategorizedAssignments={context.uncategorizedAssignments}
          uncategorizedSaveSuccess={context.uncategorizedSaveSuccess}
          selectedTransactionIds={context.selectedTransactionIds}
          spentByCategory={context.spentByCategory}
          formatCurrency={context.formatCurrency}
          getCategoryById={context.getCategoryById}
          importError={context.importError}
          isImportDragActive={context.isImportDragActive}
          mostRecentImportedTransactionLabel={context.mostRecentImportedTransactionLabel}
          fileInputRef={context.fileInputRef}
          showTxForm={context.showTxForm}
          newTx={context.newTx}
          autocomplete={context.autocomplete}
          nameInputRef={context.nameInputRef}
          onOpenImportPicker={context.triggerImportPicker}
          onImportDragOver={context.handleImportDragOver}
          onImportDragLeave={context.handleImportDragLeave}
          onImportDrop={context.handleImportDrop}
          onOpenTxForm={context.openTxForm}
          onCloseTxForm={context.closeTxForm}
          onNameChange={context.handleNameChange}
          onPickSuggestion={context.pickSuggestion}
          onNewTransactionChange={context.setNewTx}
          onAddTransaction={context.addTransaction}
          onDeleteTransaction={context.deleteTransaction}
          onToggleTransactionSelection={context.toggleTransactionSelection}
          onToggleAllTransactions={context.toggleAllTransactions}
          onClearSelections={() => context.setSelectedTransactionIds([])}
          onDeleteSelectedTransactions={context.deleteSelectedTransactions}
          onUpdateTransactionCategory={context.updateTransactionCategory}
          onAssignSelectedTransactions={context.assignSelectedTransactionsToCategory}
          onUncategorizedAssignmentChange={context.updateUncategorizedAssignment}
          onSaveUncategorizedAssignments={context.saveUncategorizedAssignments}
          onToggleRecurring={context.toggleRecurring}
          recurring={context.data.recurring || []}
        />
      ) : (
        <RecurringTab 
          recurring={context.data.recurring || []} 
          formatCurrency={context.formatCurrency}
          getCategoryById={context.getCategoryById}
        />
      )}
    </>
  );
}
