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
  StickyNote,
  HelpCircle,
  PiggyBank,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/dashboard' },
    { icon: Receipt, label: t('common.transactions'), path: '/transactions' },
    { icon: Wallet, label: t('common.budget'), path: '/budget' },
    { icon: HandCoins, label: t('common.loans'), path: '/loans' },
    { icon: StickyNote, label: t('common.my_plan'), path: '/plans' },
    { icon: PiggyBank, label: t('common.savings'), path: '/savings' },
    { icon: Calendar, label: t('common.calendar'), path: '/calendar' },
    { icon: PieChart, label: t('common.reports'), path: '/reports' },
    { icon: User, label: t('common.profile'), path: '/profile' },
    { icon: HelpCircle, label: t('common.help_support'), path: '/help' },
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
          <div className="flex items-center justify-between mb-6 px-2">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                <Wallet className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">Money Tracker</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-xl lg:hidden"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-300 group
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

          <div className="pt-6 border-t border-gray-50 space-y-1">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold text-sm"
            >
              <div className="flex items-center gap-4">
                <Languages size={22} className="text-primary-600" />
                <span>{t('common.language')}</span>
              </div>
              <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-xl uppercase tracking-wider">
                {i18n.language === 'en' ? 'English' : 'বাংলা'}
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
            >
              <LogOut size={22} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
