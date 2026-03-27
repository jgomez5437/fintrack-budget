import { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import { C, defaultData } from "./app/constants";
import {
  buildBudgetSummary,
  getCategoryAlerts,
  getCategoryById,
} from "./app/utils/budget";
import { formatCurrency, todayLabel } from "./app/utils/formatters";
import { parseImportFile } from "./app/services/importTransactions";
import { autoAssignImportCategory } from "./app/utils/importCategoryRules";
import {
  CATEGORY_ALERT_COUNT_KEY,
  FIRST_NAME_KEY,
  getStorage,
} from "./app/services/storage";
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
import ImportReviewModal from "./app/components/ImportReviewModal";
import NextMonthPromptModal from "./app/components/NextMonthPromptModal";
import DeleteConfirmModal from "./app/components/DeleteConfirmModal";
import AddCategoryModal from "./app/components/AddCategoryModal";
import AddIncomeModal from "./app/components/AddIncomeModal";
import SkeletonDashboard from "./app/components/SkeletonDashboard";
import NamePromptModal from "./app/components/NamePromptModal";
import SettingsModal from "./app/components/SettingsModal";
import WeeklySummaryModal from "./app/components/WeeklySummaryModal";
import BottomNav from "./app/components/BottomNav";
import Home from "./app/pages/Home";
import Budget from "./app/pages/Budget";
import Transactions from "./app/pages/Transactions";
import Bills from "./app/pages/Bills";
import Tools from "./app/pages/Tools";
import ToolsMortgage from "./app/pages/ToolsMortgage";
import ToolsRetirement from "./app/pages/ToolsRetirement";
import ToolsDebt from "./app/pages/ToolsDebt";
import ToolsEmergency from "./app/pages/ToolsEmergency";
import {
  generateAndSaveSummary,
  getTodaysSummary,
  isSunday,
} from "./app/services/weeklySummary";

function getNextMonthTarget(month, year) {
  if (month === 11) {
    return { month: 0, year: year + 1 };
  }

  return { month: month + 1, year };
}

function getPreviousMonthTarget(month, year) {
  if (month === 0) {
    return { month: 11, year: year - 1 };
  }

  return { month: month - 1, year };
}

function cloneBudgetSetup(sourceData) {
  return {
    incomeCategories: (sourceData.incomeCategories || []).map((ic) => ({
      id: ic.id,
      name: ic.name,
      amount: ic.amount,
    })),
    categories: (sourceData.categories || []).map((category) => ({
      id: category.id,
      name: category.name,
      amount: category.amount,
    })),
    transactions: [],
    bills: sourceData.bills || [],
  };
}

export default function BudgetApp() {
  const storage = getStorage();
  const now = new Date();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("fintrack-theme") || "light";
  });
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [signOutPending, setSignOutPending] = useState(false);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [firstName, setFirstName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState(() => defaultData());
  const [newCat, setNewCat] = useState({ name: "", amount: "" });
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [newIncome, setNewIncome] = useState({ name: "", amount: "" });
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState("");
  const [editingSavings, setEditingSavings] = useState(false);
  const [savingsInput, setSavingsInput] = useState("");
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
  const [nextMonthPrompt, setNextMonthPrompt] = useState(null);
  const [isCreatingNextMonth, setIsCreatingNextMonth] = useState(false);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);
  const [budgetLoaded, setBudgetLoaded] = useState(false);
  const [authCycleReady, setAuthCycleReady] = useState(false);
  const [shouldShowCategoryAlert, setShouldShowCategoryAlert] = useState(false);
  const [categoryAlertItems, setCategoryAlertItems] = useState([]);
  const [categoryAlertEvaluated, setCategoryAlertEvaluated] = useState(false);
  const [showUncategorizedAlert, setShowUncategorizedAlert] = useState(false);
  const [uncategorizedAlertEvaluated, setUncategorizedAlertEvaluated] = useState(false);
  const [showUncategorizedSection, setShowUncategorizedSection] = useState(false);
  const [uncategorizedAssignments, setUncategorizedAssignments] = useState({});
  const [uncategorizedSaveSuccess, setUncategorizedSaveSuccess] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);       // today's row or null
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const incomeRef = useRef(null);
  const savingsRef = useRef(null);
  const nameInputRef = useRef(null);
  const inlineNameRef = useRef(null);
  const quickNameRef = useRef(null);
  const fileInputRef = useRef(null);
  const tabSwitcherRef = useRef(null);
  const authCycleRef = useRef({ userId: null, counted: false });
  const uncategorizedSuccessTimeoutRef = useRef(null);

  const saveData = useCallback(
    async (newData) => {
      setData(newData);
      if (session) {
        await storage.set(`budget-${month}-${year}`, JSON.stringify(newData));
      }
    },
    [session, storage, month, year],
  );

  const addIncomeCategory = useCallback(
    async (name, amount) => {
      const newIncomeCategories = [
        ...data.incomeCategories,
        { id: Date.now(), name, amount: Number(amount) },
      ];
      await saveData({ ...data, incomeCategories: newIncomeCategories });
    },
    [data, saveData],
  );

  const deleteIncomeCategory = useCallback(
    async (id) => {
      const newIncomeCategories = data.incomeCategories.filter((ic) => ic.id !== id);
      await saveData({ ...data, incomeCategories: newIncomeCategories });
    },
    [data, saveData],
  );

  const updateIncomeCategory = useCallback(
    async (id, name, amount) => {
      const newIncomeCategories = data.incomeCategories.map((ic) =>
        ic.id === id ? { ...ic, name, amount: Number(amount) } : ic,
      );
      await saveData({ ...data, incomeCategories: newIncomeCategories });
    },
    [data, saveData],
  );

  const scrollToIncome = useCallback(() => {
    setActiveTab("budget");
    setTimeout(() => {
      incomeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  const {
    expectedSurplus,
    expectedSurplusPositive,
    income,
    incomeCategories,
    projectedMonthEndSpent,
    spendPct,
    spentByCategory,
    earnedByCategory,
    totalPlanned,
    totalSpent,
    transactions,
    leftover,
    leftoverPositive,
    barColor,
    pastNames,
  } = buildBudgetSummary(data, month, year);

  const incomeSectionRef = useRef(null);
  const uncategorizedTransactions = transactions.filter(
    (transaction) => transaction.categoryId === null || transaction.categoryId === undefined,
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("fintrack-theme", theme);
  }, [theme]);

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

      if (nextSession) {
        const currentDate = new Date();
        setMonth(currentDate.getMonth());
        setYear(currentDate.getFullYear());
      }

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
    if (authLoading || !session) {
      setBudgetLoaded(false);
      return;
    }

    async function loadBudget() {
      setBudgetLoaded(false);

      try {
        const result = await storage.get(`budget-${month}-${year}`);
        if (result) {
          setData({ ...defaultData(), ...JSON.parse(result.value) });
          setBudgetLoaded(true);
          return;
        }
        setData(defaultData());
      } catch {
        setData(defaultData());
      } finally {
        setBudgetLoaded(true);
      }
    }

    loadBudget();
  }, [authLoading, month, year, session, storage]);

  useEffect(() => {
    if (authLoading || !session) return;
    let isMounted = true;
    async function loadFirstName() {
      try {
        const result = await storage.get(FIRST_NAME_KEY);
        if (!isMounted) return;
        
        if (result && result.value) {
          setFirstName(result.value);
        } else {
          setShowNamePrompt(true);
        }
      } catch {
        if (!isMounted) return;
        setShowNamePrompt(true);
      }
    }
    loadFirstName();
    return () => { isMounted = false; };
  }, [authLoading, session, storage]);

  // ── Weekly AI Summary — generate once on Sunday login ──────────────────────
  useEffect(() => {
    if (authLoading || !session || !budgetLoaded) return;
    if (!isSunday()) return;

    const userId = session.user.id;
    let isMounted = true;

    async function checkAndGenerate() {
      const existing = await getTodaysSummary(userId);
      if (!isMounted) return;
      if (existing) {
        setWeeklySummary(existing);
        const key = `weekly-banner-dismissed-${userId}-${existing.generated_on}`;
        if (localStorage.getItem(key)) setBannerDismissed(true);
        return;
      }

      setIsGeneratingSummary(true);
      const result = await generateAndSaveSummary({
        userId,
        spentByCategory,
        totalSpent,
        categories: data.categories || [],
        transactions,
      });
      if (!isMounted) return;
      setIsGeneratingSummary(false);
      if (result) setWeeklySummary(result);
    }

    checkAndGenerate();
    return () => { isMounted = false; };
  }, [authLoading, session, budgetLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      if (uncategorizedSuccessTimeoutRef.current) {
        window.clearTimeout(uncategorizedSuccessTimeoutRef.current);
        uncategorizedSuccessTimeoutRef.current = null;
      }
      authCycleRef.current = { userId: null, counted: false };
      setAuthCycleReady(false);
      setShouldShowCategoryAlert(false);
      setCategoryAlertItems([]);
      setCategoryAlertEvaluated(false);
      setShowUncategorizedAlert(false);
      setUncategorizedAlertEvaluated(false);
      setShowUncategorizedSection(false);
      setUncategorizedAssignments({});
      setUncategorizedSaveSuccess(false);
      return;
    }

    const userId = session.user.id;
    if (authCycleRef.current.userId !== userId) {
      authCycleRef.current = { userId, counted: false };
    }

    if (authCycleRef.current.counted) return;

    authCycleRef.current.counted = true;
    setAuthCycleReady(false);
    let isActive = true;

    async function trackAuthCycle() {
      try {
        const result = await storage.get(CATEGORY_ALERT_COUNT_KEY);
        const currentCount = Number.parseInt(result?.value ?? "0", 10);
        const normalizedCount = Number.isFinite(currentCount) ? currentCount : 0;
        const nextCount = normalizedCount + 1;

        await storage.set(CATEGORY_ALERT_COUNT_KEY, String(nextCount));

        if (!isActive) return;
        setShouldShowCategoryAlert(nextCount % 2 === 0);
      } catch {
        if (!isActive) return;
        setShouldShowCategoryAlert(false);
      } finally {
        if (isActive) {
          if (uncategorizedSuccessTimeoutRef.current) {
            window.clearTimeout(uncategorizedSuccessTimeoutRef.current);
            uncategorizedSuccessTimeoutRef.current = null;
          }
          setAuthCycleReady(true);
          setCategoryAlertItems([]);
          setCategoryAlertEvaluated(false);
          setShowUncategorizedAlert(false);
          setUncategorizedAlertEvaluated(false);
          setShowUncategorizedSection(false);
          setUncategorizedAssignments({});
          setUncategorizedSaveSuccess(false);
        }
      }
    }

    trackAuthCycle();

    return () => {
      isActive = false;
    };
  }, [authLoading, session, storage]);

  useEffect(() => {
    if (
      authLoading ||
      !session ||
      !budgetLoaded ||
      !authCycleReady ||
      categoryAlertEvaluated
    ) {
      return;
    }

    if (!shouldShowCategoryAlert) {
      setCategoryAlertItems([]);
      setCategoryAlertEvaluated(true);
      return;
    }

    setCategoryAlertItems(getCategoryAlerts(data.categories, spentByCategory, 85));
    setCategoryAlertEvaluated(true);
  }, [
    authLoading,
    authCycleReady,
    budgetLoaded,
    categoryAlertEvaluated,
    data.categories,
    session,
    shouldShowCategoryAlert,
    spentByCategory,
  ]);

  useEffect(() => {
    if (
      authLoading ||
      !session ||
      !budgetLoaded ||
      !authCycleReady ||
      uncategorizedAlertEvaluated
    ) {
      return;
    }

    setShowUncategorizedAlert(uncategorizedTransactions.length > 0);
    setUncategorizedAlertEvaluated(true);
  }, [
    authLoading,
    authCycleReady,
    budgetLoaded,
    session,
    uncategorizedAlertEvaluated,
    uncategorizedTransactions.length,
  ]);

  useEffect(() => {
    if (uncategorizedTransactions.length > 0) return;

    setShowUncategorizedAlert(false);

    if (!uncategorizedSaveSuccess) {
      setShowUncategorizedSection(false);
    }
  }, [uncategorizedSaveSuccess, uncategorizedTransactions.length]);

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

  useEffect(() => {
    if (authLoading || !session) return;

    const previousTarget = getPreviousMonthTarget(month, year);
    let isActive = true;

    async function checkPreviousMonth() {
      try {
        const result = await storage.get(`budget-${previousTarget.month}-${previousTarget.year}`);
        if (isActive) {
          setCanGoPrev(Boolean(result));
        }
      } catch {
        if (isActive) {
          setCanGoPrev(false);
        }
      }
    }

    checkPreviousMonth();

    return () => {
      isActive = false;
    };
  }, [authLoading, month, year, session, storage]);

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

  const mostRecentImportedTransactionLabel = transactions
    .filter(
      (transaction) =>
        transaction.importSource === "excel" &&
        Number.isFinite(transaction.importDateValue),
    )
    .sort((a, b) => b.importDateValue - a.importDateValue)[0]?.date;

  useEffect(() => {
    return () => {
      if (uncategorizedSuccessTimeoutRef.current) {
        window.clearTimeout(uncategorizedSuccessTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedTransactionIds((currentIds) =>
      currentIds.filter((id) => transactions.some((transaction) => transaction.id === id)),
    );
  }, [transactions]);

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
      const result = await action(credentials);
      const nextSession = result?.session ?? (await getCurrentSession());

      setSession(nextSession);

      if (!nextSession) {
        setAuthError("Account created. Sign in with your email and password to continue.");
      }
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
    } finally {
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
      if (uncategorizedSuccessTimeoutRef.current) {
        window.clearTimeout(uncategorizedSuccessTimeoutRef.current);
        uncategorizedSuccessTimeoutRef.current = null;
      }
      setData(defaultData());
      setLastCategoryId("");
      setImportRows(null);
      setImportError("");
      setAuthCycleReady(false);
      setCategoryAlertItems([]);
      setCategoryAlertEvaluated(false);
      setShouldShowCategoryAlert(false);
      setShowUncategorizedAlert(false);
      setUncategorizedAlertEvaluated(false);
      setShowUncategorizedSection(false);
      setUncategorizedAssignments({});
      setUncategorizedSaveSuccess(false);
      setBudgetLoaded(false);
      setShowSettings(false);
      setWeeklySummary(null);
      setBannerDismissed(false);
      authCycleRef.current = { userId: null, counted: false };
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
    setShowAddCategoryModal(false);
  };

  const deleteCategory = (categoryToDelete) => {
    setPendingDelete({
      type: "category",
      id: categoryToDelete.id,
      title: `Delete "${categoryToDelete.name}"?`,
      description:
        "This will remove the category and delete all transactions assigned to it.",
      confirmLabel: "Delete category",
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

  const startSavingsEdit = () => {
    setSavingsInput(data.currentSavings || "");
    setEditingSavings(true);
    setTimeout(() => savingsRef.current?.focus(), 50);
  };

  const saveSavings = () => {
    update({ ...data, currentSavings: savingsInput });
    setEditingSavings(false);
  };

  const cancelSavingsEdit = () => {
    setEditingSavings(false);
  };

  const saveFirstName = async (name) => {
    setFirstName(name);
    setShowNamePrompt(false);
    try {
      await storage.set(FIRST_NAME_KEY, name);
    } catch (e) {
      console.error("Failed to save name", e);
    }
  };

  const prevMonth = () => {
    if (!canGoPrev) return;

    const target = getPreviousMonthTarget(month, year);
    setMonth(target.month);
    setYear(target.year);
  };

  const nextMonth = () => {
    const target = getNextMonthTarget(month, year);
    const budgetKey = `budget-${target.month}-${target.year}`;

    async function prepareNextMonth() {
      try {
        const existing = await storage.get(budgetKey);

        if (existing) {
          setMonth(target.month);
          setYear(target.year);
          return;
        }

        setNextMonthPrompt(target);
      } catch {
        setNextMonthPrompt(target);
      }
    }

    prepareNextMonth();
  };

  const goToMonth = async (targetMonth, targetYear) => {
    if (targetMonth === month && targetYear === year) return;
    const budgetKey = `budget-${targetMonth}-${targetYear}`;

    try {
      const existing = await storage.get(budgetKey);
      if (existing) {
        setMonth(targetMonth);
        setYear(targetYear);
        return;
      }
      setNextMonthPrompt({ month: targetMonth, year: targetYear });
    } catch {
      setNextMonthPrompt({ month: targetMonth, year: targetYear });
    }
  };

  const createNextMonth = useCallback(
    async (shouldTransfer) => {
      if (!nextMonthPrompt) return;

      setIsCreatingNextMonth(true);

      try {
        const nextMonthData = shouldTransfer ? cloneBudgetSetup(data) : defaultData();

        await storage.set(
          `budget-${nextMonthPrompt.month}-${nextMonthPrompt.year}`,
          JSON.stringify(nextMonthData),
        );

        setMonth(nextMonthPrompt.month);
        setYear(nextMonthPrompt.year);
        setNextMonthPrompt(null);
      } catch {
        setAuthError("Unable to create the next month right now.");
      } finally {
        setIsCreatingNextMonth(false);
      }
    },
    [data, nextMonthPrompt, storage],
  );

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

  const addTransaction = (splitData = null) => {
    const isSplit = !!(splitData && splitData.isSplit);
    if (!newTx.name.trim() || !newTx.amount) return;
    if (!isSplit && !newTx.categoryId) return;

    const catId = isSplit ? null : parseInt(newTx.categoryId, 10);
    let amount = parseFloat(newTx.amount) || 0;

    // If it's an income category and amount is positive, negate it
    if (catId && data.incomeCategories.some(ic => ic.id === catId) && amount > 0) {
      amount = amount * -1;
    }

    const transaction = {
      id: Date.now(),
      name: newTx.name.trim(),
      amount: amount.toFixed(2),
      categoryId: catId,
      isSplit,
      splits: isSplit ? splitData.splits : null,
      date: todayLabel(),
    };

    update({ ...data, transactions: [transaction, ...transactions] });
    
    if (isSplit) {
      splitData.splits.forEach(s => rememberCategory(String(s.categoryId)));
    } else {
      rememberCategory(newTx.categoryId);
    }
    closeTxForm();
  };

  const deleteTransaction = (transactionToDelete) => {
    setPendingDelete({
      type: "transaction",
      id: transactionToDelete.id,
      title: `Remove "${transactionToDelete.name}"?`,
      description: `This will permanently delete the transaction amount of $${transactionToDelete.amount} from this month's activity.`,
      confirmLabel: "Delete transaction",
    });
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactionIds((currentIds) =>
      currentIds.includes(transactionId)
        ? currentIds.filter((id) => id !== transactionId)
        : [...currentIds, transactionId],
    );
  };

  const toggleAllTransactions = () => {
    setSelectedTransactionIds((currentIds) =>
      currentIds.length === transactions.length ? [] : transactions.map((transaction) => transaction.id),
    );
  };

  const deleteSelectedTransactions = () => {
    if (selectedTransactionIds.length === 0) return;

    setPendingDelete({
      type: "transactions",
      ids: selectedTransactionIds,
      title:
        selectedTransactionIds.length === 1
          ? "Remove 1 selected transaction?"
          : `Remove ${selectedTransactionIds.length} selected transactions?`,
      description:
        selectedTransactionIds.length === 1
          ? "This will permanently delete the selected transaction from this month's activity."
          : "This will permanently delete all selected transactions from this month's activity.",
      confirmLabel:
        selectedTransactionIds.length === 1
          ? "Delete selected transaction"
          : `Delete ${selectedTransactionIds.length} transactions`,
    });
  };

  const updateTransactionCategory = (transactionId, categoryId, splitData = null) => {
    const isSplit = !!(splitData && splitData.isSplit);
    update({
      ...data,
      transactions: transactions.map((transaction) =>
        transaction.id === transactionId
          ? (() => {
              const catId = isSplit ? null : (categoryId ? parseInt(categoryId, 10) : null);
              let amount = parseFloat(transaction.amount) || 0;
              
              // If we just assigned an income category and the amount is positive (e.g. from a manual entry we just made or an imported spender), negate it
              if (catId && data.incomeCategories.some(ic => ic.id === catId) && amount > 0) {
                amount = amount * -1;
              }

              return {
                ...transaction,
                amount: amount.toFixed(2),
                categoryId: catId,
                isSplit,
                splits: isSplit ? splitData.splits : null,
              };
            })()
          : transaction,
      ),
    });

    if (isSplit) {
      splitData.splits.forEach(s => rememberCategory(String(s.categoryId)));
    } else if (categoryId) {
      rememberCategory(categoryId);
    }
  };

  const updateUncategorizedAssignment = (transactionId, categoryId) => {
    setUncategorizedAssignments((current) => ({
      ...current,
      [transactionId]: categoryId,
    }));
  };

  const saveUncategorizedAssignments = () => {
    const allAssigned = uncategorizedTransactions.every(
      (transaction) => uncategorizedAssignments[transaction.id],
    );

    if (!allAssigned) return;

    const assignments = uncategorizedTransactions
      .map((transaction) => ({
        transactionId: transaction.id,
        categoryId: uncategorizedAssignments[transaction.id] || "",
      }))
      .filter((assignment) => assignment.categoryId);

    const assignmentsByTransactionId = new Map(
      assignments.map((assignment) => [
        assignment.transactionId,
        parseInt(assignment.categoryId, 10),
      ]),
    );

    update({
      ...data,
      transactions: transactions.map((transaction) =>
        assignmentsByTransactionId.has(transaction.id)
          ? {
              ...transaction,
              categoryId: assignmentsByTransactionId.get(transaction.id),
            }
          : transaction,
      ),
    });

    rememberCategory(assignments[assignments.length - 1].categoryId);
    setShowUncategorizedAlert(false);
    setUncategorizedAssignments({});
    setUncategorizedSaveSuccess(true);

    if (uncategorizedSuccessTimeoutRef.current) {
      window.clearTimeout(uncategorizedSuccessTimeoutRef.current);
    }

    uncategorizedSuccessTimeoutRef.current = window.setTimeout(() => {
      setShowUncategorizedSection(false);
      setUncategorizedSaveSuccess(false);
      uncategorizedSuccessTimeoutRef.current = null;
    }, 1400);
  };

  const viewUncategorizedTransactions = () => {
    setUncategorizedAssignments(
      Object.fromEntries(
        uncategorizedTransactions.map((transaction) => [
          transaction.id,
          transaction.categoryId?.toString() || "",
        ]),
      ),
    );
    setUncategorizedSaveSuccess(false);
    setActiveTab("transactions");
    setShowUncategorizedSection(true);
  };

  const assignSelectedTransactionsToCategory = (categoryId) => {
    update({
      ...data,
      transactions: transactions.map((transaction) =>
        selectedTransactionIds.includes(transaction.id)
          ? {
              ...transaction,
              categoryId: categoryId ? parseInt(categoryId, 10) : null,
            }
          : transaction,
      ),
    });

    setSelectedTransactionIds([]);

    if (categoryId) {
      rememberCategory(categoryId);
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === "transaction") {
      update({
        ...data,
        transactions: transactions.filter(
          (transaction) => transaction.id !== pendingDelete.id,
        ),
      });
    }

    if (pendingDelete.type === "category") {
      update({
        ...data,
        categories: data.categories.filter((category) => category.id !== pendingDelete.id),
        transactions: transactions.filter(
          (transaction) => transaction.categoryId !== pendingDelete.id,
        ),
      });
    }

    if (pendingDelete.type === "transactions") {
      const idsToDelete = new Set(pendingDelete.ids);
      update({
        ...data,
        transactions: transactions.filter(
          (transaction) => !idsToDelete.has(transaction.id),
        ),
      });
      setSelectedTransactionIds([]);
    }

    setPendingDelete(null);
  };

  const addBill = (newBill) => {
    const updatedBills = [...(data.bills || []), newBill];
    update({ ...data, bills: updatedBills });
  };

  const deleteBill = (billId) => {
    const updatedBills = (data.bills || []).filter((bill) => bill.id !== billId);
    update({ ...data, bills: updatedBills });
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
      setImportRows(autoAssignImportCategory(parsedRows, data.categories));
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
        importSource: "excel",
        importDateValue: row.importDateValue,
      }));

    update({ ...data, transactions: [...transactionsToAdd, ...transactions] });
    setImportRows(null);
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
            background: C.surface,
            border: `1.5px solid ${C.border}`,
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

  const context = {
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
    incomeCategories,
    projectedMonthEndSpent,
    spendPct,
    spentByCategory,
    earnedByCategory,
    totalPlanned,
    totalSpent,
    transactions,
    leftover,
    leftoverPositive,
    barColor,
    data,
    setData,
    update,
    editingSavings,
    savingsInput,
    savingsRef,
    startSavingsEdit,
    setSavingsInput,
    saveSavings,
    cancelSavingsEdit,
    scrollToIncome,
    incomeSectionRef,
    addIncomeCategory,
    deleteIncomeCategory,
    updateIncomeCategory,
    setShowAddIncomeModal,
    editingId,
    setEditingId,
    editVal,
    setEditVal,
    startEdit,
    saveEdit,
    deleteCategory,
    openInline,
    closeInline,
    inlineCatId,
    inlineTx,
    inlineAutocomplete,
    inlineNameRef,
    handleInlineNameChange,
    pickInlineSuggestion,
    setInlineTx,
    submitInline,
    setShowAddCategoryModal,
    quickNameRef,
    openQuickAdd,
    resetQuickAdd,
    handleQuickNameChange,
    pickQuickSuggestion,
    setQuickTx,
    quickTx,
    quickAutocomplete,
    submitQuickAdd,
    getCategoryById: (id) =>
      data.categories.find((c) => c.id === parseInt(id, 10)) ||
      incomeCategories.find((ic) => ic.id === parseInt(id, 10)),
    uncategorizedAssignments,
    uncategorizedSaveSuccess,
    selectedTransactionIds,
    setSelectedTransactionIds,
    importError,
    isImportDragActive,
    mostRecentImportedTransactionLabel,
    fileInputRef,
    showTxForm,
    newTx,
    setNewTx,
    autocomplete,
    nameInputRef,
    triggerImportPicker,
    handleImportDragOver,
    handleImportDragLeave,
    handleImportDrop,
    openTxForm,
    closeTxForm,
    handleNameChange,
    pickSuggestion,
    addTransaction,
    deleteTransaction,
    toggleTransactionSelection,
    toggleAllTransactions,
    deleteSelectedTransactions,
    updateTransactionCategory,
    assignSelectedTransactionsToCategory,
    updateUncategorizedAssignment,
    saveUncategorizedAssignments,
    showUncategorizedSection,
    addBill,
    deleteBill,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', sans-serif",
        color: C.text,
        paddingBottom: "80px", // space for bottom nav
      }}
    >
      <GlobalStyles />

      {showSettings && (
        <SettingsModal 
          session={session} 
          onClose={() => setShowSettings(false)} 
          onSignOut={handleSignOut}
          isSigningOut={signOutPending}
          isGeneratingSummary={isGeneratingSummary}
          onGenerateSummary={async () => {
            setIsGeneratingSummary(true);
            const result = await generateAndSaveSummary({
              userId: session.user.id,
              spentByCategory,
              totalSpent,
              categories: data.categories || [],
              transactions,
            });
            setIsGeneratingSummary(false);
            if (result) { setWeeklySummary(result); setShowSettings(false); setShowWeeklySummary(true); }
          }}
        />
      )}

      {showNamePrompt && (
        <NamePromptModal onSaveName={saveFirstName} />
      )}

      {nextMonthPrompt && (
        <NextMonthPromptModal
          month={nextMonthPrompt.month}
          year={nextMonthPrompt.year}
          isCreating={isCreatingNextMonth}
          onTransfer={() => createNextMonth(true)}
          onCreateBlank={() => createNextMonth(false)}
          onCancel={() => setNextMonthPrompt(null)}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          title={pendingDelete.title}
          description={pendingDelete.description}
          confirmLabel={pendingDelete.confirmLabel}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {showAddCategoryModal && (
        <AddCategoryModal
          newCat={newCat}
          onCategoryChange={setNewCat}
          onConfirm={addCategory}
          onCancel={() => {
            setShowAddCategoryModal(false);
            setNewCat({ name: "", amount: "" });
          }}
        />
      )}

      {showWeeklySummary && (
        <WeeklySummaryModal
          userId={session?.user?.id}
          isGenerating={isGeneratingSummary}
          onClose={() => setShowWeeklySummary(false)}
        />
      )}

      {showAddIncomeModal && (
        <AddIncomeModal
          newIncome={newIncome}
          onIncomeChange={setNewIncome}
          onConfirm={() => {
            addIncomeCategory(newIncome.name, newIncome.amount);
            setShowAddIncomeModal(false);
            setNewIncome({ name: "", amount: "" });
          }}
          onCancel={() => {
            setShowAddIncomeModal(false);
            setNewIncome({ name: "", amount: "" });
          }}
        />
      )}

      <Header
        month={month}
        year={year}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onGoToMonth={goToMonth}
        canGoPrev={canGoPrev}
        userEmail={session.user.email}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 20px 60px" }}>
        <Routes>
          <Route element={<Outlet context={context} />}>
            <Route path="/" element={<Home />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/mortgage" element={<ToolsMortgage />} />
            <Route path="/tools/retirement" element={<ToolsRetirement />} />
            <Route path="/tools/debt" element={<ToolsDebt />} />
            <Route path="/tools/emergency" element={<ToolsEmergency />} />
          </Route>
        </Routes>
      </div>

      <BottomNav />
    </div>
  );
}
