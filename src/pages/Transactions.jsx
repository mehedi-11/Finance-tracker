import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Filter,
  AlertTriangle,
  CheckCircle,
  Circle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { formatCurrency, formatDate, categories } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Transactions = () => {
  const { t } = useTranslation();
  const { transactions, addTransaction, deleteTransaction, updateTransaction, loans, getCurrentCycleRange } = useFinance();
  const { user } = useAuth();

  // Combine default categories with active loans for expense type
  const dynamicCategories = {
    ...categories,
    expense: [...categories.expense, ...loans.filter(l => !l.isPaid).map(l => `${l.lender} (Loan)`)]
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    isPaid: true
  });

  const { start: cycleStart, end: cycleEnd } = getCurrentCycleRange();

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const cycleMatch = d >= cycleStart && d <= cycleEnd;
    const searchMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === 'all' || t.type === filterType;

    return cycleMatch && searchMatch && typeMatch;
  });

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        isPaid: transaction.isPaid ?? true
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        isPaid: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: Number(formData.amount)
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, data);
        toast.success('Transaction updated!');
      } else {
        await addTransaction(data);
        toast.success('Transaction added!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteTransaction(deleteConfirm);
        toast.success('Transaction deleted');
        setDeleteConfirm(null);
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleTogglePaid = async (transaction) => {
    try {
      const isCurrentlyPaid = transaction.isPaid !== false;
      const updatedData = { ...transaction, isPaid: !isCurrentlyPaid };
      await updateTransaction(transaction._id, updatedData);
      toast.success(!isCurrentlyPaid ? 'Marked as Paid' : 'Marked as Unpaid');
    } catch (err) {
      toast.error('Toggle failed');
    }
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('transactions.title')}</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">{t('transactions.subtitle')}</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 w-full md:w-auto">
            <Plus size={20} /> {t('common.add_new')}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('transactions.search_placeholder')}
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 bg-white border border-gray-200 p-3 rounded-xl text-gray-600 font-bold"
          >
            <Filter size={18} /> {t('transactions.filters')}
          </button>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-wrap gap-2`}>
            {['all', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-xl border transition-all capitalize font-bold text-xs md:text-sm ${filterType === type
                  ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {t(`common.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-0 bg-white border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-black">
                  <th className="px-4 md:px-6 py-4">{t('common.description')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.category')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.date')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.amount')}</th>
                  <th className="px-4 md:px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <motion.tr
                      key={t._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <span className="font-bold text-gray-900 text-sm md:text-base">{t.description}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <Badge variant={t.type === 'income' ? 'success' : 'info'}>
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-500 font-medium text-xs md:text-sm">
                        {formatDate(t.date)}
                      </td>
                      <td className={`px-4 md:px-6 py-4 font-black text-sm md:text-base ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        <div className="flex flex-col">
                          <span>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}</span>
                          {t.type === 'expense' && t.isPaid === false && (
                            <span className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">Unpaid</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => handleOpenModal(t)}
                            className="p-2 hover:bg-primary-50 rounded-xl text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(t._id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                          <Search size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-bold text-gray-400">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Transaction Modal (Add/Edit) via Portal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-8 md:p-10 pb-4">
                  <h2 className="text-2xl font-black text-gray-900">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-3 p-1.5 bg-gray-50 rounded-xl">
                      {['expense', 'income'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type, category: type === 'income' ? 'Salary' : 'Food', isPaid: type === 'income' ? true : formData.isPaid })}
                          className={`flex-1 py-3.5 rounded-xl transition-all capitalize font-black text-sm ${formData.type === type
                            ? type === 'income' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <Input label="Description" placeholder="e.g. Shopping" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Amount" type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                        <select className="input-premium" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                          {dynamicCategories[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>
                    <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

                    {formData.type === 'expense' && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1">Payment Status</label>
                        <select
                          className="input-premium"
                          value={formData.isPaid ? 'true' : 'false'}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.value === 'true' }))}
                        >
                          <option value="true">Paid</option>
                          <option value="false">Unpaid</option>
                        </select>
                        <p className="text-[10px] text-gray-500 italic ml-1">
                          {formData.isPaid ? 'This will deduct from your balance.' : 'This will be ignored (No balance/expense change).'}
                        </p>
                      </div>
                    )}
                    <Button type="submit" className="w-full py-4 text-lg font-bold mt-4">
                      {editingTransaction ? 'Update Record' : 'Save Transaction'}
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
                <p className="text-gray-500 text-sm font-medium mb-8">This action cannot be undone. This transaction will be permanently removed.</p>
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

export default Transactions;
