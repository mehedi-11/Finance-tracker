const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: { type: String, required: true },
  content: { type: String },
  amount: { type: Number },
  plannedDate: { type: Date },
  isNotified: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
