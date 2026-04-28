import { useState, useEffect, useMemo } from 'react';
import { Bell, Search, Menu, Check, HandCoins, TrendingUp, TrendingDown, PieChart, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/auth', '') 
  : 'http://localhost:5000/api';

const Navbar = ({ setIsSidebarOpen }) => {
  const { user } = useAuth();
  const { transactions, budgets, loans } = useFinance();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchResults = useMemo(() => {
    if (globalSearch.trim().length > 1) {
      const query = globalSearch.toLowerCase();
      
      const results = [
        ...transactions.filter(t => t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
          .map(t => ({ ...t, source: 'Transaction', icon: t.type === 'income' ? TrendingUp : TrendingDown, path: '/transactions' })),
        
        ...budgets.filter(b => b.category.toLowerCase().includes(query))
          .map(b => ({ ...b, description: b.category, source: 'Budget', icon: PieChart, path: '/budget' })),
        
        ...loans.filter(l => l.lender.toLowerCase().includes(query) || l.purpose.toLowerCase().includes(query))
          .map(l => ({ ...l, description: `${l.lender} - ${l.purpose}`, source: 'Loan', icon: HandCoins, path: '/loans' }))
      ];
      
      return results.slice(0, 8);
    }
    return [];
  }, [globalSearch, transactions, budgets, loans]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.global-search-container')) {
        setShowResults(false);
      }
      if (!e.target.closest('.notification-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.token) fetchNotifications();
  }, [user]);

  async function fetchNotifications() {
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
  }

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
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-xl lg:hidden"
        >
          <Menu size={24} className="text-gray-900" />
        </button>
        
        <div className="hidden lg:flex flex-1 relative group global-search-container">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Search transactions, budgets, loans..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {globalSearch && (
            <button 
              onClick={() => {
                setGlobalSearch('');
                setShowResults(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 z-[60] overflow-hidden"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Quick Results</p>
                <div className="space-y-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={`${res.source}-${res._id || i}`}
                      onClick={() => {
                        navigate(res.path);
                        setGlobalSearch('');
                        setShowResults(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-primary-50 rounded-xl transition-colors text-left group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-primary-600 group-hover/item:bg-primary-100 transition-all">
                          <res.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{res.description}</p>
                          <p className="text-[10px] font-black text-primary-500 uppercase tracking-tight">{res.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{formatCurrency(res.amount || 0, user?.currency)}</p>
                        <p className="text-[10px] font-medium text-gray-400 italic">View Page</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-xl font-black text-gray-900 lg:hidden tracking-tighter">FinanceFlow</span>
      </div>



      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative notification-container">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-600 rounded-xl border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-gray-100 rounded-xl shadow-2xl p-6 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-gray-900">Notifications</h4>
                  <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-xl font-bold uppercase">{unreadCount} New</span>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {safeNotifications.length > 0 ? (
                    safeNotifications.map((n) => (
                      <div key={n._id} className={`p-4 rounded-xl border transition-all ${n.isRead ? 'bg-white border-gray-50' : 'bg-primary-50 border-primary-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-1 break-words">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={() => markAsRead(n._id)}
                              className="w-6 h-6 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0"
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
        
        <Link to="/profile" className="hidden md:flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right">
            <p className="text-sm font-black text-gray-900 leading-none whitespace-nowrap">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Premium</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-primary-50/50 shrink-0">
            {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
