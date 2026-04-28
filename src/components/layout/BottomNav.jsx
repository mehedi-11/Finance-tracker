import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  HandCoins,
  StickyNote
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Wallet, label: t('common.budget'), path: '/budget' },
    { icon: Receipt, label: t('common.transactions'), path: '/transactions' },
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/dashboard' },
    { icon: StickyNote, label: t('common.my_plan'), path: '/plans' },
    { icon: HandCoins, label: t('common.loans'), path: '/loans' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300
                ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <div className={`
                p-1.5 rounded-xl transition-all duration-300
                ${isActive ? 'bg-primary-50 text-primary-600 scale-110' : ''}
              `}>
                <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
