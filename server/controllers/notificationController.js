const Notification = require('../models/Notification');
const Note = require('../models/Note');

// @desc    Get user notifications
const getNotifications = async (req, res) => {
  // Check for upcoming notes and create notifications if they don't exist
  const notes = await Note.find({ 
    user: req.user._id, 
    plannedDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Next 7 days
    isNotified: false 
  });

  for (const note of notes) {
    await Notification.create({
      user: req.user._id,
      title: 'Upcoming Cost Plan',
      message: `Your plan "${note.title}" for ${note.amount} is coming up on ${note.plannedDate.toLocaleDateString()}!`,
      type: 'warning'
    });
    note.isNotified = true;
    await note.save();
  }

  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
};

// @desc    Mark notification as read
const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
};

module.exports = { getNotifications, markAsRead };
