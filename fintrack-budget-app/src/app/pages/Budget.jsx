import { useOutletContext } from "react-router-dom";
import BudgetTab from "../components/tabs/BudgetTab";

export default function Budget() {
  const context = useOutletContext();
  
  return (
    <BudgetTab
      incomeSectionRef={context.incomeSectionRef}
      incomeCategories={context.incomeCategories}
      earnedByCategory={context.earnedByCategory}
      onAddIncomeCategory={context.addIncomeCategory}
      onDeleteIncomeCategory={context.deleteIncomeCategory}
      onUpdateIncomeCategory={context.updateIncomeCategory}
      onOpenAddIncome={() => context.setShowAddIncomeModal(true)}
      categories={context.data.categories}
      spentByCategory={context.spentByCategory}
      editingId={context.editingId}
      editVal={context.editVal}
      inlineCatId={context.inlineCatId}
      inlineTx={context.inlineTx}
      inlineAutocomplete={context.inlineAutocomplete}
      quickTx={context.quickTx}
      quickAutocomplete={context.quickAutocomplete}
      showQuickAdd={context.showQuickAdd}
      formatCurrency={context.formatCurrency}
      onEditValueChange={context.setEditVal}
      onStartEdit={context.startEdit}
      onSaveEdit={context.saveEdit}
      onCancelEdit={() => context.setEditingId(null)}
      onDeleteCategory={context.deleteCategory}
      onOpenInline={context.openInline}
      onCloseInline={context.closeInline}
      inlineNameRef={context.inlineNameRef}
      onInlineNameChange={context.handleInlineNameChange}
      onPickInlineSuggestion={context.pickInlineSuggestion}
      onInlineAmountChange={(value) =>
        context.setInlineTx((current) => ({ ...current, amount: value }))
      }
      onSubmitInline={context.submitInline}
      onOpenAddCategory={() => context.setShowAddCategoryModal(true)}
      quickNameRef={context.quickNameRef}
      onOpenQuickAdd={context.openQuickAdd}
      onCloseQuickAdd={context.resetQuickAdd}
      onQuickNameChange={context.handleQuickNameChange}
      onPickQuickSuggestion={context.pickQuickSuggestion}
      onQuickAmountChange={(value) =>
        context.setQuickTx((current) => ({ ...current, amount: value }))
      }
      onQuickCategoryChange={(value) =>
        context.setQuickTx((current) => ({ ...current, categoryId: value }))
      }
      onSubmitQuickAdd={context.submitQuickAdd}
      onReorderCategories={(reordered) => {
        context.setData((prev) => ({ ...prev, categories: reordered }));
      }}
      onReorderIncomeCategories={(reordered) => {
        context.setData((prev) => ({ ...prev, incomeCategories: reordered }));
      }}
    />
  );
}
