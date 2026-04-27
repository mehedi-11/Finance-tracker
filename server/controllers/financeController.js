const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get all transactions
// @route   GET /api/finance/transactions
const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
  res.json(transactions);
};

// @desc    Add a transaction
// @route   POST /api/finance/transactions
const addTransaction = async (req, res) => {
  const { description, amount, type, category, date } = req.body;

  const transaction = new Transaction({
    user: req.user._id,
    description,
    amount,
    type,
    category,
    date: date || Date.now(),
  });

  const createdTransaction = await transaction.save();
  res.status(201).json(createdTransaction);
};

// @desc    Update a transaction
// @route   PUT /api/finance/transactions/:id
const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction) {
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    transaction.description = req.body.description || transaction.description;
    transaction.amount = req.body.amount !== undefined ? req.body.amount : transaction.amount;
    transaction.type = req.body.type || transaction.type;
    transaction.category = req.body.category || transaction.category;
    transaction.date = req.body.date || transaction.date;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/finance/transactions/:id
const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction) {
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
};

// @desc    Get all budgets
// @route   GET /api/finance/budgets
const getBudgets = async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id });
  res.json(budgets);
};

// @desc    Set/Update a budget
// @route   POST /api/finance/budgets
const setBudget = async (req, res) => {
  const { category, amount } = req.body;

  const existingBudget = await Budget.findOne({ user: req.user._id, category });

  if (existingBudget) {
    existingBudget.amount = amount;
    const updatedBudget = await existingBudget.save();
    res.json(updatedBudget);
  } else {
    const budget = new Budget({
      user: req.user._id,
      category,
      amount,
    });
    const createdBudget = await budget.save();
    res.status(201).json(createdBudget);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/finance/budgets/:id
const deleteBudget = async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (budget) {
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } else {
    res.status(404).json({ message: 'Budget not found' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getBudgets,
  setBudget,
  deleteBudget,
};
