# 💎 Money Tracker - Premium Personal Money Tracker

Money Tracker is a high-performance, aesthetically pleasing personal finance management application built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless experience for tracking expenses, managing budgets, and planning future costs with intelligent insights and micro-animations.

![Money Tracker Banner](https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

- **🚀 Real-time Tracking**: Monitor every cent with instant updates and beautiful visualizations.
- **🛡️ Secure Auth**: JWT-based sessions, OTP email verification, and 2FA support.
- **📊 Smart Analytics**: Comprehensive reports with interactive charts (Recharts).
- **💰 Budget Management**: Set category-wise limits and get notified when you're close to exceeding them.
- **📝 Future Plans (Notes)**: Note down personal or future cost plans and get notified based on your schedule.
- **🌍 Global Support**: Choose from multiple world currencies (BDT, USD, EUR, etc.) with dynamic formatting.
- **📱 100% Responsive**: Fully optimized for mobile, tablet, and desktop screens with a modern drawer sidebar.
- **✨ Premium UI**: Built with Tailwind CSS, Framer Motion for smooth transitions, and Lucide React for modern iconography.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT, Bcrypt.js.
- **Email Service**: EmailJS / Custom OTP logic.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mehedi-11/Finance-tracker.git
   ```

2. **Install dependencies**:
   ```bash
   # Root (Frontend)
   npm install
   
   # Backend
   cd server
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the application**:
   ```bash
   # Start Backend (from /server)
   npm start
   
   # Start Frontend (from root)
   npm run dev
   ```

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
Created with ❤️ by Mehedi
