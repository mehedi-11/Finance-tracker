import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { formatCurrency } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = () => {
  const { transactions, loans } = useFinance();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = [];
  for (let i = 0; i < firstDayOfMonth(year, month); i++) days.push(null);
  for (let i = 1; i <= daysInMonth(year, month); i++) days.push(i);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    const dayLoans = loans.filter(l => (l.expectedPayDate || '').startsWith(dateStr));
    
    return [
      ...dayTransactions.map(t => ({ ...t, eventType: 'transaction' })),
      ...dayLoans.map(l => ({ ...l, eventType: 'loan', description: `Loan: ${l.description}` }))
    ];
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-primary-600" size={32} />
            Bill Calendar
          </h1>
          <p className="text-gray-500 font-medium">Track your upcoming payments and dues.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
           <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronLeft size={20} /></button>
           <span className="px-4 font-black text-gray-900 min-w-[140px] text-center">{monthName} {year}</span>
           <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <Card className="p-6 md:p-8 bg-white border-none shadow-sm rounded-3xl">
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {days.map((day, idx) => {
            const events = getEventsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div key={idx} className={`min-h-[100px] md:min-h-[140px] p-2 md:p-3 rounded-2xl border transition-all ${
                day ? (isToday ? 'bg-primary-50/30 border-primary-200 ring-2 ring-primary-600/5' : 'bg-gray-50/30 border-gray-100 hover:bg-white hover:shadow-md') : 'border-transparent'
              }`}>
                {day && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-black ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>{day}</span>
                      {events.length > 0 && <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      {events.slice(0, 3).map((e, i) => (
                        <div key={i} className={`text-[8px] md:text-[9px] p-1.5 rounded-lg border font-bold truncate ${
                          e.type === 'income' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                          e.eventType === 'loan' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {e.description}
                        </div>
                      ))}
                      {events.length > 3 && <div className="text-[8px] text-gray-400 font-black text-center">+{events.length - 3} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-none shadow-sm">
           <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
             <AlertCircle className="text-rose-500" size={20} />
             Upcoming Unpaid Dues
           </h3>
           <div className="space-y-4">
              {transactions.filter(t => t.type === 'expense' && t.isPaid === false).slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-xs font-black text-gray-900">{t.description}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-black text-rose-600">{formatCurrency(t.amount, user?.currency)}</span>
                </div>
              ))}
              {transactions.filter(t => t.type === 'expense' && t.isPaid === false).length === 0 && (
                <p className="text-center py-6 text-sm font-bold text-gray-400">All bills are paid! 🎉</p>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
