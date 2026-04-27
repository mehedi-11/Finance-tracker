import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, Input } from '../components/ui';
import { Mail, Shield, LogOut, Settings, Phone, MapPin, KeyRound, Globe, X } from 'lucide-react';
import { currencies } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    address: user?.address || '',
    currency: user?.currency || 'BDT'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-lg bg-gradient-to-tr from-primary-600 to-emerald-500 p-1">
            <div className="w-full h-full rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-bold text-primary-600 uppercase">{user?.name?.[0]}</span>
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center border-4 border-slate-50 hover:scale-110 transition-transform shadow-lg">
            <Settings size={18} className="text-white" />
          </button>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
            <Badge variant="success">Verified User</Badge>
            <Badge variant="info">{currencies.find(c => c.code === user?.currency)?.name || user?.currency}</Badge>
          </div>
        </div>
        <Button variant={isEditing ? "ghost" : "primary"} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6 bg-white border-none shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Personal & Settings</h3>
          
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Preferred Currency</label>
                  <select 
                    value={formData.currency} 
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="input-premium"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Input label="Date of Birth" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                <div className="md:col-span-2">
                  <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileItem icon={Mail} label="Email" value={user?.email} />
              <ProfileItem icon={Globe} label="Currency" value={currencies.find(c => c.code === user?.currency)?.name || user?.currency} />
              <ProfileItem icon={Phone} label="Phone" value={user?.phone || 'Not set'} />
              <ProfileItem icon={MapPin} label="Address" value={user?.address || 'Not set'} />
            </div>
          )}
        </Card>

        <Card className="space-y-6 bg-white border-none shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Security</h3>
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              className="w-full text-left justify-start gap-3 font-bold text-gray-600"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyRound size={18} /> Change Password
            </Button>
            <Button variant="danger" className="w-full text-left justify-start gap-3 mt-4 font-bold" onClick={logout}>
              <LogOut size={18} /> Sign Out
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><KeyRound className="text-primary-600" /> Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <Input label="Current Password" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
                <Input label="New Password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                <Button type="submit" className="w-full py-4 text-lg font-bold" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex items-center gap-3 mb-1">
      <Icon className="text-gray-400" size={16} />
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-900">{value}</p>
  </div>
);

export default Profile;
