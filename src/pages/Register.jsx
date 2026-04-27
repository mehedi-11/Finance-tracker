import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { currencies } from '../utils/helpers';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    password: '',
    confirmPassword: '',
    currency: 'BDT'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/verify', { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 overflow-y-auto py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-bold text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <Card className="p-8 bg-white border-none shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-primary-600" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Join thousands of smart spenders today.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            <Input label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
            <Input label="Phone Number" name="phone" type="tel" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Preferred Currency</label>
              <select 
                name="currency" 
                value={formData.currency} 
                onChange={handleChange}
                className="input-premium"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
            <Input label="Address" name="address" placeholder="123 Street, City, Country" value={formData.address} onChange={handleChange} />
            <Input label="Password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            
            <div className="md:col-span-2 mt-4">
              <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-primary-500/30" disabled={loading}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </Button>
            </div>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8 font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-primary-600 hover:underline font-black">Sign In</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
