import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye,
  Download,
  X,
  AlertTriangle,
  DownloadCloud,
  Search,
  RefreshCw
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components/ui';
import { formatCurrency, currencies } from '../utils/helpers';
import toast from 'react-hot-toast';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { getMonthlyReports, transactions, loans, budgets, addTransaction } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [viewingReport, setViewingReport] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyReports = getMonthlyReports();
  const filteredReports = monthlyReports.filter(r => 
    r.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportDummyData = async () => {
    setIsImporting(true);
    try {
      const now = new Date();
      const transactionsToAdd = [];
      const categories = {
        income: ['Salary', 'Freelance', 'Investments'],
        expense: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping']
      };

      // Generate for previous 3 months
      for (let i = 1; i <= 3; i++) {
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 15); 
        
        // Income
        const incDay = Math.floor(Math.random() * 5) + 1;
        const incDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), incDay);
        transactionsToAdd.push({
          description: 'Monthly Salary (Dummy)',
          amount: Math.floor(Math.random() * 30000) + 50000,
          type: 'income',
          category: 'Salary',
          date: incDate.toISOString().split('T')[0],
          isPaid: true
        });

        // Expenses
        const numExpenses = Math.floor(Math.random() * 5) + 5;
        for (let j = 0; j < numExpenses; j++) {
          const expCat = categories.expense[Math.floor(Math.random() * categories.expense.length)];
          const expDay = Math.floor(Math.random() * 28) + 1;
          const expDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), expDay);
          transactionsToAdd.push({
            description: `Dummy ${expCat} Expense`,
            amount: Math.floor(Math.random() * 2000) + 500,
            type: 'expense',
            category: expCat,
            date: expDate.toISOString().split('T')[0],
            isPaid: true
          });
        }
      }

      for (const t of transactionsToAdd) {
        await addTransaction(t);
      }
      
      toast.success('Dummy data imported for previous 3 months!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to import dummy data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownload = async (report) => {
    setIsDownloading(true);
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= new Date(report.startDate) && d <= new Date(report.endDate);
    });

    const monthIncomes = monthTransactions.filter(t => t.type === 'income');
    const monthExpenses = monthTransactions.filter(t => t.type === 'expense');
    
    // Calculate Savings Used (Income category "Saving")
    const savingsUsed = monthIncomes
      .filter(t => t.category === 'Saving')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Major Income & Spending
    const incomeCats = monthIncomes.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    const majorIncome = Object.keys(incomeCats).sort((a,b) => incomeCats[b] - incomeCats[a])[0] || 'N/A';

    const expenseCats = monthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    const majorSpending = Object.keys(expenseCats).sort((a,b) => expenseCats[b] - expenseCats[a])[0] || 'N/A';

    // Cumulative Savings up to this report month
    const totalSavingsAtPoint = monthlyReports
      .filter(r => new Date(r.startDate) <= new Date(report.startDate))
      .reduce((sum, r) => sum + r.savings, 0);

    const monthLoans = loans.filter(l => {
      const d = new Date(l.createdAt || l.expectedPayDate);
      return d >= new Date(report.startDate) && d <= new Date(report.endDate);
    });

    // Budgets for the month
    // Note: budgets in state are current, but we'll show them as they relate to this month's spending
    const monthBudgets = budgets.map(b => {
      const spent = monthExpenses
        .filter(t => t.category === b.category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        ...b,
        spent,
        saved: Math.max(0, b.amount - spent)
      };
    });

    const cycleName = report.month;

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px'; // Consistent width for canvas
    element.style.background = '#ffffff';
    element.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="margin:0; color:#4f46e5; font-size: 32px; font-weight: 900; letter-spacing: -1px;">Money Tracker</h1>
            <p style="margin:5px 0 0; color:#64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Monthly Financial Statement</p>
          </div>
          <div style="text-align: right;">
            <p style="margin:0; font-size: 20px; font-weight: 900; color: #1e293b;">${cycleName}</p>
            <p style="margin:5px 0 0; font-size: 11px; color: #94a3b8; font-weight: 600;">Report ID: FF-${report.month.replace(' ', '-')}</p>
          </div>
        </div>

        <!-- User Information Section -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <p style="margin:0; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Account Holder</p>
            <p style="margin:0; font-size: 13px; font-weight: 700; color: #1e293b;">${user?.name}</p>
            <p style="margin:5px 0 0; font-size: 11px; color: #64748b;">${user?.email} • ${user?.phone || 'N/A'}</p>
            <p style="margin:5px 0 0; font-size: 11px; color: #64748b;">${user?.address || 'Address not set'}</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px; text-align: right;">
            <p style="margin:0; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Reporting Details</p>
            <p style="margin:0; font-size: 11px; color: #64748b;"><span style="font-weight: 700;">Duration:</span> ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}</p>
            <p style="margin:0; font-size: 11px; color: #64748b;"><span style="font-weight: 700;">Billing Cycle:</span> Day ${user?.monthStartDay || 1} of Month</p>
            <p style="margin:0; font-size: 11px; color: #64748b;"><span style="font-weight: 700;">Currency:</span> ${user?.currency} (${currencies.find(c => c.code === user?.currency)?.name.split('(')[1].replace(')', '') || ''})</p>
          </div>
        </div>

        <!-- Executive Summary Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px;">
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 15px; border-radius: 12px;">
            <p style="margin:0; font-size: 10px; color: #15803d; font-weight: 800; text-transform: uppercase;">Total Income</p>
            <p style="margin:5px 0 0; font-size: 16px; font-weight: 900; color: #166534;">${formatCurrency(report.income, user?.currency)}</p>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 12px;">
            <p style="margin:0; font-size: 10px; color: #b91c1c; font-weight: 800; text-transform: uppercase;">Total Expense</p>
            <p style="margin:5px 0 0; font-size: 16px; font-weight: 900; color: #991b1b;">${formatCurrency(report.expense, user?.currency)}</p>
          </div>
          <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 12px;">
            <p style="margin:0; font-size: 10px; color: #1d4ed8; font-weight: 800; text-transform: uppercase;">Month Savings</p>
            <p style="margin:5px 0 0; font-size: 16px; font-weight: 900; color: #1e40af;">${formatCurrency(report.savings, user?.currency)}</p>
          </div>
          <div style="background: #faf5ff; border: 1px solid #f3e8ff; padding: 15px; border-radius: 12px;">
            <p style="margin:0; font-size: 10px; color: #7e22ce; font-weight: 800; text-transform: uppercase;">Total Net Savings</p>
            <p style="margin:5px 0 0; font-size: 16px; font-weight: 900; color: #6b21a8;">${formatCurrency(totalSavingsAtPoint, user?.currency)}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
             <h4 style="margin:0 0 15px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Quick Insights</h4>
             <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;"><span style="font-size: 11px; color: #64748b;">Loans Taken:</span> <span style="font-size: 11px; font-weight: 700; color: #b45309;">${formatCurrency(report.loansTaken, user?.currency)}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="font-size: 11px; color: #64748b;">Savings Withdrawn:</span> <span style="font-size: 11px; font-weight: 700; color: #7e22ce;">${formatCurrency(savingsUsed, user?.currency)}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="font-size: 11px; color: #64748b;">Major Source:</span> <span style="font-size: 11px; font-weight: 700; color: #166534;">${majorIncome}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="font-size: 11px; color: #64748b;">Major Spending:</span> <span style="font-size: 11px; font-weight: 700; color: #991b1b;">${majorSpending}</span></div>
             </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
             <h4 style="margin:0 0 15px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Budget Performance</h4>
             <div style="display: flex; flex-direction: column; gap: 10px;">
                ${monthBudgets.slice(0, 4).map(b => `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 10px; color: #64748b; font-weight: 600;">${b.category}</span>
                    <div style="flex: 1; height: 4px; background: #e2e8f0; margin: 0 10px; border-radius: 2px;">
                      <div style="width: ${Math.min(100, (b.spent/b.amount)*100)}%; height: 100%; background: ${b.spent > b.amount ? '#ef4444' : '#4f46e5'}; border-radius: 2px;"></div>
                    </div>
                    <span style="font-size: 10px; font-weight: 700; color: ${b.spent > b.amount ? '#ef4444' : '#1e293b'}">${Math.round((b.spent/b.amount)*100)}%</span>
                  </div>
                `).join('')}
             </div>
          </div>
        </div>

        <!-- Income List -->
        <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #10b981; padding-left: 10px;">Income Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Description</th>
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Category</th>
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Date</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthIncomes.map((t, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fcfdfd'};">
                <td style="padding: 8px 15px; font-size: 11px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${t.description}</td>
                <td style="padding: 8px 15px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9;">${t.category}</td>
                <td style="padding: 8px 15px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9;">${new Date(t.date).toLocaleDateString()}</td>
                <td style="padding: 8px 15px; font-size: 11px; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9; color: #10b981">+${formatCurrency(t.amount, user?.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Expense List -->
        <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #ef4444; padding-left: 10px;">Expense Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Description</th>
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Category</th>
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Status</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthExpenses.map((t, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fcfdfd'};">
                <td style="padding: 8px 15px; font-size: 11px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${t.description}</td>
                <td style="padding: 8px 15px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9;">${t.category}</td>
                <td style="padding: 8px 15px; font-size: 11px; border-bottom: 1px solid #f1f5f9;">
                  <span style="color: ${t.isPaid ? '#10b981' : '#f59e0b'}; font-weight: 800; font-size: 9px; text-transform: uppercase;">${t.isPaid ? 'Paid' : 'Unpaid'}</span>
                </td>
                <td style="padding: 8px 15px; font-size: 11px; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9; color: #ef4444">-${formatCurrency(t.amount, user?.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Budget Table -->
        <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #4f46e5; padding-left: 10px;">Budget Analysis</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 15px; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Category</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Target</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Spent</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Saved</th>
            </tr>
          </thead>
          <tbody>
            ${monthBudgets.length > 0 ? monthBudgets.map((b, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fcfdfd'};">
                <td style="padding: 8px 15px; font-size: 11px; color: #1e293b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${b.category}</td>
                <td style="padding: 8px 15px; font-size: 11px; text-align: right; border-bottom: 1px solid #f1f5f9;">${formatCurrency(b.amount, user?.currency)}</td>
                <td style="padding: 8px 15px; font-size: 11px; text-align: right; border-bottom: 1px solid #f1f5f9; color: ${b.spent > b.amount ? '#ef4444' : '#1e293b'}">${formatCurrency(b.spent, user?.currency)}</td>
                <td style="padding: 8px 15px; font-size: 11px; font-weight: 800; text-align: right; border-bottom: 1px solid #f1f5f9; color: ${b.saved > 0 ? '#10b981' : '#64748b'}">${formatCurrency(b.saved, user?.currency)}</td>
              </tr>
            `).join('') : `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">No budgets set for this month.</td></tr>`}
          </tbody>
        </table>

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">
          Confidential Document • Money Tracker Pro Statement • Generated on ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const margin = 10; 
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin; 

    // First page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;

    // Remaining pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    pdf.save(`Money Tracker-Premium-Report-${report.month}.pdf`);
    document.body.removeChild(element);
    setIsDownloading(false);
    toast.success('Professional Report Downloaded!');
  };

  const handleExportCSV = (report) => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= new Date(report.startDate) && d <= new Date(report.endDate);
    });

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Status'];
    const rows = monthTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description.replace(/,/g, ''),
      t.category,
      t.type,
      t.amount,
      t.isPaid ? 'Paid' : 'Unpaid'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoneyTracker_${report.month.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel/CSV Exported!');
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
          className="flex items-center justify-center gap-2 w-full md:w-auto font-bold text-primary-600 hover:bg-primary-50 border-primary-100"
          onClick={handleImportDummyData}
          disabled={isImporting}
        >
          <DownloadCloud size={18} /> {isImporting ? 'Importing...' : 'Import Demo Data'}
        </Button>
      </div>


      <div className="space-y-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Monthly Records</h2>
          <div className="relative group min-w-[300px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search by month name..."
              className="w-full h-12 pl-12 pr-4 bg-white border-none shadow-sm rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-600/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => {
                    return (
                      <tr key={report.month} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{report.month}</td>
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
                              onClick={() => handleExportCSV(report)}
                              className="p-2 bg-gray-50 text-gray-500 hover:text-indigo-600 rounded-xl transition-all"
                              title="Export to Excel/CSV"
                            >
                              <RefreshCw size={18} />
                            </button>
                            <button 
                              onClick={() => handleDownload(report)}
                              disabled={isDownloading}
                              className="p-2 bg-gray-50 text-gray-500 hover:text-emerald-600 rounded-xl transition-all"
                              title="Download PDF"
                            >
                              <Download size={18} />
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingReport(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Financial Insights</h2>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                      {viewingReport.month}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => handleDownload(viewingReport)} 
                      disabled={isDownloading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 py-3 px-6 h-auto text-sm font-black shadow-lg shadow-emerald-600/20"
                    >
                      <Download size={18} /> {isDownloading ? 'Processing...' : 'Download PDF'}
                    </Button>
                    <button 
                      onClick={() => setViewingReport(null)} 
                      className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Income', value: viewingReport.income, color: 'emerald', bg: 'bg-emerald-50' },
                      { label: 'Total Expense', value: viewingReport.expense, color: 'rose', bg: 'bg-rose-50' },
                      { label: 'Net Savings', value: viewingReport.savings, color: 'primary', bg: 'bg-primary-50' },
                      { label: 'Loans Taken', value: viewingReport.loansTaken, color: 'amber', bg: 'bg-amber-50' }
                    ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white shadow-sm`}>
                        <p className={`text-[10px] uppercase font-black text-${stat.color}-600 tracking-widest mb-2`}>{stat.label}</p>
                        <p className={`text-2xl font-black text-${stat.color}-700`}>{formatCurrency(stat.value, user?.currency)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Breakdown */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                        Top Spending Categories
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(
                          transactions
                            .filter(t => {
                              const d = new Date(t.date);
                              return d >= new Date(viewingReport.startDate) && d <= new Date(viewingReport.endDate) && t.type === 'expense';
                            })
                            .reduce((acc, t) => {
                              acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                              return acc;
                            }, {})
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 4)
                          .map(([cat, amount], idx) => (
                            <div key={cat} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-xs font-black text-gray-400">0{idx + 1}</span>
                                <span className="font-bold text-gray-900">{cat}</span>
                              </div>
                              <span className="font-black text-rose-600">{formatCurrency(amount, user?.currency)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Budget Performance */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                        Budget Status
                      </h3>
                      <div className="space-y-5 p-6 bg-slate-50 rounded-3xl border border-gray-100">
                        {budgets.slice(0, 4).map(b => {
                          const spent = transactions
                            .filter(t => {
                              const d = new Date(t.date);
                              return d >= new Date(viewingReport.startDate) && d <= new Date(viewingReport.endDate) && t.category === b.category;
                            })
                            .reduce((sum, t) => sum + Number(t.amount), 0);
                          const progress = Math.min((spent / b.amount) * 100, 100);
                          
                          return (
                            <div key={b._id} className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-600">{b.category}</span>
                                <span className={spent > b.amount ? 'text-rose-600' : 'text-gray-900'}>
                                  {formatCurrency(spent, user?.currency)} / {formatCurrency(b.amount, user?.currency)}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${spent > b.amount ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                        Cycle Transactions
                      </h3>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        {transactions.filter(t => {
                          const d = new Date(t.date);
                          return d >= new Date(viewingReport.startDate) && d <= new Date(viewingReport.endDate);
                        }).length} Records Found
                      </span>
                    </div>
                    
                    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 font-black text-gray-400 uppercase text-[10px] tracking-widest">
                          <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {transactions
                            .filter(t => {
                              const d = new Date(t.date);
                              return d >= new Date(viewingReport.startDate) && d <= new Date(viewingReport.endDate);
                            })
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((t) => (
                              <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{t.description}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                    t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {t.category}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  <div className="flex flex-col items-end">
                                    <span>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}</span>
                                    {t.type === 'expense' && t.isPaid === false && (
                                      <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest mt-0.5 px-2 bg-amber-50 rounded-full">Unpaid</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Confidential • Money Tracker Premium Insight • {new Date().toLocaleDateString()}
                  </p>
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
