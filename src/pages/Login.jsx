import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password, show2FA ? twoFactorCode : null);
      if (result.requires2FA) {
        setShow2FA(true);
      } else {
        navigate('/dashboard');
      }
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
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> {t('auth.back_home')}
        </Link>
        
        <Card className="p-10 bg-white border-none shadow-2xl">
          <div className="text-center mb-10">
            <div className={`w-16 h-16 ${show2FA ? 'bg-emerald-50' : 'bg-primary-50'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
              {show2FA ? <ShieldCheck className="text-emerald-600" size={32} /> : <LogIn className="text-primary-600" size={32} />}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{show2FA ? t('auth.two_factor') : t('auth.welcome_back')}</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              {show2FA ? t('auth.enter_2fa') : t('auth.login_msg')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!show2FA ? (
              <>
                <Input 
                  label={t('auth.email_address')} 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <Input 
                  label={t('auth.password')} 
                  type="password" 
                  placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="text-right">
                    <Link to="/forgot-password" size="xs" className="text-xs text-primary-600 hover:underline font-bold">{t('auth.forgot_password')}</Link>
                  </div>
                </div>
              </>
            ) : (
              <Input 
                label={t('auth.verification_code')} 
                type="text" 
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                className="text-center tracking-widest text-2xl font-black"
                maxLength={6}
              />
            )}
            
            <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-primary-500/30" disabled={loading}>
              {loading ? t('loans.processing') : (show2FA ? t('auth.verify_login') : t('common.sign_in'))}
            </Button>
          </form>

          {!show2FA && (
            <p className="text-center text-gray-500 text-sm mt-10 font-medium">
              {t('auth.no_account')} {' '}
              <Link to="/register" className="text-primary-600 hover:underline font-black">
                {t('auth.register_now')}
              </Link>
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
