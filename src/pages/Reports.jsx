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
import { PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '../components/ui';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

const Reports = () => {
  const { totals, categoryTotals } = useFinance();
  const { user } = useAuth();
  const { t } = useTranslation();

  const pieData = useMemo(() => {
    return Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      color: COLORS[index % COLORS.length]
    }));
  }, [categoryTotals]);

  const barData = [
    { name: t('common.income'), amount: totals.income, fill: '#10b981' },
    { name: t('common.expense'), amount: totals.expenses, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
        <p className="text-gray-500 font-medium">{t('reports.subtitle')}</p>
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
    </div>
  );
};

export default Reports;
