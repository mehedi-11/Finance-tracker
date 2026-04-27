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
  HandCoins
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/helpers';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';

const NOTES_URL = API_ENDPOINTS.NOTES;

const Dashboard = () => {
  const { transactions, totals } = useFinance();
  const { user } = useAuth();
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
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight whitespace-nowrap">Hello, {user?.name || 'User'}!</h1>
            <p className="text-gray-600 font-medium text-sm">Track your progress and plan your future costs.</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            <Link to="/budget" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-white border-gray-200">
                <LayoutDashboard size={18} className="text-primary-600" /> Budget
              </Button>
            </Link>
            <Link to="/loans" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-white border-gray-200">
                <HandCoins size={18} className="text-amber-600" /> Loans
              </Button>
            </Link>
            <Link to="/plans" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 bg-white border-gray-200">
                <StickyNote size={18} className="text-primary-600" /> My Plan
              </Button>
            </Link>
            <Link to="/transactions" className="flex-1 sm:flex-none">
              <Button className="w-full flex items-center justify-center gap-2">
                <Plus size={18} /> Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Wallet} color="primary" label="Total Balance" value={totals.balance} />
          <StatCard icon={ArrowUpRight} color="emerald" label="Total Income" value={totals.income} />
          <StatCard icon={ArrowDownRight} color="red" label="Total Expenses" value={totals.expenses} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white border-none shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <Link to="/transactions" className="text-primary-600 text-sm font-bold hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{t.description}</p>
                          <p className="text-xs text-gray-500 font-medium">{t.category} • {formatDate(t.date)}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-black ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <ReceiptText size={48} className="mb-4 opacity-20" />
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Future Cost Plans (Notes) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-none shadow-sm h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <StickyNote className="text-primary-600" size={24} /> Future Plans
                </h3>
              </div>
              
              <div className="space-y-4">
                {Array.isArray(notes) && notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note._id} className={`p-4 rounded-2xl border transition-all space-y-2 relative group ${
                      note.isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-70' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <button 
                          onClick={() => toggleNoteStatus(note)}
                          className={`mt-1 shrink-0 ${note.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-primary-500'}`}
                        >
                          {note.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm ${note.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{note.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{note.content}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(note)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-600">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(note._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">{note.plannedDate ? formatDate(note.plannedDate) : 'No Date'}</span>
                        <span className="text-xs font-bold text-gray-900">{formatCurrency(note.amount, user?.currency)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-sm font-medium">No plans noted yet.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
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
                className="relative w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-8 md:p-10 pb-4">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <StickyNote className="text-primary-600" /> {editingNote ? 'Edit Plan' : 'New Plan'}
                  </h2>
                  <button 
                    onClick={() => setIsNoteModalOpen(false)} 
                    className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
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
                className="relative w-full max-w-sm bg-white rounded-[2rem] p-8 text-center shadow-2xl"
              >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
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
        <div className={`w-12 h-12 bg-${color}-100 rounded-2xl flex items-center justify-center`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
