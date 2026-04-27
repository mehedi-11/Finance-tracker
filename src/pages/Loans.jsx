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
  HandCoins,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/helpers';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Loans = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { loans, addLoan, deleteLoan, updateLoan } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [formData, setFormData] = useState({
    lender: '',
    purpose: '',
    amount: '',
    expectedPayDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    type: 'get'
  });

  const filteredLoans = loans.filter(l => 
    l.lender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        lender: loan.lender,
        purpose: loan.purpose,
        amount: loan.amount,
        expectedPayDate: loan.expectedPayDate ? loan.expectedPayDate.split('T')[0] : new Date().toISOString().split('T')[0],
        isPaid: loan.isPaid,
        type: loan.type || 'get'
      });
    } else {
      setEditingLoan(null);
      setFormData({
        lender: '',
        purpose: '',
        amount: '',
        expectedPayDate: new Date().toISOString().split('T')[0],
        isPaid: false,
        type: 'get'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingLoan) {
        await updateLoan(editingLoan._id, formData);
        toast.success('Loan record updated!');
      } else {
        await addLoan(formData);
        toast.success('Loan record saved!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteLoan(deleteConfirm);
      toast.success('Record removed');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const togglePaidStatus = async (loan) => {
    try {
      await updateLoan(loan._id, { isPaid: !loan.isPaid });
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('loans.title')}</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">{t('loans.subtitle')}</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 w-full md:w-auto">
            <Plus size={20} /> {t('common.add_new')}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or purpose..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="p-0 bg-white border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-black">
                  <th className="px-4 md:px-6 py-4">{t('loans.lender')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.type')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.purpose')}</th>
                  <th className="px-4 md:px-6 py-4">{t('loans.target_date')}</th>
                  <th className="px-4 md:px-6 py-4">{t('common.amount')}</th>
                  <th className="px-4 md:px-6 py-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLoans.length > 0 ? (
                  filteredLoans.map((l) => (
                    <motion.tr 
                      key={l._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50/50 transition-colors group ${l.isPaid ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${
                            l.type === 'get' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {l.type === 'get' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                          </div>
                          <span className={`font-bold text-sm md:text-base ${l.isPaid ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{l.lender}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <Badge variant={l.type === 'get' ? 'warning' : 'success'}>
                          {l.type === 'get' ? t('loans.received') : t('loans.given')}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-600 font-medium text-xs md:text-sm">
                        {l.purpose}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-500 font-medium text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(l.expectedPayDate)}
                        </div>
                      </td>
                      <td className={`px-4 md:px-6 py-4 font-black text-sm md:text-base ${
                        l.type === 'get' ? 'text-amber-600' : 'text-emerald-600'
                      } ${l.isPaid ? 'text-gray-400!' : ''}`}>
                        {formatCurrency(l.amount, user?.currency)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <button 
                            onClick={() => togglePaidStatus(l)}
                            className={`p-2 rounded-xl transition-colors ${l.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-emerald-600'}`}
                            title={l.isPaid ? 'Mark as active' : 'Mark as settled'}
                          >
                            <Badge variant={l.isPaid ? 'success' : 'info'}>{l.isPaid ? 'Settled' : 'Mark Settled'}</Badge>
                          </button>
                          <button 
                            onClick={() => handleOpenModal(l)}
                            className="p-2 hover:bg-primary-50 rounded-xl text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(l._id)}
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
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                          <HandCoins size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-bold text-gray-400">No records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Unified Loan Modal */}
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
                  <h2 className="text-2xl font-black text-gray-900">{editingLoan ? 'Edit Record' : 'Add Loan Record'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700 ml-1">Loan Type</label>
                      <div className="flex gap-3 p-1.5 bg-gray-50 rounded-xl">
                        {[
                          { id: 'get', label: 'Received (Debt)', color: 'amber' },
                          { id: 'give', label: 'Given (Lent)', color: 'emerald' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: t.id })}
                            className={`flex-1 py-3.5 rounded-xl transition-all capitalize font-black text-sm ${
                              formData.type === t.id 
                                ? t.id === 'get' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input label="Person / Bank Name" placeholder="e.g. John Doe" value={formData.lender} onChange={(e) => setFormData({ ...formData, lender: e.target.value })} required />
                    <Input label="Purpose" placeholder="e.g. Business help, Car" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Amount" type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                      <Input label="Expected Date" type="date" value={formData.expectedPayDate} onChange={(e) => setFormData({ ...formData, expectedPayDate: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full py-4 text-lg font-bold mt-4" disabled={loading}>
                      {loading ? 'Processing...' : (editingLoan ? 'Update Record' : 'Save Record')}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation */}
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
                <p className="text-gray-500 text-sm font-medium mb-8">This record and its related transaction will be removed.</p>
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

export default Loans;
