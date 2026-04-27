import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Wallet, 
  User,
  LogOut,
  X,
  HandCoins,
  StickyNote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Receipt, label: 'Transactions', path: '/transactions' },
    { icon: Wallet, label: 'Budget', path: '/budget' },
    { icon: HandCoins, label: 'Loans', path: '/loans' },
    { icon: StickyNote, label: 'My Plan', path: '/plans' },
    { icon: PieChart, label: 'Reports', path: '/reports' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20">
                <Wallet className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">FinanceFlow</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-bold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
            >
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
