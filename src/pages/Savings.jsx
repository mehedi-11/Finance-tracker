import { useState } from 'react';
import { 
  PiggyBank, 
  ArrowRight,
  Search
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const Savings = () => {
  const { getMonthlyReports, totalSavings, getCurrentCycleRange } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const allReports = getMonthlyReports();
  const { start } = getCurrentCycleRange();

  // Exclude current month
  const pastMonths = allReports.filter(report => {
    return new Date(report.startDate) < start;
  });

  const filteredPastMonths = pastMonths.filter(m => 
    m.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PiggyBank className="text-primary-600" size={32} />
            My Savings
          </h1>
          <p className="text-gray-500 font-medium">Track your unspent money from previous months.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm p-8 md:p-10 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Total Available Savings</p>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900">{formatCurrency(totalSavings, user?.currency)}</h2>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm max-w-xs">
              This is the sum of all your past months' unspent income. You can transfer this to your current balance at any time by adding an income transaction with the category "Saving".
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Savings History</h2>
          <div className="relative group min-w-[300px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-primary-600 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search by month (e.g. Oct 2023)..."
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
                <tr className="border-b border-gray-50 text-gray-400 text-xs uppercase tracking-widest font-black bg-gray-50/30">
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4 text-emerald-600">Pure Income</th>
                  <th className="px-6 py-4 text-red-600">Total Expense</th>
                  <th className="px-6 py-4 text-primary-600 text-right">Saved Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPastMonths.length > 0 ? (
                  filteredPastMonths.map((report) => (
                    <tr key={report.month} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{report.month}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        {formatCurrency(report.income, user?.currency)}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {formatCurrency(report.expense, user?.currency)}
                      </td>
                      <td className="px-6 py-4 font-black text-primary-600 text-right text-lg">
                        {report.savings > 0 ? '+' : ''}{formatCurrency(report.savings, user?.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold">
                      No savings history available yet. Past months will appear here.
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

export default Savings;
