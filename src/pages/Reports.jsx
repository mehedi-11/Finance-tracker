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
import { Card, Badge } from '../components/ui';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16'];

const Reports = () => {
  const { totals, categoryTotals } = useFinance();
  const { user } = useAuth();

  const pieData = useMemo(() => {
    return Object.keys(categoryTotals).map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      color: COLORS[index % COLORS.length]
    }));
  }, [categoryTotals]);

  const barData = [
    { name: 'Income', amount: totals.income, fill: '#10b981' },
    { name: 'Expenses', amount: totals.expenses, fill: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-500 font-medium">Visual breakdown of your financial health and spending patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-none shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <PieChartIcon className="text-primary-600" size={24} />
              Spending by Category
            </h3>
            <Badge variant="info">This Month</Badge>
          </div>
          <div className="h-[400px] w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderColor: '#f1f5f9', 
                      borderRadius: '12px',
                      color: '#1e293b',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value) => formatCurrency(value, user?.currency)}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 font-medium">
                No expense data available
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <BarChart3 className="text-emerald-600" size={24} />
              Income vs Expenses
            </h3>
            <Badge variant="success">Summary</Badge>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${user?.currency || 'BDT'} ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#f1f5f9', 
                    borderRadius: '12px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => formatCurrency(value, user?.currency)}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]} 
                  barSize={60}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Highest Income</p>
              <h4 className="text-xl font-bold text-emerald-700">Salary</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Major Spending</p>
              <h4 className="text-xl font-bold text-red-700">
                {Object.keys(categoryTotals).sort((a,b) => categoryTotals[b] - categoryTotals[a])[0] || 'N/A'}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="bg-primary-50 border-none shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 transition-transform group-hover:scale-110">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Saving Rate</p>
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
