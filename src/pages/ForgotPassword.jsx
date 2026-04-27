import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import toast from 'react-hot-toast';



const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
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
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <Card className="p-10 bg-white border-none shadow-2xl text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-6">
            <KeyRound className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-2 mb-8 font-medium">
            Enter your email and we'll send you a link to reset your password.
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-primary-500/30" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="p-6 bg-primary-50 rounded-lg border border-primary-100 flex flex-col items-center">
              <Mail className="text-primary-600 mb-3" size={24} />
              <p className="text-primary-700 font-bold text-sm">Check your inbox!</p>
              <p className="text-primary-600/70 text-xs mt-1">We've sent a recovery email to {email}</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
