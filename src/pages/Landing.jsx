import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, BarChart3, Zap, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '../components/ui';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      {/* Navbar Placeholder for Brand */}
      <nav className="w-full max-w-7xl px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Wallet className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">Money Tracker</span>
        </div>
        <Link to="/login">
          <Button variant="ghost" className="font-bold">Sign In</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl px-8 py-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-100 text-primary-600 text-sm font-bold mb-8"
        >
          <Zap size={16} />
          <span>Next-Gen Personal Finance</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black mb-6 leading-tight text-gray-900"
        >
          Master Your Money with <br />
          <span className="bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
            Intelligence & Style
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 text-lg max-w-2xl mb-10 font-medium"
        >
          The ultimate finance tracker designed for the modern individual. 
          Track income, manage budgets, and gain deep insights—all with complete privacy.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <Button className="px-10 py-4 text-lg font-bold flex items-center gap-2 shadow-2xl shadow-primary-500/40">
              Start Your Journey <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="px-10 py-4 text-lg font-bold bg-gray-50 border-gray-100">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            icon: TrendingUp, 
            title: 'Real-time Tracking', 
            desc: 'Monitor every cent with instant updates and beautiful visualizations.' 
          },
          { 
            icon: Shield, 
            title: 'Privacy First', 
            desc: 'All your data stays in your browser. We never see your financial secrets.' 
          },
          { 
            icon: BarChart3, 
            title: 'Smart Analytics', 
            desc: 'Get category-wise breakdowns and monthly summaries automatically.' 
          }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
            className="bg-white rounded-xl p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group text-center"
          >
            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:bg-primary-100 transition-all">
              <feature.icon className="text-primary-600" size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-4">{feature.title}</h3>
            <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="w-full py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Users', value: '10K+' },
            { label: 'Transactions', value: '1M+' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Security', value: 'AES-256' },
          ].map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
