import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calculator, X, RefreshCw, ChevronRight, Hash } from 'lucide-react';
import { Button } from './ui';

const FloatingTools = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'calc' or 'conv'
  
  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  
  // Converter State
  const [convAmount, setConvAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BDT');
  const rates = { USD: 1, BDT: 110, EUR: 0.92, GBP: 0.79, INR: 83 };

  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcExpression('');
    } else if (val === '=') {
      try {
        // Simple evaluation - for production use a math library
        // eslint-disable-next-line no-eval
        const result = eval(calcExpression.replace('×', '*').replace('÷', '/'));
        setCalcDisplay(result.toString());
        setCalcExpression(result.toString());
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcExpression(prev => (calcDisplay === '0' || calcDisplay === 'Error') ? val : prev + val);
      setCalcDisplay(prev => (prev === '0' || prev === 'Error') ? val : prev + val);
    }
  };

  const convert = () => {
    const amount = parseFloat(convAmount) || 0;
    const result = (amount / rates[fromCurrency]) * rates[toCurrency];
    return result.toFixed(2);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 bg-primary-600 flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTool('calc')}
                  className={`p-2 rounded-lg transition-colors ${activeTool === 'calc' ? 'bg-white text-primary-600' : 'text-white hover:bg-white/10'}`}
                >
                  <Calculator size={18} />
                </button>
                <button 
                  onClick={() => setActiveTool('conv')}
                  className={`p-2 rounded-lg transition-colors ${activeTool === 'conv' ? 'bg-white text-primary-600' : 'text-white hover:bg-white/10'}`}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-4">
              {activeTool === 'calc' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gray-50 p-4 rounded-xl text-right">
                    <p className="text-[10px] text-gray-400 font-bold h-4">{calcExpression}</p>
                    <p className="text-2xl font-black text-gray-900 truncate">{calcDisplay}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','=','+'].map(btn => (
                      <button
                        key={btn}
                        onClick={() => handleCalcClick(btn)}
                        className={`h-10 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                          btn === '=' ? 'bg-primary-600 text-white col-span-1' :
                          ['÷','×','-','+','C'].includes(btn) ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTool === 'conv' && (
                <div className="space-y-4 animate-fade-in">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('tools.amount')}</label>
                     <input 
                       type="number" 
                       value={convAmount} 
                       onChange={(e) => setConvAmount(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-gray-50 border-none rounded-xl px-3 py-3 text-xs font-bold">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-gray-50 border-none rounded-xl px-3 py-3 text-xs font-bold">
                        {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{t('tools.result')}</p>
                      <p className="text-xl font-black text-emerald-700">{convert()} {toCurrency}</p>
                   </div>
                </div>
              )}

              {!activeTool && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hash size={32} />
                  </div>
                  <p className="text-sm font-bold text-gray-400">{t('tools.select_tool')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !activeTool) setActiveTool('calc');
        }}
        className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 hover:bg-primary-700 transition-colors"
      >
        {isOpen ? <ChevronRight size={24} /> : <Calculator size={24} />}
      </motion.button>
    </div>
  );
};

export default FloatingTools;
