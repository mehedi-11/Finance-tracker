import { API_ENDPOINTS } from '../config';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const API_URL = API_ENDPOINTS.FINANCE;

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(() => {
    try {
      const cached = localStorage.getItem('finance_transactions');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [budgets, setBudgets] = useState(() => {
    try {
      const cached = localStorage.getItem('finance_budgets');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loans, setLoans] = useState(() => {
    try {
      const cached = localStorage.getItem('finance_loans');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [transRes, budgetRes, loanRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch(`${API_URL}/budgets`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch(API_ENDPOINTS.LOANS, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
      ]);

      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData);
        localStorage.setItem('finance_transactions', JSON.stringify(transData));
      }
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudgets(budgetData);
        localStorage.setItem('finance_budgets', JSON.stringify(budgetData));
      }
      if (loanRes.ok) {
        const loanData = await loanRes.json();
        setLoans(loanData);
        localStorage.setItem('finance_loans', JSON.stringify(loanData));
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    } else {
      setTransactions([]);
      setBudgets([]);
      setLoans([]);
      localStorage.removeItem('finance_transactions');
      localStorage.removeItem('finance_budgets');
      localStorage.removeItem('finance_loans');
    }
  }, [user, fetchFinanceData]);

  // Sync state to localStorage
  useEffect(() => {
    if (user && transactions.length > 0) localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions, user]);

  useEffect(() => {
    if (user && budgets.length > 0) localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets, user]);

  useEffect(() => {
    if (user && loans.length > 0) localStorage.setItem('finance_loans', JSON.stringify(loans));
  }, [loans, user]);

  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transaction)
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(prev => [data, ...prev]);
        toast.success('Transaction added');
        return data;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const checkRecurringTransactions = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    transactions.forEach(async (t) => {
      if (t.isRecurring) {
        const transDate = new Date(t.date);
        // If the recurring transaction hasn't been added for this month yet
        const alreadyAdded = transactions.some(existing => 
          existing.description === t.description && 
          new Date(existing.date).getMonth() === currentMonth &&
          new Date(existing.date).getFullYear() === currentYear &&
          existing._id !== t._id
        );

        if (!alreadyAdded) {
          const newDate = new Date(currentYear, currentMonth, transDate.getDate());
          await addTransaction({
            ...t,
            date: newDate.toISOString().split('T')[0],
            isPaid: false,
            isRecurring: true,
            _id: undefined // Backend will generate new ID
          });
        }
      }
    });
  };

  useEffect(() => {
    if (transactions.length > 0) {
      checkRecurringTransactions();
    }
  }, [transactions.length]);

  const deleteTransaction = async (id) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const updateTransaction = async (id, updatedData) => {
    // Clean data for backend (some backends fail if _id or timestamps are in body)
    // eslint-disable-next-line no-unused-vars
    const { _id, createdAt, updatedAt, __v, user: u, ...cleanData } = updatedData;

    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(cleanData),
    });
    
    if (response.ok) {
      const updated = await response.json();
      // Force preserve isPaid in local state if backend strips it
      setTransactions(prev => prev.map(t => t._id === id ? { ...t, ...updated, isPaid: updated.isPaid !== undefined ? updated.isPaid : updatedData.isPaid } : t));
      return updated;
    } else {
      throw new Error('Update failed');
    }
  };

  const clearTransactions = async () => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) {
      setTransactions([]);
      localStorage.removeItem('finance_transactions');
    }
  };



  // Loans CRUD
  const addLoan = async (loanData) => {
    const response = await fetch(API_ENDPOINTS.LOANS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(loanData),
    });
    if (response.ok) {
      const newLoan = await response.json();
      fetchFinanceData();
      return newLoan;
    }
  };

  const deleteLoan = async (id) => {
    const response = await fetch(`${API_ENDPOINTS.LOANS}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) fetchFinanceData();
  };

  const updateLoan = async (id, loanData) => {
    const response = await fetch(`${API_ENDPOINTS.LOANS}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(loanData),
    });
    if (response.ok) fetchFinanceData();
  };

  const clearLoans = async () => {
    const response = await fetch(API_ENDPOINTS.LOANS, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) {
      setLoans([]);
      localStorage.removeItem('finance_loans');
    }
  };



  const setBudget = async (category, amount) => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ category, amount }),
    });
    if (response.ok) {
      const updatedBudget = await response.json();
      setBudgets(prev => {
        const existing = prev.find(b => b.category === category);
        if (existing) return prev.map(b => b.category === category ? updatedBudget : b);
        return [...prev, updatedBudget];
      });
    }
  };

  const deleteBudget = async (id) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) setBudgets(prev => prev.filter(b => b._id !== id));
  };

  const clearBudgets = async () => {
    const response = await fetch(`${API_URL}/budgets`, {
      headers: { 'Authorization': `Bearer ${user.token}` },
      method: 'DELETE'
    });
    if (response.ok) {
      setBudgets([]);
      localStorage.removeItem('finance_budgets');
    }
  };



  // Aggregations
  const getMonthlyReports = () => {
    const reports = {};
    const startDay = user?.monthStartDay || 1;

    const getCycleKey = (dateStr) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();
      
      let cycleDate;
      if (day >= startDay) {
        cycleDate = new Date(year, month, startDay);
      } else {
        cycleDate = new Date(year, month - 1, startDay);
      }
      
      const cycleStart = new Date(cycleDate);
      const cycleEnd = new Date(cycleDate.getFullYear(), cycleDate.getMonth() + 1, startDay - 1, 23, 59, 59);

      const startText = cycleStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const endText = cycleEnd.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      
      const key = `${startText} - ${endText}`;
      return { key, start: cycleStart, end: cycleEnd };
    };

    // Process Transactions
    transactions.forEach(t => {
      const { key, start, end } = getCycleKey(t.date);
      if (!reports[key]) reports[key] = { income: 0, expense: 0, loansTaken: 0, loansPaid: 0, month: key, startDate: start, endDate: end };
      
      if (t.isPaid !== false) {
        if (t.type === 'income') reports[key].income += Number(t.amount);
        else reports[key].expense += Number(t.amount);
      }
    });

    // Process Loans
    loans.forEach(l => {
      const { key, start, end } = getCycleKey(l.createdAt || l.expectedPayDate);
      if (!reports[key]) reports[key] = { income: 0, expense: 0, loansTaken: 0, loansPaid: 0, month: key, startDate: start, endDate: end };
      
      if (l.type === 'get') reports[key].loansTaken += Number(l.amount);
      if (l.isPaid) reports[key].loansPaid += Number(l.amount);
    });

    return Object.keys(reports).reverse().map(key => ({
      ...reports[key],
      savings: reports[key].income - reports[key].expense
    }));
  };

  const getCurrentCycleRange = () => {
    const startDay = user?.monthStartDay || 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    let start, end;
    if (day >= startDay) {
      start = new Date(year, month, startDay);
      end = new Date(year, month + 1, startDay - 1, 23, 59, 59);
    } else {
      start = new Date(year, month - 1, startDay);
      end = new Date(year, month, startDay - 1, 23, 59, 59);
    }
    return { start, end };
  };

  const { start: cycleStart, end: cycleEnd } = getCurrentCycleRange();

  const currentCycleTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= cycleStart && d <= cycleEnd;
  });

  const currentIncomeTransactions = currentCycleTransactions.filter(t => t.type === 'income' && t.isPaid !== false);
  const regularIncome = currentIncomeTransactions.filter(t => t.category !== 'Saving' && !t.category.toLowerCase().includes('loan')).reduce((sum, t) => sum + Number(t.amount), 0);
  const savingsUsed = currentIncomeTransactions.filter(t => t.category === 'Saving').reduce((sum, t) => sum + Number(t.amount), 0);
  const loansReceived = currentIncomeTransactions.filter(t => t.category.toLowerCase().includes('loan')).reduce((sum, t) => sum + Number(t.amount), 0);

  const totals = {
    income: regularIncome,
    expenses: currentCycleTransactions.filter(t => t.type === 'expense' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    savingsUsed: savingsUsed,
    loansReceived: loansReceived,
    balance: 0
  };
  totals.balance = totals.income + totals.savingsUsed + totals.loansReceived - totals.expenses;

  const globalIncomeTransactions = transactions.filter(t => t.type === 'income' && t.isPaid !== false);
  const globalRegularIncome = globalIncomeTransactions.filter(t => t.category !== 'Saving' && !t.category.toLowerCase().includes('loan')).reduce((sum, t) => sum + Number(t.amount), 0);
  const globalSavingsUsed = globalIncomeTransactions.filter(t => t.category === 'Saving').reduce((sum, t) => sum + Number(t.amount), 0);
  const globalLoansReceived = globalIncomeTransactions.filter(t => t.category.toLowerCase().includes('loan')).reduce((sum, t) => sum + Number(t.amount), 0);

  const globalTotals = {
    income: globalRegularIncome,
    expenses: transactions.filter(t => t.type === 'expense' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    savingsUsed: globalSavingsUsed,
    loansReceived: globalLoansReceived,
    balance: 0
  };
  globalTotals.balance = globalTotals.income + globalTotals.savingsUsed + globalTotals.loansReceived - globalTotals.expenses;

  const categoryTotals = currentCycleTransactions
    .filter(t => t.type === 'expense' && t.isPaid !== false)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
  
  // Advanced Insights Logic
  const getSpendingForecast = () => {
    const monthlyReports = getMonthlyReports();
    if (monthlyReports.length < 2) return totals.expenses; // Not enough data
    
    // Simple moving average for forecast
    const pastExpenses = monthlyReports.slice(0, 3).map(r => r.expense);
    const averageExpense = pastExpenses.reduce((a, b) => a + b, 0) / pastExpenses.length;
    
    // Add 5% buffer for inflation/variation
    return Math.round(averageExpense * 1.05);
  };

  // Financial Health Score Calculation
  const getFinancialHealth = () => {
    let score = 0;
    const income = totals.income || 1;
    const expenses = totals.expenses || 0;
    const savings = Math.max(0, income - expenses);
    
    // 1. Savings Rate (Max 40 points)
    const savingsRate = (savings / income) * 100;
    if (savingsRate >= 30) score += 40;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate > 0) score += 10;

    // 2. Budget Compliance (Max 30 points)
    const budgetStatus = budgets.length > 0 ? budgets.every(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return spent <= b.amount;
    }) : true;
    if (budgetStatus) score += 30;
    else score += 10;

    // 3. Debt-to-Income Ratio (Max 20 points)
    const debt = activeLoans;
    const debtRatio = (debt / income) * 100;
    if (debtRatio === 0) score += 20;
    else if (debtRatio < 20) score += 15;
    else if (debtRatio < 50) score += 5;

    // 4. Emergency Fund (Max 10 points)
    const avgExpense = expenses || 1;
    const monthsCovered = totalSavings / avgExpense;
    if (monthsCovered >= 3) score += 10;
    else if (monthsCovered >= 1) score += 5;

    let status = 'Fair';
    let color = 'amber';
    if (score >= 80) { status = 'Excellent'; color = 'emerald'; }
    else if (score >= 60) { status = 'Good'; color = 'primary'; }
    else if (score < 40) { status = 'Poor'; color = 'rose'; }

    return { score, status, color };
  };

  // Savings Goals State & Logic
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('finance_goals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finance_goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (goal) => {
    setGoals(prev => [{ ...goal, _id: Date.now().toString(), currentAmount: 0 }, ...prev]);
  };

  const updateGoalProgress = (id, amount) => {
    setGoals(prev => prev.map(g => g._id === id ? { ...g, currentAmount: Number(g.currentAmount) + Number(amount) } : g));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g._id !== id));
  };

  const getAIAdvice = () => {
    const advice = [];
    const forecast = getSpendingForecast();
    
    // 1. Budget Overrun Check
    budgets.forEach(b => {
      const spent = categoryTotals[b.category] || 0;
      if (spent > b.amount) {
        advice.push({
          type: 'danger',
          text: `You've exceeded your ${b.category} budget by ${Math.round((spent/b.amount - 1) * 100)}%. Consider cutting back immediately.`
        });
      } else if (spent > b.amount * 0.8) {
        advice.push({
          type: 'warning',
          text: `Alert: You've used ${Math.round((spent/b.amount) * 100)}% of your ${b.category} budget.`
        });
      }
    });

    // 2. Spending Trend Advice
    if (totals.expenses > forecast * 0.9) {
      advice.push({
        type: 'warning',
        text: "Your spending this month is nearing your predicted limit. Try to defer non-essential purchases."
      });
    }

    // 3. Savings Advice
    const savingsRate = totals.income > 0 ? (totals.balance / (totals.income + totals.savingsUsed)) * 100 : 0;
    if (savingsRate < 10 && totals.income > 0) {
      advice.push({
        type: 'info',
        text: "Tip: Your saving rate is below 10%. Try setting aside a small fixed amount at the start of next month."
      });
    } else if (savingsRate > 30) {
      advice.push({
        type: 'success',
        text: "Excellent work! You are saving over 30% of your income. Consider investing the surplus."
      });
    }

    if (advice.length === 0) {
      advice.push({
        type: 'success',
        text: "Your finances look healthy! Keep tracking to stay on top of your goals."
      });
    }

    return advice;
  };

  // Fix: totalSavings = sum of past months' (income - expense) excluding current cycle
  const pastMonthsReports = getMonthlyReports().filter(report => {
    return new Date(report.startDate) < cycleStart;
  });
  const totalSavings = Math.max(0, pastMonthsReports.reduce((sum, r) => sum + r.savings, 0) - globalSavingsUsed);

  const unpaidTransactions = transactions.filter(t => t.type === 'expense' && t.isPaid === false);
  const activeLoans = loans.filter(l => !l.isPaid).reduce((sum, l) => sum + Number(l.amount), 0);

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      budgets, 
      loans,
      loading,
      addTransaction, 
      deleteTransaction, 
      updateTransaction,
      addLoan,
      deleteLoan,
      updateLoan,
      clearTransactions,
      clearLoans,
      clearBudgets,
      setBudget,
      deleteBudget,
      getMonthlyReports,
      getSpendingForecast,
      getAIAdvice,
      getFinancialHealth,
      goals,
      addGoal,
      updateGoalProgress,
      deleteGoal,
      totals,
      globalTotals,
      categoryTotals,
      currentCycleTransactions,
      getCurrentCycleRange,
      fetchFinanceData,
      totalSavings,
      unpaidTransactions,
      activeLoans
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
