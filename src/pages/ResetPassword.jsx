import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-10 bg-white border-none shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-emerald-600" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">{t('auth.reset_password')}</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              We've sent a 6-digit reset code to <br />
              <span className="text-gray-900 font-bold">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="6-Digit Reset Code" 
                type="text" 
                placeholder="123456"
                maxLength={6}
                className="text-center text-3xl tracking-[0.5em] font-black text-primary-600 border-2 border-primary-100"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <Input 
                label="New Password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input 
                label="Confirm New Password" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full py-4 text-lg font-black flex items-center justify-center gap-2 shadow-xl shadow-primary-500/30" disabled={loading}>
              {loading ? 'Resetting...' : (
                <>{t('auth.reset_password')} <ArrowRight size={20} /></>
              )}
            </Button>
          </form>

          <button 
            onClick={() => navigate('/forgot-password')}
            className="w-full text-center text-gray-500 text-sm mt-8 font-bold hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <KeyRound size={16} /> Use a different email
          </button>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
