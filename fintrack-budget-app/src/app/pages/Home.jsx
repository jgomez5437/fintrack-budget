import { useOutletContext } from "react-router-dom";
import SummaryCards from "../components/common/SummaryCards";
import CategoryAlertBanner from "../components/layout/CategoryAlertBanner";
import SkeletonDashboard from "../components/layout/SkeletonDashboard";
import { C } from "../constants";

export default function Home() {
  const {
    budgetLoaded,
    firstName,
    showUncategorizedAlert,
    uncategorizedTransactions,
    viewUncategorizedTransactions,
    categoryAlertItems,
    formatCurrency,
    weeklySummary,
    bannerDismissed,
    setBannerDismissed,
    setShowWeeklySummary,
    session,
    expectedSurplus,
    expectedSurplusPositive,
    income,
    projectedMonthEndSpent,
    totalPlanned,
    totalSpent,
    transactions,
    spendPct,
    barColor,
    data,
    editingSavings,
    savingsInput,
    savingsRef,
    startSavingsEdit,
    setSavingsInput,
    saveSavings,
    cancelSavingsEdit,
    scrollToIncome,
    getCategoryById,
  } = useOutletContext();

  if (!budgetLoaded) return <SkeletonDashboard />;

  return (
    <>
      {showUncategorizedAlert && (
        <div
          className="fade-up"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            marginBottom: "18px",
            background: C.goldLight,
            border: `1.5px solid ${C.gold}`,
            borderRadius: "14px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
              You have uncategorized transactions
            </div>
            <div style={{ fontSize: "12px", color: C.textMid, marginTop: "2px" }}>
              {uncategorizedTransactions.length} transaction{uncategorizedTransactions.length === 1 ? "" : "s"} need a category.
            </div>
          </div>
          <button
            onClick={viewUncategorizedTransactions}
            style={{
              background: C.blue,
              border: "none",
              color: C.white,
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            View
          </button>
        </div>
      )}

      <CategoryAlertBanner
        alerts={categoryAlertItems}
        formatCurrency={formatCurrency}
        onDismiss={() => {}} // Handle in context if needed
      />

      {firstName && (
        <div className="fade-up" style={{
          fontSize: "26px",
          fontWeight: 800,
          color: C.text,
          marginBottom: "24px",
          fontFamily: "'Playfair Display', serif"
        }}>
          Welcome, {firstName}
        </div>
      )}

      {weeklySummary && !bannerDismissed && (
        <div
          className="fade-up"
          onClick={() => {
            const dismissKey = `weekly-banner-dismissed-${session?.user?.id}-${weeklySummary.generated_on}`;
            localStorage.setItem(dismissKey, '1');
            setBannerDismissed(true);
            setShowWeeklySummary(true);
          }}
          style={{
            cursor: "pointer",
            marginBottom: "16px",
            padding: "12px 16px",
            background: `linear-gradient(90deg, ${C.blue} 0%, #6366f1 100%)`,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 16px rgba(30,80,212,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" stroke="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.white }}>
              Your weekly summary is ready →
            </span>
          </div>
        </div>
      )}

      <SummaryCards
        onScrollToIncome={scrollToIncome}
        expectedSurplus={expectedSurplus}
        expectedSurplusPositive={expectedSurplusPositive}
        income={income}
        projectedMonthEndSpent={projectedMonthEndSpent}
        totalPlanned={totalPlanned}
        totalSpent={totalSpent}
        transactionCount={transactions.length}
        formatCurrency={formatCurrency}
        spendPct={spendPct}
        barColor={barColor}
        currentSavings={data.currentSavings || ""}
        editingSavings={editingSavings}
        savingsInput={savingsInput}
        savingsRef={savingsRef}
        onStartSavingsEdit={startSavingsEdit}
        onSavingsInputChange={setSavingsInput}
        onSaveSavings={saveSavings}
        onCancelSavingsEdit={cancelSavingsEdit}
        onOpenWeeklySummary={() => setShowWeeklySummary(true)}
        hasWeeklySummary={Boolean(weeklySummary)}
        transactions={transactions}
        getCategoryById={getCategoryById}
      />
    </>
  );
}
