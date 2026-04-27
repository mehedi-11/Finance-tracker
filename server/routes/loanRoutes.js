const express = require('express');
const { getLoans, addLoan, updateLoan, deleteLoan } = require('../controllers/loanController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getLoans).post(protect, addLoan);
router.route('/:id').put(protect, updateLoan).delete(protect, deleteLoan);

module.exports = router;
