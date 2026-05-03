import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Wallet, 
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRight,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  HandCoins,
  StickyNote,
  PiggyBank,
  AlertCircle,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { 
    totals, 
    globalTotals,
    categoryTotals, 
    currentCycleTransactions,
    getCurrentCycleRange,
    totalSavings,
    unpaidTransactions,
    activeLoans,
    updateTransaction,
    getSpendingForecast,
    getAIAdvice,
    getFinancialHealth,
    goals,
    updateGoalProgress
  } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { start: cycleStart, end: cycleEnd } = getCurrentCycleRange();

  const [dateTime, setDateTime] = useState(new Date());
  const [isUnpaidModalOpen, setIsUnpaidModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [isLoansModalOpen, setIsLoansModalOpen] = useState(false);
  const [warningModal, setWarningModal] = useState({ isOpen: false, message: '' });

  const handlePayTransaction = async (transaction) => {
    if (transaction.amount > totals.balance) {
      setWarningModal({
        isOpen: true,
        message: `You cannot pay this expense because it exceeds your current month's balance (${formatCurrency(totals.balance, user?.currency)}).`
      });
      return;
    }

    try {
      await updateTransaction(transaction._id, {
        ...transaction,
        isPaid: true,
        date: new Date().toISOString() // Move to current month as per user request
      });
      toast.success('Expense paid successfully!');
    } catch (error) {
      toast.error('Failed to pay expense');
      console.error(error);
    }
  };

  const { getMonthlyReports, loans: allLoansData } = useFinance();
  const allReports = getMonthlyReports();
  const { start: cycleStartRange } = getCurrentCycleRange();
  
  // Exclude current month for savings history
  const pastSavingsMonths = allReports.filter(report => {
    return new Date(report.startDate) < cycleStartRange;
  });

  const unpaidLoans = allLoansData.filter(l => !l.isPaid);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const monthTotals = totals;
  const monthCategoryTotals = categoryTotals;

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

  const pieData = Object.keys(monthCategoryTotals).map((cat, index) => ({
    name: cat,
    value: monthCategoryTotals[cat],
    color: COLORS[index % COLORS.length]
  }));

  const barData = [
    { name: t('common.income'), amount: monthTotals.income, fill: '#10b981' },
    { name: t('common.expense'), amount: monthTotals.expenses, fill: '#ef4444' },
    { name: 'Forecast', amount: getSpendingForecast(), fill: '#6366f1' }
  ];

  const aiAdvice = getAIAdvice();
  const forecastAmount = getSpendingForecast();
  const health = getFinancialHealth();


  return (
    <>
      <div className="space-y-8 animate-fade-in pb-20">
        {/* Clean White Hero Section */}
        <div className="relative mb-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden group">
            {/* Decorative background shape */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-50 rounded-full blur-3xl opacity-60 group-hover:bg-primary-100 transition-all"></div>
            <div className="absolute top-4 right-4 opacity-[0.04] text-primary-900 pointer-events-none transform rotate-12 transition-transform group-hover:rotate-0 duration-700">
              <Wallet size={180} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full mb-6">
                  <Calendar size={14} className="text-primary-600" />
                  <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {dateTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="w-[1px] h-3 bg-gray-200"></div>
                  <span className="text-[10px] md:text-xs font-black text-gray-900 tracking-widest uppercase">
                    {dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-3">
                  {t('dashboard.hello')}, <br />
                  <span className="text-primary-600">{user?.name || 'User'}!</span>
                </h1>
                <p className="text-gray-500 text-sm md:text-lg font-medium max-w-md mx-auto md:mx-0">
                  {t('dashboard.welcome_msg')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <Link to="/budget">
                  <Button variant="secondary" className="w-full h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold px-6 text-sm flex items-center gap-2 transition-all">
                    <Wallet size={18} className="text-primary-600" /> {t('common.budget')}
                  </Button>
                </Link>
                <Link to="/loans">
                  <Button variant="secondary" className="w-full h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold px-6 text-sm flex items-center gap-2 transition-all">
                    <HandCoins size={18} className="text-primary-600" /> {t('common.loans')}
                  </Button>
                </Link>
                <Link to="/plans">
                  <Button variant="secondary" className="w-full h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-bold px-6 text-sm flex items-center gap-2 transition-all">
                    <StickyNote size={18} className="text-primary-600" /> {t('common.my_plan')}
                  </Button>
                </Link>
                <Link to="/transactions">
                  <Button className="w-full h-12 bg-primary-600 hover:bg-primary-500 text-white border-none rounded-xl font-black px-6 text-sm shadow-md shadow-primary-600/10 flex items-center gap-2 transition-all">
                    <Plus size={18} /> {t('dashboard.add_transaction')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            icon={Banknote} 
            color="primary" 
            label="Total Balance" 
            value={monthTotals.balance} 
            badgeText={monthTotals.savingsUsed > 0 ? `saving: +${monthTotals.savingsUsed}` : null}
            badgeColor="bg-emerald-100 text-emerald-700"
          />
          <StatCard icon={ArrowUpCircle} color="emerald" label={t('common.total_income')} value={monthTotals.income} />
          <StatCard icon={ArrowDownCircle} color="red" label={t('common.total_expenses')} value={monthTotals.expenses} />
          
          <StatCard 
            icon={PiggyBank} 
            color="purple" 
            label="Total Savings" 
            value={totalSavings} 
            onClick={() => setIsSavingsModalOpen(true)}
          />
          
          <StatCard 
            icon={HandCoins} 
            color="amber" 
            label="Active Loans" 
            value={activeLoans} 
            onClick={() => setIsLoansModalOpen(true)}
          />
          
          <StatCard 
            icon={AlertCircle} 
            color="rose" 
            label={`Unpaid Expenses (${unpaidTransactions.length})`} 
            value={unpaidTransactions.reduce((sum, t) => sum + Number(t.amount), 0)} 
            onClick={() => setIsUnpaidModalOpen(true)}
          />

          <StatCard 
            icon={TrendingUp} 
            color="indigo" 
            label="Spending Forecast" 
            value={forecastAmount} 
            badgeText="Next Month"
            badgeColor="bg-indigo-100 text-indigo-700"
          />
        </div>

        {/* Financial Advisor & Health Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-white to-primary-50/30 border-none shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                  <BarChart3 size={20} />
                </div>
                AI Financial Insights
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">{t('dashboard.live_analysis')}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {aiAdvice.length > 0 ? aiAdvice.map((advice, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-5 rounded-2xl border flex gap-4 transition-all hover:scale-[1.02] ${
                    advice.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                    advice.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    advice.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    'bg-blue-50 border-blue-100 text-blue-800'
                  }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    advice.type === 'danger' ? 'bg-rose-100' :
                    advice.type === 'warning' ? 'bg-amber-100' :
                    advice.type === 'success' ? 'bg-emerald-100' :
                    'bg-blue-100'
                  }`}>
                    {advice.type === 'danger' || advice.type === 'warning' ? <AlertCircle size={16} /> : <Check size={16} />}
                  </div>
                  <p className="text-xs font-bold leading-relaxed">{advice.text}</p>
                </motion.div>
              )) : (
                <div className="col-span-2 py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-bold">No critical insights at the moment. Keep it up!</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white border-none shadow-sm flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-6">{t('dashboard.health_score')}</p>
              
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={364.4}
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 - (364.4 * health.score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={
                      health.color === 'emerald' ? 'text-emerald-500' :
                      health.color === 'primary' ? 'text-primary-500' :
                      health.color === 'amber' ? 'text-amber-500' : 'text-rose-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900">{health.score}</span>
                  <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">{t('common.points')}</span>
                </div>
              </div>

              <Badge variant={health.color} className="px-6 py-2 text-xs font-black uppercase tracking-widest mb-4">
                {t(`health.${health.status.toLowerCase()}`)}
              </Badge>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-4">
                {t('health.subtitle')}
              </p>
            </div>
          </Card>
        </div>

        {/* Savings Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 bg-white border-none shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                  <TrendingUp size={20} />
                </div>
                {t('savings.active_goals')}
              </h3>
              <Link to="/savings">
                <Button variant="ghost" size="sm" className="text-primary-600 font-bold hover:bg-primary-50">{t('dashboard.view_all')}</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {goals.length > 0 ? goals.slice(0, 3).map((goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal._id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-primary-200 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={18} />
                      </div>
                      <Badge variant={progress >= 100 ? 'success' : 'info'} className="text-[8px] font-black tracking-widest">
                        {progress >= 100 ? 'COMPLETED' : `${Math.round(progress)}%`}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{goal.title}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mb-4">{formatCurrency(goal.targetAmount, user?.currency)} Target</p>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-black text-primary-600 text-right">
                      {formatCurrency(goal.currentAmount, user?.currency)} Saved
                    </p>
                  </div>
                );
              }) : (
                <div className="col-span-3 py-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                   <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                      <TrendingUp size={32} />
                   </div>
                   <p className="text-sm font-bold text-gray-400">Set a savings goal to start tracking!</p>
                   <Link to="/savings">
                     <Button variant="ghost" className="mt-4 text-primary-600 font-black text-xs uppercase tracking-widest">{t('savings.new_goal')}</Button>
                   </Link>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-none shadow-xl shadow-indigo-600/20 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-[10px] uppercase font-black text-indigo-100 tracking-widest mb-8">{t('dashboard.savings_potential')}</p>
              <h4 className="text-4xl font-black mb-4">
                {formatCurrency(Math.max(0, totals.income - forecastAmount), user?.currency)}
              </h4>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-auto">
                Based on your current habits, you could potentially save this amount next month.
              </p>
              <div className="pt-6 border-t border-white/10 mt-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-200">
                    <span>{t('dashboard.forecast_factor')}</span>
                    <span>94% Accurate</span>
                 </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Extra Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm flex items-center gap-5 p-6 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{t('reports.highest_income')}</p>
              <h4 className="text-xl font-bold text-emerald-700">
                {currentCycleTransactions
                  .filter(t => t.type === 'income')
                  .sort((a,b) => b.amount - a.amount)[0]?.category || 'N/A'}
              </h4>
            </div>
          </Card>
          
          <Card className="bg-white border-none shadow-sm flex items-center gap-5 p-6 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <TrendingDown size={28} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{t('reports.major_spending')}</p>
              <h4 className="text-xl font-bold text-red-700">
                {Object.keys(monthCategoryTotals).sort((a,b) => monthCategoryTotals[b] - monthCategoryTotals[a])[0] || 'N/A'}
              </h4>
            </div>
          </Card>

          <Card className="bg-white border-none shadow-sm flex items-center gap-5 p-6 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{t('reports.saving_rate')}</p>
              <h4 className="text-xl font-bold text-primary-700">
                {monthTotals.income > 0 ? Math.round((monthTotals.balance / monthTotals.income) * 100) : 0}%
              </h4>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <PieChartIcon className="text-purple-600" size={24} />
                {t('dashboard.spending_by_category')}
              </h3>
            </div>
            <div className="h-[350px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderColor: '#f1f5f9', 
                        borderRadius: '12px',
                        color: '#1e293b',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value) => formatCurrency(value, user?.currency)}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                  {t('dashboard.no_data')}
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <BarChart3 className="text-emerald-600" size={24} />
                {t('dashboard.income_vs_expenses')}
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${user?.currency || 'BDT'} ${value}`} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#f1f5f9', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => formatCurrency(value, user?.currency)}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={60}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Unpaid Transactions Modal via Portal */}
      {createPortal(
        <AnimatePresence>
          {isUnpaidModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsUnpaidModalOpen(false)} 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <AlertCircle className="text-rose-600" /> Unpaid Transactions
                  </h2>
                  <button onClick={() => setIsUnpaidModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {unpaidTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {unpaidTransactions.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                          <div>
                            <h4 className="font-bold text-gray-900">{t.description}</h4>
                            <p className="text-xs text-gray-500 font-medium">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-rose-600">{formatCurrency(t.amount, user?.currency)}</span>
                            <button
                              onClick={() => handlePayTransaction(t)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20"
                            >
                              <Check size={12} strokeWidth={4} /> Pay Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Banknote size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
                      <p className="text-gray-500 text-sm">You don't have any unpaid expenses.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Savings History Modal */}
      {createPortal(
        <AnimatePresence>
          {isSavingsModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsSavingsModalOpen(false)} 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <PiggyBank className="text-purple-600" /> Savings History
                  </h2>
                  <button onClick={() => setIsSavingsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {pastSavingsMonths.length > 0 ? (
                    <div className="space-y-4">
                      {pastSavingsMonths.map(report => (
                        <div key={report.month} className="flex items-center justify-between p-4 rounded-xl border border-purple-100 bg-purple-50/30">
                          <div>
                            <h4 className="font-bold text-gray-900">{report.month}</h4>
                            <p className="text-xs text-gray-500 font-medium">{t('dashboard.saved_from_income')}</p>
                          </div>
                          <span className="font-black text-purple-600">{formatCurrency(report.savings, user?.currency)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No past savings history found.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Active Loans Modal */}
      {createPortal(
        <AnimatePresence>
          {isLoansModalOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsLoansModalOpen(false)} 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <HandCoins className="text-amber-600" /> Active Loans
                  </h2>
                  <button onClick={() => setIsLoansModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {unpaidLoans.length > 0 ? (
                    <div className="space-y-4">
                      {unpaidLoans.map(loan => (
                        <div key={loan._id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                          <div>
                            <h4 className="font-bold text-gray-900">{loan.lender}</h4>
                            <p className="text-xs text-gray-500 font-medium">{loan.purpose} • Due: {new Date(loan.expectedPayDate).toLocaleDateString()}</p>
                          </div>
                          <span className="font-black text-amber-600">{formatCurrency(loan.amount, user?.currency)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No active loans.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Warning Modal */}
      {createPortal(
        <AnimatePresence>
          {warningModal.isOpen && (
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWarningModal({ isOpen: false, message: '' })} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="text-amber-500" size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{t('dashboard.insufficient_balance')}</h3>
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">{warningModal.message}</p>
                <Button onClick={() => setWarningModal({ isOpen: false, message: '' })} className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none py-4 font-black rounded-xl">I Understand</Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const StatCard = ({ icon: Icon, label, value, color = 'primary', onClick, badgeText, badgeColor }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const colorMap = {
    primary: { bg: 'bg-primary-600', text: 'text-primary-600', light: 'bg-primary-50', iconBg: 'bg-primary-600/10', shadow: 'shadow-primary-600/30' },
    secondary: { bg: 'bg-secondary-600', text: 'text-secondary-600', light: 'bg-secondary-50', iconBg: 'bg-secondary-600/10', shadow: 'shadow-secondary-600/30' },
    success: { bg: 'bg-success-600', text: 'text-success-600', light: 'bg-success-50', iconBg: 'bg-success-600/10', shadow: 'shadow-success-600/30' },
    purple: { bg: 'bg-primary-600', text: 'text-primary-600', light: 'bg-primary-50', iconBg: 'bg-primary-600/10', shadow: 'shadow-primary-600/30' },
    amber: { bg: 'bg-secondary-600', text: 'text-secondary-600', light: 'bg-secondary-50', iconBg: 'bg-secondary-600/10', shadow: 'shadow-secondary-600/30' },
    rose: { bg: 'bg-secondary-600', text: 'text-secondary-600', light: 'bg-secondary-50', iconBg: 'bg-secondary-600/10', shadow: 'shadow-secondary-600/30' },
    emerald: { bg: 'bg-success-600', text: 'text-success-600', light: 'bg-success-50', iconBg: 'bg-success-600/10', shadow: 'shadow-success-600/30' },
    red: { bg: 'bg-secondary-600', text: 'text-secondary-600', light: 'bg-secondary-50', iconBg: 'bg-secondary-600/10', shadow: 'shadow-secondary-600/30' }
  };

  const style = colorMap[color] || colorMap.primary;

  return (
    <Card 
      onClick={onClick}
      className={`relative overflow-hidden group bg-white border-none shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      {onClick && (
        <div className="absolute bottom-4 right-4 z-20">
          <div className={`w-8 h-8 ${style.bg} text-white rounded-full flex items-center justify-center shadow-lg ${style.shadow} group-hover:translate-x-1 transition-all duration-300`}>

            <ArrowRight size={14} strokeWidth={3} />
          </div>
        </div>
      )}
      <div className={`absolute top-0 right-0 w-32 h-32 ${style.light} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform opacity-60`}></div>
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:justify-between md:text-left relative z-10 gap-4">
        <div className="order-2 md:order-1">
          <div className="flex flex-col items-center md:items-start gap-1 mb-1">
            <div className="flex items-center gap-2">
              <p className="text-gray-600 text-xs font-black uppercase tracking-wider">{label}</p>
              {badgeText && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
                  {badgeText}
                </span>
              )}
            </div>
          </div>
          <h2 className={`text-2xl font-black ${style.text}`}>
            {formatCurrency(value || 0, user?.currency)}
          </h2>
        </div>
        <div className={`w-14 h-14 ${style.iconBg} rounded-full flex items-center justify-center order-1 md:order-2 transition-all group-hover:scale-110 shadow-sm shadow-black/5`}>
          <Icon className={style.text} size={28} />
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
