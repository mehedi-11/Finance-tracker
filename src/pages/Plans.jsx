import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X,
  AlertTriangle,
  StickyNote,
  CheckCircle2,
  Circle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/helpers';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';

const Plans = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState(() => {
    try {
      const cached = localStorage.getItem('finance_notes');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    amount: '',
    plannedDate: new Date().toISOString().split('T')[0],
    isCompleted: false
  });

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(API_ENDPOINTS.NOTES, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data);
        localStorage.setItem('finance_notes', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || '',
        amount: note.amount || '',
        plannedDate: note.plannedDate ? note.plannedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        isCompleted: note.isCompleted
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        amount: '',
        plannedDate: new Date().toISOString().split('T')[0],
        isCompleted: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editingNote ? `${API_ENDPOINTS.NOTES}/${editingNote._id}` : API_ENDPOINTS.NOTES;
    const method = editingNote ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingNote ? 'Plan updated!' : 'Future plan added!');
        setIsModalOpen(false);
        fetchNotes();
      }
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTES}/${deleteConfirm}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        toast.success('Plan removed');
        setDeleteConfirm(null);
        fetchNotes();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const toggleCompleteStatus = async (note) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NOTES}/${note._id}`, {
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

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Plans</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">Future goals and cost predictions.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 w-full md:w-auto">
            <Plus size={20} /> Add New Plan
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search plans..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative p-6 rounded-[2rem] border transition-all ${
                  note.isCompleted ? 'bg-gray-50/50 border-gray-100' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <button 
                    onClick={() => toggleCompleteStatus(note)}
                    className={`p-2 rounded-xl transition-colors ${note.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-primary-600'}`}
                  >
                    {note.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(note)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-primary-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirm(note._id)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-lg font-black ${note.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{note.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3">{note.content}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                    <Calendar size={14} />
                    {note.plannedDate ? formatDate(note.plannedDate) : 'No Date'}
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    {formatCurrency(note.amount || 0, user?.currency)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <StickyNote size={40} className="text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-400">No plans found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-8 md:p-10 pb-4">
                  <h2 className="text-2xl font-black text-gray-900">{editingNote ? 'Edit Plan' : 'New Plan'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input label="Title" placeholder="e.g. Dream House Fund" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Target Amount" type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                      <Input label="Planned Date" type="date" value={formData.plannedDate} onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 ml-1">Notes / Description</label>
                      <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        rows={4}
                        placeholder="Details about your plan..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg font-bold mt-4" disabled={loading}>
                      {loading ? 'Processing...' : (editingNote ? 'Save Changes' : 'Create Plan')}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
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
                <p className="text-gray-500 text-sm font-medium mb-8">This plan will be permanently removed.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="bg-gray-100 border-none text-gray-600">Cancel</Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Yes, Delete</Button>
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

export default Plans;
