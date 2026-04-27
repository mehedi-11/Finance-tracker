const express = require('express');
const { 
  getTransactions, 
  addTransaction, 
  updateTransaction,
  deleteTransaction, 
  getBudgets, 
  setBudget,
  deleteBudget
} = require('../controllers/financeController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.route('/transactions').get(protect, getTransactions).post(protect, addTransaction);
router.route('/transactions/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

router.route('/budgets').get(protect, getBudgets).post(protect, setBudget);
router.route('/budgets/:id').delete(protect, deleteBudget);

module.exports = router;
