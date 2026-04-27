import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import toast from 'react-hot-toast';

const Verify = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const { verify, resendCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify(email, code);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendCode(email);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
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
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-emerald-600" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Verify Email</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              We've sent a 6-digit code to <br />
              <span className="text-gray-900 font-bold">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Verification Code" 
              type="text" 
              placeholder="123456"
              maxLength={6}
              className="text-center text-3xl tracking-[0.5em] font-black text-primary-600 border-2 border-primary-100"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            
            <Button type="submit" className="w-full py-4 text-lg font-black flex items-center justify-center gap-2 shadow-xl shadow-primary-500/30" disabled={loading}>
              {loading ? 'Verifying...' : (
                <>Verify Account <ArrowRight size={20} /></>
              )}
            </Button>
          </form>

          <button 
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-gray-500 text-sm mt-10 font-bold hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            {resending ? <RotateCw size={16} className="animate-spin" /> : "Didn't receive a code?"}
            <span className="text-primary-600 font-black">Resend Now</span>
          </button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Verify;
