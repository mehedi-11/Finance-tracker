const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const noteRoutes = require('./routes/noteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const loanRoutes = require('./routes/loanRoutes');

dotenv.config({ path: './server/.env' });
connectDB();

const app = express();

// Fix: CORS — remove credentials:true when using wildcard origin
app.use(cors({
  origin: '*',
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/loans', loanRoutes);

app.get('/', (req, res) => {
  res.send('Money Tracker API is running...');
});

// Fix: 404 Handler must be BEFORE app.listen()
app.use((req, res) => {
  res.status(404).json({ message: `Route not found - ${req.originalUrl}` });
});

// Fix: Global Error Handler must be BEFORE app.listen()
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
