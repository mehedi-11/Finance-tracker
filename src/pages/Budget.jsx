import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  Wallet,
  PieChart as PieChartIcon, 
  Edit2, 
  Trash2, 
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Search
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, Badge } from '../components/ui';
import { formatCurrency, categories } from '../utils/helpers';
import toast from 'react-hot-toast';

const Budget = () => {
  const { budgets, setBudget, deleteBudget, transactions } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthCategoryTotals = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentMonth;
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const [selectedCategory, setSelectedCategory] = useState(categories.expense[0]);
  const [amount, setAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setBudget(selectedCategory, Number(amount));
    setAmount('');
    toast.success(t('budget.title') + ' updated!');
  };

  const handleEdit = (budget) => {
    setSelectedCategory(budget.category);
    setAmount(budget.amount.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteBudget(deleteConfirm);
        toast.success('Budget removed');
        setDeleteConfirm(null);
      } catch (error) {
        console.error(error);
        toast.error('Failed to remove budget');
      }
    }
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-fade-in pb-20">
        {/* ... existing content ... */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('budget.title')}</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">{t('budget.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                <Wallet className="text-primary-600" size={24} />
                {t('budget.set_budget')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('common.category')}</label>
                  <select 
                    className="input-premium"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.expense.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input 
                  label={`${t('budget.limit')} (${user?.currency || 'BDT'})`} 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full py-4 font-bold shadow-lg shadow-primary-500/20">
                  {t('budget.set_budget')}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-primary-600 shrink-0" size={20} />
                  <p className="text-[10px] md:text-xs text-gray-600 font-medium leading-relaxed">
                    Setting a budget helps you track your progress. We'll alert you if you're close to exceeding your limits.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="Search by category..."
                className="w-full h-14 pl-12 pr-4 bg-white border-none shadow-sm rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-600/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {budgets.filter(b => b.category.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              budgets
                .filter(b => b.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((budget) => {
                const spent = monthCategoryTotals[budget.category] || 0;
                const percentage = Math.min((spent / budget.amount) * 100, 100);
                const isOver = spent > budget.amount;
                const isNear = spent > budget.amount * 0.8 && !isOver;

                return (
                  <Card key={budget.category} className="group transition-all bg-white border-none shadow-sm hover:shadow-md p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                          isOver ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          <PieChartIcon size={20} />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-gray-900">{budget.category}</h4>
                          <p className="text-xs md:text-sm text-gray-500 font-medium">
                            {formatCurrency(spent, user?.currency)} / {formatCurrency(budget.amount, user?.currency)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="sm:text-right hidden sm:block">
                          {isOver ? (
                            <Badge variant="danger">Over Budget</Badge>
                          ) : isNear ? (
                            <Badge variant="warning">Warning</Badge>
                          ) : (
                            <Badge variant="success">On Track</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(budget)}
                            className="p-2 hover:bg-primary-50 rounded-xl text-gray-400 hover:text-primary-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(budget._id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-100 rounded-xl overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full rounded-xl transition-all duration-1000 ${
                            isOver ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 
                            isNear ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.3)]' : 
                            'bg-primary-600 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-gray-400">
                        <span>{Math.round(percentage)}% used</span>
                        <span>Target: {formatCurrency(budget.amount, user?.currency)}</span>
                      </div>
                    </div>

                    {isOver && (
                      <div className="mt-4 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                        <AlertCircle size={16} />
                        <span>Exceeded by {formatCurrency(spent - budget.amount, user?.currency)}!</span>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card className="py-20 flex flex-col items-center justify-center text-center bg-white border-none shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  <PieChartIcon className="text-gray-300" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Budgets Set</h3>
                <p className="text-gray-500 font-medium max-w-sm mb-8 px-4">
                  Start by setting a monthly limit for a category like Food or Transport to track your spending.
                </p>
                <Button variant="secondary" className="flex items-center gap-2 bg-gray-50 border-none hover:bg-gray-100 font-bold text-gray-600">
                  Get Started <ArrowRight size={18} />
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal using Portal */}
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
                <h3 className="text-xl font-black text-gray-900 mb-2">Remove Budget?</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">This will delete your spending limit for this category. Your transactions will not be affected.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="bg-gray-100 border-none text-gray-600">Cancel</Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Remove</Button>
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

export default Budget;
