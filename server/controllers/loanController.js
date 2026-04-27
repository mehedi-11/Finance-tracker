const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');

const getLoans = async (req, res) => {
  const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(loans);
};

const addLoan = async (req, res) => {
  const { lender, purpose, amount, expectedPayDate } = req.body;
  
  // 1. Create the income transaction first
  const transaction = await Transaction.create({
    user: req.user._id,
    description: `Loan from ${lender}`,
    amount: Number(amount),
    type: 'income',
    category: 'Loan',
    date: new Date()
  });

  // 2. Create the loan record linked to this transaction
  const loan = await Loan.create({
    user: req.user._id,
    lender,
    purpose,
    amount,
    expectedPayDate,
    relatedTransaction: transaction._id
  });

  res.status(201).json(loan);
};

const updateLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (loan && loan.user.toString() === req.user._id.toString()) {
    // Check if amount or lender changed to update the linked transaction
    const amountChanged = Number(req.body.amount) !== loan.amount;
    const lenderChanged = req.body.lender !== loan.lender;

    loan.lender = req.body.lender || loan.lender;
    loan.purpose = req.body.purpose || loan.purpose;
    loan.amount = req.body.amount || loan.amount;
    loan.expectedPayDate = req.body.expectedPayDate || loan.expectedPayDate;
    loan.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : loan.isPaid;
    
    if ((amountChanged || lenderChanged) && loan.relatedTransaction) {
      await Transaction.findByIdAndUpdate(loan.relatedTransaction, {
        amount: Number(loan.amount),
        description: `Loan from ${loan.lender}`
      });
    }

    const updated = await loan.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Loan not found' });
  }
};

const deleteLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (loan && loan.user.toString() === req.user._id.toString()) {
    // Also delete the related transaction
    if (loan.relatedTransaction) {
      await Transaction.findByIdAndDelete(loan.relatedTransaction);
    }
    await loan.deleteOne();
    res.json({ message: 'Loan and related transaction removed' });
  } else {
    res.status(404).json({ message: 'Loan not found' });
  }
};

module.exports = { getLoans, addLoan, updateLoan, deleteLoan };
