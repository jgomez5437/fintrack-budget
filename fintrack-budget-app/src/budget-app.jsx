import { useCallback, useEffect, useRef, useState } from "react";
import { C, defaultData } from "./app/constants";
import { buildBudgetSummary, getCategoryById } from "./app/utils/budget";
import { formatCurrency, todayLabel } from "./app/utils/formatters";
import { parseImportFile } from "./app/services/importTransactions";
import { getStorage } from "./app/services/storage";
import {
  getCurrentSession,
  isSupabaseConfigured,
  onAuthStateChange,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "./app/services/supabase";
import GlobalStyles from "./app/components/GlobalStyles";
import AuthScreen from "./app/components/AuthScreen";
import Header from "./app/components/Header";
import SummaryCards from "./app/components/SummaryCards";
import SpendProgress from "./app/components/SpendProgress";
import TabSwitcher from "./app/components/TabSwitcher";
import BudgetTab from "./app/components/BudgetTab";
import TransactionsTab from "./app/components/TransactionsTab";
import ImportReviewModal from "./app/components/ImportReviewModal";

export default function BudgetApp() {
  const storage = getStorage();
  const now = new Date();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [signOutPending, setSignOutPending] = useState(false);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState(() => defaultData());
  const [newCat, setNewCat] = useState({ name: "", amount: "" });
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [activeTab, setActiveTab] = useState("budget");
  const [showTxForm, setShowTxForm] = useState(false);
  const [newTx, setNewTx] = useState({ name: "", amount: "", categoryId: "" });
  const [autocomplete, setAutocomplete] = useState([]);
  const [lastCategoryId, setLastCategoryId] = useState("");
  const [inlineCatId, setInlineCatId] = useState(null);
  const [inlineTx, setInlineTx] = useState({ name: "", amount: "" });
  const [inlineAutocomplete, setInlineAutocomplete] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTx, setQuickTx] = useState({ name: "", amount: "", categoryId: "" });
  const [quickAutocomplete, setQuickAutocomplete] = useState([]);
  const [importRows, setImportRows] = useState(null);
  const [importError, setImportError] = useState("");
  const [isImportDragActive, setIsImportDragActive] = useState(false);

  const incomeRef = useRef(null);
  const nameInputRef = useRef(null);
  const inlineNameRef = useRef(null);
  const quickNameRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setAuthLoading(false);
        return;
      }

      try {
        const nextSession = await getCurrentSession();
        if (isMounted) {
          setSession(nextSession);
          setAuthError("");
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(error.message || "Unable to start authentication.");
        }
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    loadSession();

    const { data: listener } = onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setAuthLoading(false);
      setAuthSubmitting(false);
      setSignOutPending(false);
      setAuthError("");
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading || !session) return;

    async function loadBudget() {
      try {
        const result = await storage.get(`budget-${month}-${year}`);
        if (result) {
          setData({ ...defaultData(), ...JSON.parse(result.value) });
          return;
        }
        setData(defaultData());
      } catch {
        setData(defaultData());
      }
    }

    loadBudget();
  }, [authLoading, month, year, session, storage]);

  useEffect(() => {
    if (authLoading || !session) return;

    async function loadPreference() {
      try {
        const result = await storage.get("fintrack-last-cat");
        if (result) setLastCategoryId(result.value);
      } catch {
        // Ignore preference storage failures.
      }
    }

    loadPreference();
  }, [authLoading, session, storage]);

  const persist = useCallback(
    async (nextData) => {
      try {
        await storage.set(`budget-${month}-${year}`, JSON.stringify(nextData));
      } catch {
        // Ignore persistence failures to keep the UI responsive.
      }
    },
    [month, year, storage],
  );

  const update = useCallback(
    (nextData) => {
      setData(nextData);
      persist(nextData);
    },
    [persist],
  );

  const {
    income,
    transactions,
    spentByCategory,
    totalSpent,
    leftover,
    spendPct,
    leftoverPositive,
    barColor,
    pastNames,
  } = buildBudgetSummary(data);

  const getSuggestions = useCallback(
    (value, limit) =>
      value.length >= 1
        ? pastNames
            .filter(
              (name) =>
                name.toLowerCase().includes(value.toLowerCase()) &&
                name.toLowerCase() !== value.toLowerCase(),
            )
            .slice(0, limit)
        : [],
    [pastNames],
  );

  const rememberCategory = useCallback(
    (id) => {
      setLastCategoryId(id);
      try {
        storage.set("fintrack-last-cat", id);
      } catch {
        // Ignore preference write failures.
      }
    },
    [storage],
  );

  const handleAuthAction = useCallback(async (action, credentials) => {
    setAuthSubmitting(true);
    setAuthError("");

    try {
      await action(credentials);
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
      setAuthSubmitting(false);
    }
  }, []);

  const handleSignIn = useCallback(
    async (credentials) => handleAuthAction(signInWithEmail, credentials),
    [handleAuthAction],
  );

  const handleSignUp = useCallback(
    async (credentials) => handleAuthAction(signUpWithEmail, credentials),
    [handleAuthAction],
  );

  const handleSignOut = useCallback(async () => {
    setSignOutPending(true);
    setAuthError("");

    try {
      await signOutUser();
      setData(defaultData());
      setLastCategoryId("");
      setImportRows(null);
      setImportError("");
    } catch (error) {
      setAuthError(error.message || "Unable to sign out right now.");
      setSignOutPending(false);
    }
  }, []);

  const addCategory = () => {
    if (!newCat.name.trim() || !newCat.amount) return;

    update({
      ...data,
      categories: [
        ...data.categories,
        { id: Date.now(), name: newCat.name.trim(), amount: newCat.amount },
      ],
    });
    setNewCat({ name: "", amount: "" });
  };

  const deleteCategory = (id) => {
    update({
      ...data,
      categories: data.categories.filter((category) => category.id !== id),
      transactions: transactions.filter((transaction) => transaction.categoryId !== id),
    });
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditVal({ name: category.name, amount: category.amount });
  };

  const saveEdit = (id) => {
    if (!editVal.name.trim() || !editVal.amount) return;

    update({
      ...data,
      categories: data.categories.map((category) =>
        category.id === id ? { ...category, ...editVal } : category,
      ),
    });
    setEditingId(null);
  };

  const startIncomeEdit = () => {
    setIncomeInput(data.income);
    setEditingIncome(true);
    setTimeout(() => incomeRef.current?.focus(), 50);
  };

  const saveIncome = () => {
    update({ ...data, income: incomeInput });
    setEditingIncome(false);
  };

  const cancelIncomeEdit = () => {
    setEditingIncome(false);
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
      return;
    }
    setMonth((current) => current - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
      return;
    }
    setMonth((current) => current + 1);
  };

  const openTxForm = (prefill = {}) => {
    setNewTx({
      name: prefill.name || "",
      amount: prefill.amount || "",
      categoryId:
        prefill.categoryId ||
        lastCategoryId ||
        data.categories[0]?.id?.toString() ||
        "",
    });
    setAutocomplete([]);
    setShowTxForm(true);
    setTimeout(() => nameInputRef.current?.focus(), 60);
  };

  const closeTxForm = () => {
    setShowTxForm(false);
    setNewTx({ name: "", amount: "", categoryId: "" });
    setAutocomplete([]);
  };

  const handleNameChange = (value) => {
    setNewTx((current) => ({ ...current, name: value }));
    setAutocomplete(getSuggestions(value, 5));
  };

  const pickSuggestion = (name) => {
    const last = transactions.find((transaction) => transaction.name === name);
    setNewTx((current) => ({
      ...current,
      name,
      amount: last?.amount || current.amount,
      categoryId: last?.categoryId?.toString() || current.categoryId,
    }));
    setAutocomplete([]);
  };

  const addTransaction = () => {
    if (!newTx.name.trim() || !newTx.amount || !newTx.categoryId) return;

    const transaction = {
      id: Date.now(),
      name: newTx.name.trim(),
      amount: newTx.amount,
      categoryId: parseInt(newTx.categoryId, 10),
      date: todayLabel(),
    };

    update({ ...data, transactions: [transaction, ...transactions] });
    rememberCategory(newTx.categoryId);
    closeTxForm();
  };

  const deleteTransaction = (id) => {
    update({
      ...data,
      transactions: transactions.filter((transaction) => transaction.id !== id),
    });
  };

  const duplicateTransaction = (transaction) => {
    openTxForm({
      name: transaction.name,
      amount: transaction.amount,
      categoryId: transaction.categoryId?.toString(),
    });
  };

  const openInline = (categoryId) => {
    setInlineCatId(categoryId);
    setInlineTx({ name: "", amount: "" });
    setInlineAutocomplete([]);
    setTimeout(() => inlineNameRef.current?.focus(), 60);
  };

  const closeInline = () => {
    setInlineCatId(null);
    setInlineTx({ name: "", amount: "" });
    setInlineAutocomplete([]);
  };

  const handleInlineNameChange = (value) => {
    setInlineTx((current) => ({ ...current, name: value }));
    setInlineAutocomplete(getSuggestions(value, 4));
  };

  const pickInlineSuggestion = (name) => {
    const last = transactions.find((transaction) => transaction.name === name);
    setInlineTx((current) => ({
      ...current,
      name,
      amount: last?.amount || current.amount,
    }));
    setInlineAutocomplete([]);
  };

  const submitInline = (categoryId) => {
    if (!inlineTx.name.trim() || !inlineTx.amount) return;

    const transaction = {
      id: Date.now(),
      name: inlineTx.name.trim(),
      amount: inlineTx.amount,
      categoryId: parseInt(categoryId, 10),
      date: todayLabel(),
    };

    update({ ...data, transactions: [transaction, ...transactions] });
    rememberCategory(categoryId.toString());
    closeInline();
  };

  const resetQuickAdd = () => {
    setShowQuickAdd(false);
    setQuickTx({ name: "", amount: "", categoryId: "" });
    setQuickAutocomplete([]);
  };

  const openQuickAdd = () => {
    setQuickTx({
      name: "",
      amount: "",
      categoryId: lastCategoryId || data.categories[0]?.id?.toString() || "",
    });
    setShowQuickAdd(true);
    setTimeout(() => quickNameRef.current?.focus(), 60);
  };

  const handleQuickNameChange = (value) => {
    setQuickTx((current) => ({ ...current, name: value }));
    setQuickAutocomplete(getSuggestions(value, 4));
  };

  const pickQuickSuggestion = (name) => {
    const last = transactions.find((transaction) => transaction.name === name);
    setQuickTx((current) => ({
      ...current,
      name,
      amount: last?.amount || current.amount,
      categoryId: last?.categoryId?.toString() || current.categoryId,
    }));
    setQuickAutocomplete([]);
  };

  const submitQuickAdd = () => {
    if (!quickTx.name.trim() || !quickTx.amount || !quickTx.categoryId) return;

    const transaction = {
      id: Date.now(),
      name: quickTx.name.trim(),
      amount: quickTx.amount,
      categoryId: parseInt(quickTx.categoryId, 10),
      date: todayLabel(),
    };

    update({ ...data, transactions: [transaction, ...transactions] });
    rememberCategory(quickTx.categoryId);
    resetQuickAdd();
  };

  const handleImportSelection = async (file) => {
    if (!file) return;

    setImportError("");
    try {
      const parsedRows = await parseImportFile(file);
      setImportRows(parsedRows);
    } catch (error) {
      setImportError(error.message);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    await handleImportSelection(file);
    event.target.value = "";
  };

  const triggerImportPicker = (event) => {
    if (event?.target?.files) {
      handleImportFile(event);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImportDragOver = (event) => {
    event.preventDefault();
    setIsImportDragActive(true);
  };

  const handleImportDragLeave = (event) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setIsImportDragActive(false);
  };

  const handleImportDrop = async (event) => {
    event.preventDefault();
    setIsImportDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await handleImportSelection(file);
  };

  const updateImportRow = (id, field, value) => {
    setImportRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const deleteImportRow = (id) => {
    setImportRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const confirmImport = () => {
    const transactionsToAdd = importRows
      .filter((row) => row.include && row.name.trim() && row.amount)
      .map((row) => ({
        id: Date.now() + Math.random(),
        name: row.name.trim(),
        amount: row.amount,
        categoryId: row.categoryId ? parseInt(row.categoryId, 10) : null,
        date: row.date,
      }));

    update({ ...data, transactions: [...transactionsToAdd, ...transactions] });
    setImportRows(null);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "grid",
          placeItems: "center",
          padding: "24px",
          fontFamily: "'DM Sans', sans-serif",
          color: C.text,
        }}
      >
        <GlobalStyles />
        <div
          style={{
            maxWidth: "520px",
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 18px 48px rgba(15,28,77,0.08)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px" }}>Supabase Setup Needed</h1>
          <p style={{ margin: "12px 0 0", lineHeight: 1.7 }}>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your
            local environment and Vercel project settings before loading FinTrack.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "grid",
          placeItems: "center",
          fontFamily: "'DM Sans', sans-serif",
          color: C.text,
        }}
      >
        <GlobalStyles />
        <div style={{ fontSize: "16px", fontWeight: 700 }}>Loading your FinTrack account...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <GlobalStyles />
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={authSubmitting}
          authError={authError}
        />
      </>
    );
  }

  if (importRows) {
    return (
      <>
        <GlobalStyles />
        <ImportReviewModal
          categories={data.categories}
          importRows={importRows}
          onCancel={() => setImportRows(null)}
          onConfirm={confirmImport}
          onUpdateRow={updateImportRow}
          onDeleteRow={deleteImportRow}
        />
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', sans-serif",
        color: C.text,
      }}
    >
      <GlobalStyles />

      <Header
        month={month}
        year={year}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        userEmail={session.user.email}
        onSignOut={handleSignOut}
        isSigningOut={signOutPending}
      />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 20px 60px" }}>
        <SummaryCards
          editingIncome={editingIncome}
          income={income}
          incomeInput={incomeInput}
          incomeRef={incomeRef}
          leftover={leftover}
          leftoverPositive={leftoverPositive}
          onStartIncomeEdit={startIncomeEdit}
          onIncomeInputChange={setIncomeInput}
          onSaveIncome={saveIncome}
          onCancelIncomeEdit={cancelIncomeEdit}
          totalSpent={totalSpent}
          transactionCount={transactions.length}
          formatCurrency={formatCurrency}
        />

        <SpendProgress income={income} spendPct={spendPct} barColor={barColor} />

        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "budget" ? (
          <BudgetTab
            categories={data.categories}
            spentByCategory={spentByCategory}
            editingId={editingId}
            editVal={editVal}
            inlineCatId={inlineCatId}
            inlineTx={inlineTx}
            inlineAutocomplete={inlineAutocomplete}
            newCat={newCat}
            quickTx={quickTx}
            quickAutocomplete={quickAutocomplete}
            showQuickAdd={showQuickAdd}
            formatCurrency={formatCurrency}
            onEditValueChange={setEditVal}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={() => setEditingId(null)}
            onDeleteCategory={deleteCategory}
            onOpenInline={openInline}
            onCloseInline={closeInline}
            inlineNameRef={inlineNameRef}
            onInlineNameChange={handleInlineNameChange}
            onPickInlineSuggestion={pickInlineSuggestion}
            onInlineAmountChange={(value) =>
              setInlineTx((current) => ({ ...current, amount: value }))
            }
            onSubmitInline={submitInline}
            onNewCategoryChange={setNewCat}
            onAddCategory={addCategory}
            quickNameRef={quickNameRef}
            onOpenQuickAdd={openQuickAdd}
            onCloseQuickAdd={resetQuickAdd}
            onQuickNameChange={handleQuickNameChange}
            onPickQuickSuggestion={pickQuickSuggestion}
            onQuickAmountChange={(value) =>
              setQuickTx((current) => ({ ...current, amount: value }))
            }
            onQuickCategoryChange={(value) =>
              setQuickTx((current) => ({ ...current, categoryId: value }))
            }
            onSubmitQuickAdd={submitQuickAdd}
          />
        ) : (
          <TransactionsTab
            categories={data.categories}
            transactions={transactions}
            spentByCategory={spentByCategory}
            formatCurrency={formatCurrency}
            getCategoryById={(id) => getCategoryById(data.categories, id)}
            importError={importError}
            isImportDragActive={isImportDragActive}
            fileInputRef={fileInputRef}
            showTxForm={showTxForm}
            newTx={newTx}
            autocomplete={autocomplete}
            nameInputRef={nameInputRef}
            onOpenImportPicker={triggerImportPicker}
            onImportDragOver={handleImportDragOver}
            onImportDragLeave={handleImportDragLeave}
            onImportDrop={handleImportDrop}
            onOpenTxForm={openTxForm}
            onCloseTxForm={closeTxForm}
            onNameChange={handleNameChange}
            onPickSuggestion={pickSuggestion}
            onNewTransactionChange={setNewTx}
            onAddTransaction={addTransaction}
            onDuplicateTransaction={duplicateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}
      </div>
    </div>
  );
}
