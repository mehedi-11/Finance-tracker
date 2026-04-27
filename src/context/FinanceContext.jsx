import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

import { API_ENDPOINTS } from '../config';

const API_URL = API_ENDPOINTS.FINANCE;

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(() => {
    const cached = localStorage.getItem('finance_transactions');
    return cached ? JSON.parse(cached) : [];
  });
  const [budgets, setBudgets] = useState(() => {
    const cached = localStorage.getItem('finance_budgets');
    return cached ? JSON.parse(cached) : [];
  });

  const fetchFinanceData = async () => {
    if (!user?.token) return;

    try {
      const [transRes, budgetRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch(`${API_URL}/budgets`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
      ]);

      const transData = await transRes.json();
      const budgetData = await budgetRes.json();

      if (transRes.ok) {
        setTransactions(transData);
        localStorage.setItem('finance_transactions', JSON.stringify(transData));
      }
      if (budgetRes.ok) {
        setBudgets(budgetData);
        localStorage.setItem('finance_budgets', JSON.stringify(budgetData));
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFinanceData();
    } else {
      setTransactions([]);
      setBudgets([]);
      localStorage.removeItem('finance_transactions');
      localStorage.removeItem('finance_budgets');
    }
  }, [user]);

  // Sync state to localStorage whenever it changes manually (add/edit/delete)
  useEffect(() => {
    if (user && transactions.length > 0) {
      localStorage.setItem('finance_transactions', JSON.stringify(transactions));
    }
  }, [transactions, user]);

  useEffect(() => {
    if (user && budgets.length > 0) {
      localStorage.setItem('finance_budgets', JSON.stringify(budgets));
    }
  }, [budgets, user]);

  const addTransaction = async (transaction) => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
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

    if (response.ok) {
      setTransactions(prev => prev.filter(t => t._id !== id));
    }
  };

  const updateTransaction = async (id, updatedData) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const updated = await response.json();
      setTransactions(prev => prev.map(t => t._id === id ? updated : t));
    }
  };

  const setBudget = async (category, amount) => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ category, amount }),
    });

    if (response.ok) {
      const updatedBudget = await response.json();
      setBudgets(prev => {
        const existing = prev.find(b => b.category === category);
        if (existing) {
          return prev.map(b => b.category === category ? updatedBudget : b);
        }
        return [...prev, updatedBudget];
      });
    }
  };

  const deleteBudget = async (id) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });

    if (response.ok) {
      setBudgets(prev => prev.filter(b => b._id !== id));
    }
  };

  const totals = {
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0
  };
  totals.balance = totals.income - totals.expenses;

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      budgets, 
      addTransaction, 
      deleteTransaction, 
      updateTransaction,
      setBudget,
      deleteBudget,
      totals,
      categoryTotals
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
