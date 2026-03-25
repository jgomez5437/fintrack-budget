import { useOutletContext } from "react-router-dom";
import TransactionsTab from "../components/TransactionsTab";

export default function Transactions() {
  const context = useOutletContext();

  return (
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
    />
  );
}
