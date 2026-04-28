const express = require('express');
const { getNotes, createNote, updateNote, deleteNote, deleteAllNotes } = require('../controllers/noteController');
const { protect } = require('../config/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote)
  .delete(protect, deleteAllNotes);

router.route('/:id')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
