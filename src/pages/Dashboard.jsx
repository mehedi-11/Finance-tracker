import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Wallet, 
  StickyNote, 
  Trash2, 
  X, 
  AlertTriangle,
  HandCoins,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
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
import { Button, Card, Input } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/helpers';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const NOTES_URL = API_ENDPOINTS.NOTES;

const Dashboard = () => {
  const { transactions, totals, categoryTotals, getMonthlyReports, loans, addTransaction, addLoan, deleteMonthData, fetchFinanceData } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentMonth;
  });

  const monthTotals = {
    income: currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    expenses: currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
  };
  monthTotals.balance = monthTotals.income - monthTotals.expenses;

  const monthCategoryTotals = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

  const pieData = Object.keys(monthCategoryTotals).map((cat, index) => ({
    name: cat,
    value: monthCategoryTotals[cat],
    color: COLORS[index % COLORS.length]
  }));

  const barData = [
    { name: t('common.income'), amount: monthTotals.income, fill: '#10b981' },
    { name: t('common.expense'), amount: monthTotals.expenses, fill: '#ef4444' }
  ];
  const [notes, setNotes] = useState(() => {
    try {
      const cached = localStorage.getItem('finance_notes');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [noteData, setNoteData] = useState({ title: '', content: '', amount: '', plannedDate: '' });

  useEffect(() => {
    if (user?.token) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(NOTES_URL, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data);
        localStorage.setItem('finance_notes', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Notes fetch error:', err);
    }
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteData({
        title: note.title,
        content: note.content || '',
        amount: note.amount || '',
        plannedDate: note.plannedDate ? note.plannedDate.split('T')[0] : ''
      });
    } else {
      setEditingNote(null);
      setNoteData({ title: '', content: '', amount: '', plannedDate: '' });
    }
    setIsNoteModalOpen(true);
  };

  const handleAddOrUpdateNote = async (e) => {
    e.preventDefault();
    const url = editingNote ? `${NOTES_URL}/${editingNote._id}` : NOTES_URL;
    const method = editingNote ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(noteData),
      });
      if (response.ok) {
        toast.success(editingNote ? 'Plan updated!' : 'Future plan noted!');
        setIsNoteModalOpen(false);
        fetchNotes();
        setNoteData({ title: '', content: '', amount: '', plannedDate: '' });
      }
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await fetch(`${NOTES_URL}/${deleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        toast.success('Note removed');
        setDeleteConfirm(null);
        fetchNotes();
      }
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const toggleNoteStatus = async (note) => {
    try {
      const response = await fetch(`${NOTES_URL}/${note._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ isCompleted: !note.isCompleted }),
      });
      if (response.ok) {
        fetchNotes();
        toast.success(note.isCompleted ? 'Marked as active' : 'Marked as completed!');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };
  // Sync notes to localStorage whenever they change
  useEffect(() => {
    if (user && notes.length > 0) {
      localStorage.setItem('finance_notes', JSON.stringify(notes));
    } else if (!user) {
      localStorage.removeItem('finance_notes');
    }
  }, [notes, user]);



  const recentTransactions = currentMonthTransactions.slice(0, 5) || [];

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-20">
        {/* Header Section - Premium Dark Leaf Box for All Screens */}
        <div className="bg-[#1a0b2e] rounded-tl-[30px] md:rounded-tl-[60px] rounded-br-[30px] md:rounded-br-[60px] px-10 py-12 md:px-16 md:py-20 mb-4 shadow-2xl shadow-purple-900/20 animate-fade-in relative z-20 transition-all">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10 md:gap-4 flex-wrap">
            <div className="text-center md:text-left w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                {t('dashboard.hello')}, {user?.name || 'User'}!
              </h1>
              <p className="text-purple-300 font-bold text-sm md:text-lg mt-2 md:mt-1 opacity-90">
                {t('dashboard.welcome_msg')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full md:w-auto">
              <Link to="/budget" className="w-full">
                <Button variant="secondary" className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/20 backdrop-blur-xl rounded-xl transition-all text-xs md:text-sm font-bold px-3">
                  <Wallet size={18} className="text-primary-300" /> {t('common.budget')}
                </Button>
              </Link>
              <Link to="/loans" className="w-full">
                <Button variant="secondary" className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/20 backdrop-blur-xl rounded-xl transition-all text-xs md:text-sm font-bold px-3">
                  <HandCoins size={18} className="text-primary-300" /> {t('common.loans')}
                </Button>
              </Link>
              <Link to="/plans" className="w-full">
                <Button variant="secondary" className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/20 backdrop-blur-xl rounded-xl transition-all text-xs md:text-sm font-bold px-3">
                  <StickyNote size={18} className="text-primary-300" /> {t('common.my_plan')}
                </Button>
              </Link>
              <Link to="/transactions" className="w-full">
                <Button className="w-full h-11 flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-700 border-none rounded-xl shadow-lg shadow-primary-600/20 transition-all text-xs md:text-sm font-bold px-3">
                  <Plus size={18} /> {t('dashboard.add_transaction')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Banknote} color="primary" label={t('common.total_balance')} value={monthTotals.balance} />
          <StatCard icon={ArrowUpCircle} color="emerald" label={t('common.total_income')} value={monthTotals.income} />
          <StatCard icon={ArrowDownCircle} color="red" label={t('common.total_expenses')} value={monthTotals.expenses} />
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
                {currentMonthTransactions
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

      {/* Note Modal via Portal */}
      {createPortal(
        <AnimatePresence>
          {isNoteModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsNoteModalOpen(false)}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white border border-gray-100 rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-8 md:p-10 pb-4">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <StickyNote className="text-primary-600" /> {editingNote ? 'Edit Plan' : 'New Plan'}
                  </h2>
                  <button 
                    onClick={() => setIsNoteModalOpen(false)} 
                    className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 custom-scrollbar">
                  <form onSubmit={handleAddOrUpdateNote} className="space-y-6">
                    <Input label="Title" placeholder="e.g. New Laptop" value={noteData.title} onChange={e => setNoteData({...noteData, title: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Amount" type="number" placeholder="0.00" value={noteData.amount} onChange={e => setNoteData({...noteData, amount: e.target.value})} />
                      <Input label="Planned Date" type="date" value={noteData.plannedDate} onChange={e => setNoteData({...noteData, plannedDate: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 ml-1">Notes / Description</label>
                      <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        rows={3}
                        value={noteData.content}
                        onChange={e => setNoteData({...noteData, content: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg font-bold mt-4">
                      {editingNote ? 'Save Changes' : 'Add to Future Plans'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal via Portal */}
      {createPortal(
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-sm bg-white rounded-xl p-8 text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="text-red-500" size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Are you sure?</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">This action cannot be undone. This plan will be permanently removed.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="bg-gray-100 border-none text-gray-600">Cancel</Button>
                  <Button onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700 text-white border-none">Yes, Delete</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const StatCard = ({ icon: Icon, color, label, value }) => {
  const { user } = useAuth();
  return (
    <Card className="relative overflow-hidden group bg-white border-none shadow-sm hover:shadow-md transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-600 text-xs font-black uppercase tracking-wider mb-1">{label}</p>
          <h2 className={`text-2xl font-black ${color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(value || 0, user?.currency)}
          </h2>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
