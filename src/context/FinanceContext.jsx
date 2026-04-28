import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

import { API_ENDPOINTS } from '../config';

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
    // Clean data for backend
    // eslint-disable-next-line no-unused-vars
    const { _id, createdAt, updatedAt, __v, user: u, ...cleanData } = transaction;

    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(cleanData),
    });
    if (response.ok) {
      const newTransaction = await response.json();
      // Force preserve isPaid in local state if backend strips it
      const finalTransaction = { ...transaction, ...newTransaction };
      setTransactions(prev => [finalTransaction, ...prev]);
      return finalTransaction;
    }
  };

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
    if (response.ok) fetchFinanceData();
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
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
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

  const totals = {
    income: currentCycleTransactions.filter(t => t.type === 'income' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: currentCycleTransactions.filter(t => t.type === 'expense' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0
  };
  totals.balance = totals.income - totals.expenses;

  const globalTotals = {
    income: transactions.filter(t => t.type === 'income' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: transactions.filter(t => t.type === 'expense' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0
  };
  globalTotals.balance = globalTotals.income - globalTotals.expenses;

  const categoryTotals = currentCycleTransactions
    .filter(t => t.type === 'expense' && t.isPaid !== false)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      budgets, 
      loans,
      loading,
      addTransaction, 
      deleteTransaction, 
      updateTransaction,
      clearTransactions,
      addLoan,
      deleteLoan,
      updateLoan,
      clearLoans,
      setBudget,
      deleteBudget,
      clearBudgets,
      deleteMonthData: async (monthKey) => {
        // Delete Transactions
        const transToDelete = transactions.filter(t => {
          const d = new Date(t.date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
        });
        
        for (const t of transToDelete) {
          await deleteTransaction(t._id);
        }

        // Delete Loans
        const loansToDelete = loans.filter(l => {
          const d = new Date(l.createdAt || l.expectedPayDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthKey;
        });
        
        for (const l of loansToDelete) {
          await deleteLoan(l._id);
        }
        
        fetchFinanceData();
      },
      getMonthlyReports,
      totals,
      globalTotals,
      categoryTotals,
      currentCycleTransactions,
      getCurrentCycleRange,
      fetchFinanceData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
