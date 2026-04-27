import { useState, useEffect } from 'react';
import { Bell, Search, Menu, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/auth', '') 
  : 'http://localhost:5000/api';

const Navbar = ({ setIsSidebarOpen }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.token) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={24} className="text-gray-900" />
        </button>
        <span className="text-xl font-black text-gray-900 lg:hidden tracking-tighter">FinanceFlow</span>
      </div>

      <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-96 group focus-within:ring-2 focus-within:ring-primary-500/50 transition-all duration-300">
        <Search size={18} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="bg-transparent border-none outline-none ml-3 text-sm text-gray-900 w-full placeholder:text-gray-500"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-600 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-gray-900">Notifications</h4>
                  <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-bold uppercase">{unreadCount} New</span>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {safeNotifications.length > 0 ? (
                    safeNotifications.map((n) => (
                      <div key={n._id} className={`p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-white border-gray-50' : 'bg-primary-50 border-primary-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-1 break-words">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={() => markAsRead(n._id)}
                              className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm shrink-0"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-10">No notifications yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Link to="/profile" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Premium</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-primary-50/50 shrink-0">
            {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
