const Loan = require('../models/Loan');

const getLoans = async (req, res) => {
  const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(loans);
};

const addLoan = async (req, res) => {
  const { lender, purpose, amount, expectedPayDate } = req.body;
  const loan = await Loan.create({
    user: req.user._id,
    lender,
    purpose,
    amount,
    expectedPayDate
  });
  res.status(201).json(loan);
};

const updateLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (loan && loan.user.toString() === req.user._id.toString()) {
    loan.lender = req.body.lender || loan.lender;
    loan.purpose = req.body.purpose || loan.purpose;
    loan.amount = req.body.amount || loan.amount;
    loan.expectedPayDate = req.body.expectedPayDate || loan.expectedPayDate;
    loan.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : loan.isPaid;
    
    const updated = await loan.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Loan not found' });
  }
};

const deleteLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (loan && loan.user.toString() === req.user._id.toString()) {
    await loan.deleteOne();
    res.json({ message: 'Loan removed' });
  } else {
    res.status(404).json({ message: 'Loan not found' });
  }
};

module.exports = { getLoans, addLoan, updateLoan, deleteLoan };
