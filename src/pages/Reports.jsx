import { useMemo } from 'react';
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
import { PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown, ArrowDownCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button } from '../components/ui';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

const Reports = () => {
  const { totals, categoryTotals, getMonthlyReports, transactions, loans, addTransaction, addLoan } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();

  const monthlyReports = getMonthlyReports();

  const handlePrint = (report) => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === report.month;
    });

    const monthLoans = loans.filter(l => {
      const d = new Date(l.createdAt || l.expectedPayDate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === report.month;
    });

    const printWindow = window.open('', '_blank');
    const [year, month] = report.month.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    printWindow.document.write(`
      <html>
        <head>
          <title>Financial Report - ${monthName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .summary { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 40px; }
            .summary-item { padding: 15px; border: 1px solid #f1f5f9; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FinanceFlow Monthly Report</h1>
            <p>${monthName}</p>
          </div>
          <div class="summary">
            <div class="summary-item"><strong>Total Income:</strong> ${formatCurrency(report.income, user?.currency)}</div>
            <div class="summary-item"><strong>Total Expense:</strong> ${formatCurrency(report.expense, user?.currency)}</div>
            <div class="summary-item"><strong>Savings:</strong> ${formatCurrency(report.savings, user?.currency)}</div>
            <div class="summary-item"><strong>Loan Taken:</strong> ${formatCurrency(report.loansTaken, user?.currency)}</div>
            <div class="summary-item"><strong>Loan Paid:</strong> ${formatCurrency(report.loansPaid, user?.currency)}</div>
          </div>
          
          <h3>Transactions</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${monthTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.category}</td>
                  <td>${t.description}</td>
                  <td class="${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, user?.currency)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Loans Activity</h3>
          <table>
            <thead>
              <tr><th>Source</th><th>Purpose</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${monthLoans.map(l => `
                <tr>
                  <td>${l.lender}</td>
                  <td>${l.purpose}</td>
                  <td>${formatCurrency(l.amount, user?.currency)}</td>
                  <td>${l.isPaid ? 'Settled' : 'Active'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
            const categories = ['Food', 'Transport', 'Rent', 'Salary', 'Shopping', 'Bills'];
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
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handlePrint(report)}
                            className="p-2 bg-gray-50 text-gray-500 hover:text-primary-600 rounded-xl transition-all"
                            title="Download PDF"
                          >
                            <ArrowDownCircle size={20} />
                          </button>
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
    </div>
  );
};

export default Reports;
