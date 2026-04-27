const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lender: { type: String, required: true },
  purpose: { type: String, required: true },
  amount: { type: Number, required: true },
  expectedPayDate: { type: Date, required: true },
  isPaid: { type: Boolean, default: false },
  relatedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', loanSchema);
