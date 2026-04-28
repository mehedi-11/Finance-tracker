const express = require('express');
const { 
  getTransactions, 
  addTransaction, 
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getBudgets, 
  setBudget,
  deleteBudget,
  deleteAllBudgets
} = require('../controllers/financeController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.route('/transactions')
  .get(protect, getTransactions)
  .post(protect, addTransaction)
  .delete(protect, deleteAllTransactions);

router.route('/transactions/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

router.route('/budgets')
  .get(protect, getBudgets)
  .post(protect, setBudget)
  .delete(protect, deleteAllBudgets);

router.route('/budgets/:id').delete(protect, deleteBudget);

module.exports = router;
