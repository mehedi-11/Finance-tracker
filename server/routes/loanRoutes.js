const express = require('express');
const { getLoans, addLoan, updateLoan, deleteLoan, deleteAllLoans } = require('../controllers/loanController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getLoans).post(protect, addLoan).delete(protect, deleteAllLoans);
router.route('/:id').put(protect, updateLoan).delete(protect, deleteLoan);

module.exports = router;
