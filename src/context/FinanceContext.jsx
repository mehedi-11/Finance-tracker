import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const fetchFinanceData = async () => {
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
  };

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
  }, [user]);

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
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(transaction),
    });
    if (response.ok) {
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
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
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify(updatedData),
    });
    if (response.ok) {
      const updated = await response.json();
      setTransactions(prev => prev.map(t => t._id === id ? updated : t));
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
    
    // Process Transactions
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!reports[monthKey]) reports[monthKey] = { income: 0, expense: 0, loansTaken: 0, loansPaid: 0 };
      
      // Only count paid transactions in monthly report totals
      if (t.isPaid !== false) {
        if (t.type === 'income') reports[monthKey].income += Number(t.amount);
        else reports[monthKey].expense += Number(t.amount);
      }
    });

    // Process Loans
    loans.forEach(l => {
      const date = new Date(l.createdAt || l.expectedPayDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!reports[monthKey]) reports[monthKey] = { income: 0, expense: 0, loansTaken: 0, loansPaid: 0 };
      
      if (l.type === 'get') reports[monthKey].loansTaken += Number(l.amount);
      if (l.isPaid) reports[monthKey].loansPaid += Number(l.amount);
    });

    return Object.keys(reports).sort().reverse().map(key => ({
      month: key,
      ...reports[key],
      savings: reports[key].income - reports[key].expense
    }));
  };

  const totals = {
    income: transactions.filter(t => t.type === 'income' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: transactions.filter(t => t.type === 'expense' && t.isPaid !== false).reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0
  };
  totals.balance = totals.income - totals.expenses;

  const categoryTotals = transactions
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
        const [year, month] = monthKey.split('-');
        
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
      categoryTotals,
      fetchFinanceData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
