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
  const { getMonthlyReports, transactions, loans, deleteMonthData, fetchFinanceData } = useFinance();
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
      return `${d.getFullYear()}-${String(dateToMonth(d))}` === report.month;
    });

    function dateToMonth(d) {
      return String(d.getMonth() + 1).padStart(2, '0');
    }

    const monthLoans = loans.filter(l => {
      const d = new Date(l.createdAt || l.expectedPayDate);
      return `${d.getFullYear()}-${String(dateToMonth(d))}` === report.month;
    });

    const [year, month] = report.month.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    const element = document.createElement('div');
    element.style.padding = '0.4in';
    element.style.width = '8.27in'; // A4 width
    element.style.background = '#ffffff';
    element.innerHTML = `
      <div style="font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.4;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px;">
          <div>
            <h1 style="margin:0; color:#4f46e5; font-size: 24px; letter-spacing: -0.5px;">FinanceFlow</h1>
            <p style="margin:3px 0 0; color:#64748b; font-size: 11px; font-weight: 600; text-transform: uppercase;">Financial Statement</p>
          </div>
          <div style="text-align: right;">
            <p style="margin:0; font-size: 16px; font-weight: 800; color: #1e293b;">${monthName}</p>
            <p style="margin:3px 0 0; font-size: 10px; color: #94a3b8;">Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px;">
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 12px; border-radius: 10px;">
            <p style="margin:0; font-size: 9px; color: #15803d; font-weight: 800; text-transform: uppercase;">Income</p>
            <p style="margin:3px 0 0; font-size: 14px; font-weight: 800; color: #166534;">${formatCurrency(report.income, user?.currency)}</p>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 10px;">
            <p style="margin:0; font-size: 9px; color: #b91c1c; font-weight: 800; text-transform: uppercase;">Expense</p>
            <p style="margin:3px 0 0; font-size: 14px; font-weight: 800; color: #991b1b;">${formatCurrency(report.expense, user?.currency)}</p>
          </div>
          <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 12px; border-radius: 10px;">
            <p style="margin:0; font-size: 9px; color: #1d4ed8; font-weight: 800; text-transform: uppercase;">Savings</p>
            <p style="margin:3px 0 0; font-size: 14px; font-weight: 800; color: #1e40af;">${formatCurrency(report.savings, user?.currency)}</p>
          </div>
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 10px;">
            <p style="margin:0; font-size: 9px; color: #b45309; font-weight: 800; text-transform: uppercase;">Loans</p>
            <p style="margin:3px 0 0; font-size: 14px; font-weight: 800; color: #92400e;">${formatCurrency(report.loansTaken, user?.currency)}</p>
          </div>
        </div>

        <!-- Transactions Table -->
        <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 10px; border-left: 3px solid #4f46e5; padding-left: 8px;">Detailed Transactions</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 8px 12px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Date</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Category</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Description</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthTransactions.map((t, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 12px; font-size: 11px; color: #475569; border-bottom: 1px solid #f1f5f9;">${new Date(t.date).toLocaleDateString()}</td>
                <td style="padding: 6px 12px; font-size: 11px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${t.category}</td>
                <td style="padding: 6px 12px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9;">${t.description}</td>
                <td style="padding: 6px 12px; font-size: 11px; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9; color: ${t.type === 'income' ? '#10b981' : '#ef4444'}">
                  ${t.type === 'income' ? '+' : '-'}${t.amount}
                  ${t.type === 'expense' && t.isPaid === false ? '<br/><span style="font-size:8px; color:#f59e0b;">(Unpaid)</span>' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Loans Table -->
        <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 10px; border-left: 3px solid #f59e0b; padding-left: 8px;">Loan Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 8px 12px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Source</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Purpose</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthLoans.map((l, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px 12px; font-size: 11px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">${l.lender}</td>
                <td style="padding: 6px 12px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9;">${l.purpose}</td>
                <td style="padding: 6px 12px; font-size: 11px; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9; color: #f59e0b;">
                  ${formatCurrency(l.amount, user?.currency)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 1px;">
          This is a computer-generated document. | FinanceFlow
        </div>
      </div>
    `;
    
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 10.16; // 0.4 inch in mm
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin; // Start at top margin

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = (heightLeft - imgHeight) + margin - contentHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    pdf.save(`FinanceFlow-Report-${report.month}.pdf`);
    document.body.removeChild(element);
    setIsDownloading(false);
    toast.success('Professional Report Downloaded!');
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
      </div>


      <div className="space-y-6 pt-8">
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
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-bold">
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
                className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Financial Overview</h2>
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

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 border-l-4 border-primary-500 pl-3">Month's Transactions</h3>
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 font-bold text-gray-400 uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {transactions
                            .filter(t => {
                              const d = new Date(t.date);
                              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === viewingReport.month;
                            })
                            .map((t) => (
                              <tr key={t._id}>
                                <td className="px-4 py-3 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{t.category}</td>
                                <td className={`px-4 py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  <div className="flex flex-col items-end">
                                    <span>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}</span>
                                    {t.type === 'expense' && t.isPaid === false && <span className="text-[9px] text-amber-600 font-black uppercase tracking-tighter">Unpaid</span>}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
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
