import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle,
  Eye,
  Trash2,
  Download,
  X,
  AlertTriangle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { totals, categoryTotals, getMonthlyReports, transactions, loans, addTransaction, addLoan, deleteMonthData } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [viewingReport, setViewingReport] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const monthlyReports = getMonthlyReports();

  const handleDownload = async (report) => {
    setIsDownloading(true);
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === report.month;
    });

    const monthLoans = loans.filter(l => {
      const d = new Date(l.createdAt || l.expectedPayDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === report.month;
    });

    const [year, month] = report.month.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.innerHTML = `
      <div style="font-family: sans-serif; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
          <h1 style="margin:0; color:#4f46e5;">FinanceFlow Report</h1>
          <p style="color:#64748b; font-weight:bold;">${monthName}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
          <div style="padding:15px; border:1px solid #f1f5f9; border-radius:8px;"><strong>Income:</strong> ${formatCurrency(report.income, user?.currency)}</div>
          <div style="padding:15px; border:1px solid #f1f5f9; border-radius:8px;"><strong>Expense:</strong> ${formatCurrency(report.expense, user?.currency)}</div>
          <div style="padding:15px; border:1px solid #f1f5f9; border-radius:8px;"><strong>Savings:</strong> ${formatCurrency(report.savings, user?.currency)}</div>
          <div style="padding:15px; border:1px solid #f1f5f9; border-radius:8px;"><strong>Loans:</strong> ${formatCurrency(report.loansTaken, user?.currency)}</div>
        </div>
        <h3>Transactions</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#f8fafc; text-align:left; font-size:12px;">
            <th style="padding:10px; border-bottom:1px solid #f1f5f9;">Date</th>
            <th style="padding:10px; border-bottom:1px solid #f1f5f9;">Category</th>
            <th style="padding:10px; border-bottom:1px solid #f1f5f9;">Amount</th>
          </tr>
          ${monthTransactions.map(t => `
            <tr>
              <td style="padding:10px; border-bottom:1px solid #f1f5f9;">${new Date(t.date).toLocaleDateString()}</td>
              <td style="padding:10px; border-bottom:1px solid #f1f5f9;">${t.category}</td>
              <td style="padding:10px; border-bottom:1px solid #f1f5f9; color: ${t.type === 'income' ? '#10b981' : '#ef4444'}">${t.type === 'income' ? '+' : '-'}${t.amount}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
    
    document.body.appendChild(element);
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`FinanceReport-${report.month}.pdf`);
    document.body.removeChild(element);
    setIsDownloading(false);
    toast.success('Report downloaded successfully!');
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    toast.loading('Deleting month records...');
    await deleteMonthData(deleteConfirm);
    setDeleteConfirm(null);
    toast.dismiss();
    toast.success('Month records deleted!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-500 font-medium">{t('reports.subtitle')}</p>
        </div>
        <Button 
          variant="secondary" 
          className="bg-primary-50 text-primary-600 border-none font-bold flex items-center gap-2"
          onClick={async () => {
            const months = [1, 2, 3, 4];
            const year = new Date().getFullYear();
            toast.loading('Generating sample data...');
            for (const m of months) {
              const month = new Date().getMonth() - m;
              const date = new Date(year, month, 15).toISOString();
              await addTransaction({ type: 'income', amount: 30000, category: 'Salary', description: 'Monthly Salary', date });
              await addLoan({ lender: 'Bank ' + m, purpose: 'Test', amount: 5000, expectedPayDate: date, type: 'get', isPaid: m > 2 });
            }
            window.location.reload();
          }}
        >
          <TrendingUp size={18} /> Generate Sample Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <Card className="bg-emerald-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{t('reports.highest_income')}</p>
              <h4 className="text-xl font-bold text-emerald-700">Salary</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{t('reports.major_spending')}</p>
              <h4 className="text-xl font-bold text-red-700">
                {Object.keys(categoryTotals).sort((a,b) => categoryTotals[b] - categoryTotals[a])[0] || 'N/A'}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="bg-primary-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{t('reports.saving_rate')}</p>
              <h4 className="text-xl font-bold text-primary-700">
                {totals.income > 0 ? Math.round((totals.balance / totals.income) * 100) : 0}%
              </h4>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Monthly Records</h2>
        <Card className="p-0 bg-white border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-xs uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4 text-emerald-600">Total Income</th>
                  <th className="px-6 py-4 text-red-600">Total Expense</th>
                  <th className="px-6 py-4 text-primary-600">Savings</th>
                  <th className="px-6 py-4 text-amber-600">Loan Taken</th>
                  <th className="px-6 py-4 text-indigo-600">Loan Paid</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthlyReports.length > 0 ? (
                  monthlyReports.map((report) => {
                    const [year, month] = report.month.split('-');
                    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                    return (
                      <tr key={report.month} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{monthName}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(report.income, user?.currency)}</td>
                        <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(report.expense, user?.currency)}</td>
                        <td className="px-6 py-4 font-bold text-primary-600">{formatCurrency(report.savings, user?.currency)}</td>
                        <td className="px-6 py-4 font-bold text-amber-600">{formatCurrency(report.loansTaken, user?.currency)}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(report.loansPaid, user?.currency)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setViewingReport(report)}
                              className="p-2 bg-gray-50 text-gray-500 hover:text-primary-600 rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleDownload(report)}
                              disabled={isDownloading}
                              className="p-2 bg-gray-50 text-gray-500 hover:text-emerald-600 rounded-xl transition-all"
                              title="Download PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(report.month)}
                              className="p-2 bg-gray-50 text-gray-500 hover:text-red-600 rounded-xl transition-all"
                              title="Delete Month Data"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-gray-400 font-bold">
                      No monthly records generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* View Modal */}
      {createPortal(
        <AnimatePresence>
          {viewingReport && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingReport(null)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Month Summary</h2>
                    <p className="text-sm text-gray-500">{new Date(viewingReport.month.split('-')[0], viewingReport.month.split('-')[1]-1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleDownload(viewingReport)} 
                      disabled={isDownloading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 py-2 px-4 h-auto text-sm"
                    >
                      <Download size={16} /> Download
                    </Button>
                    <button onClick={() => setViewingReport(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-[10px] uppercase font-black text-emerald-600 mb-1">Income</p>
                      <p className="text-lg font-bold text-emerald-700">{formatCurrency(viewingReport.income, user?.currency)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <p className="text-[10px] uppercase font-black text-red-600 mb-1">Expense</p>
                      <p className="text-lg font-bold text-red-700">{formatCurrency(viewingReport.expense, user?.currency)}</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-xl">
                      <p className="text-[10px] uppercase font-black text-primary-600 mb-1">Savings</p>
                      <p className="text-lg font-bold text-primary-700">{formatCurrency(viewingReport.savings, user?.currency)}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-[10px] uppercase font-black text-amber-600 mb-1">Loan</p>
                      <p className="text-lg font-bold text-amber-700">{formatCurrency(viewingReport.loansTaken, user?.currency)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-l-4 border-primary-500 pl-3">Monthly Details</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Transactions</span>
                        <span className="font-bold text-gray-900">
                          {transactions.filter(t => {
                            const d = new Date(t.date);
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === viewingReport.month;
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loan Settled</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(viewingReport.loansPaid, user?.currency)}</span>
                      </div>
                    </div>
                  </div>
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
                <h3 className="text-xl font-black text-gray-900 mb-2">Delete Month Data?</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">All transactions and loans for this month will be permanently removed.</p>
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
    </div>
  );
};

export default Reports;
