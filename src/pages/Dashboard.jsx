import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ReceiptText, 
  StickyNote, 
  CheckCircle2, 
  Circle, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle,
  LayoutDashboard,
  HandCoins,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart as PieChartIcon,
  BarChart3
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
  const { transactions, totals, categoryTotals } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

  const pieData = Object.keys(categoryTotals).map((cat, index) => ({
    name: cat,
    value: categoryTotals[cat],
    color: COLORS[index % COLORS.length]
  }));

  const barData = [
    { name: 'Income', amount: totals.income, fill: '#10b981' },
    { name: 'Expenses', amount: totals.expenses, fill: '#ef4444' }
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

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-20">
        {/* Header Section - Custom Dark Box for Mobile, Standard for Desktop */}
        <div className="bg-[#1a0b2e] md:bg-transparent -mx-4 -mt-4 md:mx-0 md:mt-0 rounded-b-[60px] md:rounded-none p-14 md:p-0 mb-10 md:mb-8 shadow-2xl shadow-purple-900/20 md:shadow-none animate-fade-in relative z-20 transition-all">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-4 flex-wrap">
            <div className="text-center md:text-left w-full md:w-auto">
              <h1 className="text-3xl sm:text-4xl md:text-2xl lg:text-3xl font-black md:font-bold text-white md:text-gray-900 leading-tight whitespace-nowrap tracking-tight">
                {t('dashboard.hello')}, {user?.name || 'User'}!
              </h1>
              <p className="text-purple-300 md:text-gray-600 font-bold md:font-medium text-base md:text-sm mt-2 md:mt-1 opacity-90 md:opacity-100">
                {t('dashboard.welcome_msg')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 md:gap-3">
              <Link to="/budget" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full h-12 md:h-auto flex items-center justify-center gap-2 bg-white/5 md:bg-white border-white/10 md:border-gray-200 text-white md:text-gray-900 hover:bg-white/10 md:hover:bg-gray-50 backdrop-blur-xl md:backdrop-blur-none rounded-xl transition-all">
                  <Wallet size={20} className="text-purple-400 md:text-purple-600" /> {t('common.budget')}
                </Button>
              </Link>
              <Link to="/loans" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full h-12 md:h-auto flex items-center justify-center gap-2 bg-white/5 md:bg-white border-white/10 md:border-gray-200 text-white md:text-gray-900 hover:bg-white/10 md:hover:bg-gray-50 backdrop-blur-xl md:backdrop-blur-none rounded-xl transition-all">
                  <HandCoins size={20} className="text-purple-400 md:text-purple-600" /> {t('common.loans')}
                </Button>
              </Link>
              <Link to="/plans" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full h-12 md:h-auto flex items-center justify-center gap-2 bg-white/5 md:bg-white border-white/10 md:border-gray-200 text-white md:text-gray-900 hover:bg-white/10 md:hover:bg-gray-50 backdrop-blur-xl md:backdrop-blur-none rounded-xl transition-all">
                  <StickyNote size={20} className="text-purple-400 md:text-purple-600" /> {t('common.my_plan')}
                </Button>
              </Link>
              <Link to="/transactions" className="flex-1 sm:flex-none">
                <Button className="w-full h-12 md:h-auto flex items-center justify-center gap-2 bg-purple-500 md:bg-primary-600 text-white hover:bg-purple-400 md:hover:bg-primary-700 border-none rounded-xl shadow-lg shadow-purple-500/20 md:shadow-none transition-all">
                  <Plus size={20} /> {t('dashboard.add_transaction')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Banknote} color="primary" label="Total Balance" value={totals.balance} />
          <StatCard icon={ArrowUpCircle} color="emerald" label="Total Income" value={totals.income} />
          <StatCard icon={ArrowDownCircle} color="red" label="Total Expenses" value={totals.expenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <PieChartIcon className="text-purple-600" size={24} />
                Spending by Category
              </h3>
            </div>
            <div className="h-[350px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
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
                  No expense data available
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <BarChart3 className="text-emerald-600" size={24} />
                Income vs Expenses
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-xl -mr-16 -mt-16 group-hover:scale-110 transition-transform`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-600 text-xs font-black uppercase tracking-wider mb-1">{label}</p>
          <h2 className={`text-2xl font-black ${color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(value || 0, user?.currency)}
          </h2>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
