import { useState, createPortal } from 'react';
import { 
  PiggyBank, 
  ArrowRight,
  Search,
  Plus,
  Trash2,
  X,
  Target,
  TrendingUp
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Savings = () => {
  const { getMonthlyReports, totalSavings, getCurrentCycleRange, goals, addGoal, deleteGoal, updateGoalProgress } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: ''
  });

  const allReports = getMonthlyReports();
  const { start } = getCurrentCycleRange();

  const pastMonths = allReports.filter(report => new Date(report.startDate) < start);
  const filteredPastMonths = pastMonths.filter(m => m.month.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return toast.error('Please fill all fields');
    addGoal(newGoal);
    setIsModalOpen(false);
    setNewGoal({ title: '', targetAmount: '', deadline: '' });
    toast.success('Savings goal created!');
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!progressAmount) return;
    updateGoalProgress(selectedGoal._id, progressAmount);
    setIsProgressModalOpen(false);
    setProgressAmount('');
    toast.success('Progress updated!');
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PiggyBank className="text-primary-600" size={32} />
            {t('savings.title') || 'My Savings'}
          </h1>
          <p className="text-gray-500 font-medium">Manage your goals and track unspent money.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm p-8 md:p-10 relative overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Total Available Savings</p>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900">{formatCurrency(totalSavings, user?.currency)}</h2>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 text-xs max-w-xs mx-auto md:ml-auto md:mr-0 leading-relaxed font-medium">
                This is the sum of all your past months' unspent income. Use "Saving" category in income to use it.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 border-none shadow-lg shadow-primary-600/20 text-white flex flex-col justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-100 mb-4">Active Goals</p>
            <h3 className="text-4xl font-black mb-2">{goals.length}</h3>
            <p className="text-xs text-primary-50 font-medium">You have {goals.filter(g => g.currentAmount >= g.targetAmount).length} completed goals.</p>
        </Card>
      </div>

      {/* Goals Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <Target className="text-primary-600" />
          Active Savings Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <Card key={goal._id} className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Target size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectedGoal(goal); setIsProgressModalOpen(true); }}
                      className="p-2 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal._id)}
                      className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{goal.title}</h4>
                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  <span>Progress</span>
                  <span>{formatCurrency(goal.currentAmount, user?.currency)} / {formatCurrency(goal.targetAmount, user?.currency)}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-primary-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'}`}
                  ></motion.div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{Math.round(progress)}% Complete</span>
                  {goal.deadline && <span className="text-[10px] font-bold text-gray-400 uppercase">Till {new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>
              </Card>
            );
          })}
          {goals.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-gray-400 font-bold">No active goals. Start saving for your dreams!</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
             <TrendingUp className="text-emerald-600" />
             Savings History
          </h2>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search history..."
              className="w-full h-12 pl-12 pr-4 bg-white border-none shadow-sm rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-600/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Card className="p-0 bg-white border-none shadow-sm overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black bg-gray-50/50">
                  <th className="px-8 py-5">Month Period</th>
                  <th className="px-8 py-5 text-emerald-600">Total Income</th>
                  <th className="px-8 py-5 text-rose-600">Total Expense</th>
                  <th className="px-8 py-5 text-primary-600 text-right">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPastMonths.map((report) => (
                  <tr key={report.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">{report.month}</td>
                    <td className="px-8 py-5 font-bold text-emerald-600">{formatCurrency(report.income, user?.currency)}</td>
                    <td className="px-8 py-5 font-bold text-rose-600">{formatCurrency(report.expense, user?.currency)}</td>
                    <td className="px-8 py-5 font-black text-primary-600 text-right text-lg">{formatCurrency(report.savings, user?.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* New Goal Modal */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">New Savings Goal</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddGoal} className="space-y-6">
                  <Input label="Goal Title" placeholder="e.g. New Laptop" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} required />
                  <Input label="Target Amount" type="number" placeholder="0.00" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} required />
                  <Input label="Deadline (Optional)" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                  <Button type="submit" className="w-full py-4 font-black shadow-lg shadow-primary-600/20">Create Goal</Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Progress Modal */}
      {createPortal(
        <AnimatePresence>
          {isProgressModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProgressModalOpen(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Add Progress</h2>
                  <button onClick={() => setIsProgressModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={20} /></button>
                </div>
                <p className="text-sm font-bold text-gray-500 mb-6">Adding to: <span className="text-primary-600">{selectedGoal?.title}</span></p>
                <form onSubmit={handleUpdateProgress} className="space-y-6">
                  <Input label="Amount to Add" type="number" placeholder="0.00" value={progressAmount} onChange={e => setProgressAmount(e.target.value)} required />
                  <Button type="submit" className="w-full py-4 font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">Update Progress</Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Savings;
