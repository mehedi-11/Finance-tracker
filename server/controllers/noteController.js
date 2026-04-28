const Note = require('../models/Note');

// @desc    Get all notes for user
const getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
};

// @desc    Create a note
const createNote = async (req, res) => {
  const { title, content, amount, plannedDate } = req.body;
  const note = await Note.create({
    user: req.user._id,
    title,
    content,
    amount,
    plannedDate,
  });
  res.status(201).json(note);
};

// @desc    Update a note
const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note && note.user.toString() === req.user._id.toString()) {
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    note.amount = req.body.amount !== undefined ? req.body.amount : note.amount;
    note.plannedDate = req.body.plannedDate || note.plannedDate;
    note.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : note.isCompleted;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } else {
    res.status(404).json({ message: 'Note not found' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (note) {
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } else {
    res.status(404).json({ message: 'Note not found' });
  }
};

// @desc    Delete all notes
// @route   DELETE /api/notes
const deleteAllNotes = async (req, res) => {
  await Note.deleteMany({ user: req.user._id });
  res.json({ message: 'All notes removed' });
};

module.exports = { getNotes, createNote, updateNote, deleteNote, deleteAllNotes };
