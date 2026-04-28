import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Badge, Input } from '../components/ui';
import { Mail, Shield, LogOut, Settings, Phone, MapPin, KeyRound, Globe, X, Trash2, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { currencies } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { clearTransactions, clearLoans, clearBudgets } = useFinance();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    address: user?.address || '',
    currency: user?.currency || 'BDT',
    monthStartDay: user?.monthStartDay || 1
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [resetOptions, setResetOptions] = useState({
    transactions: false,
    loans: false,
    budgets: false,
    plans: false
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

  const clearNotes = async () => {
    const response = await fetch(API_ENDPOINTS.NOTES, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    if (response.ok) {
      localStorage.removeItem('finance_notes');
    } else {
      throw new Error('Failed to clear plans');
    }
  };

  const handleResetData = async () => {
    const selectedCount = Object.values(resetOptions).filter(Boolean).length;
    if (selectedCount === 0) return toast.error('Please select at least one category');

    setLoading(true);
    try {
      if (resetOptions.transactions) await clearTransactions();
      if (resetOptions.loans) await clearLoans();
      if (resetOptions.budgets) await clearBudgets();
      if (resetOptions.plans) await clearNotes();
      
      toast.success('Selected data has been cleared');
      setShowResetModal(false);
      setResetOptions({ transactions: false, loans: false, budgets: false, plans: false });
    } catch (err) {
      toast.error(err.message || 'Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const toggleResetOption = (key) => {
    setResetOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-xl bg-gradient-to-tr from-primary-600 to-emerald-500 p-1">
            <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <span className="text-4xl font-bold text-primary-600 uppercase">{user?.name?.[0]}</span>
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center border-4 border-slate-50 hover:scale-110 transition-transform shadow-lg">
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
          {isEditing ? t('common.cancel') : t('common.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 space-y-6 bg-white border-none shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">{t('profile.personal_info')}</h3>
          
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('profile.name')} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t('profile.currency')}</label>
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
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 ml-1">Month Start Day</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    className="input-premium" 
                    value={formData.monthStartDay} 
                    onChange={(e) => setFormData({ ...formData, monthStartDay: parseInt(e.target.value) || 1 })} 
                  />
                  <p className="text-[10px] text-gray-500 italic ml-1 text-right">Cycle starts on this day every month.</p>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? 'Saving...' : t('common.save')}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileItem icon={Mail} label="Email" value={user?.email} />
              <ProfileItem icon={Globe} label="Currency" value={currencies.find(c => c.code === user?.currency)?.name || user?.currency} />
              <ProfileItem icon={Phone} label="Phone" value={user?.phone || 'Not set'} />
              <ProfileItem icon={MapPin} label="Address" value={user?.address || 'Not set'} />
              <ProfileItem icon={Settings} label="Month Start Day" value={`Starts on Day ${user?.monthStartDay || 1}`} />
            </div>
          )}
        </Card>

        <Card className="space-y-6 bg-white border-none shadow-sm">
          <h3 className="text-xl font-bold text-gray-900">Security & Data</h3>
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              className="w-full text-left justify-start gap-3 font-bold text-gray-600"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyRound size={18} /> {t('profile.change_password')}
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full text-left justify-start gap-3 font-bold text-red-500 hover:bg-red-50 border-red-100"
              onClick={() => setShowResetModal(true)}
            >
              <Trash2 size={18} /> Reset Data
            </Button>

            <Button variant="danger" className="w-full text-left justify-start gap-3 mt-4 font-bold" onClick={logout}>
              <LogOut size={18} /> {t('common.logout')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><KeyRound className="text-primary-600" /> Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={20} /></button>
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

      {/* Reset Data Modal via Portal */}
      {createPortal(
        <AnimatePresence>
          {showResetModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResetModal(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-8 pb-4">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Trash2 className="text-red-600" /> Reset Data</h2>
                  <button onClick={() => setShowResetModal(false)} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-8 flex items-start gap-4">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={24} />
                    <p className="text-sm text-red-700 font-bold leading-relaxed">Warning: This action is permanent. All data in selected categories will be deleted forever.</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Select categories to clear</p>
                    
                    <ResetCheckbox 
                      label="Transactions (Income & Expenses)" 
                      checked={resetOptions.transactions} 
                      onChange={() => toggleResetOption('transactions')} 
                    />
                    <ResetCheckbox 
                      label="Loans" 
                      checked={resetOptions.loans} 
                      onChange={() => toggleResetOption('loans')} 
                    />
                    <ResetCheckbox 
                      label="Budgets" 
                      checked={resetOptions.budgets} 
                      onChange={() => toggleResetOption('budgets')} 
                  />
                    <ResetCheckbox 
                      label="Future Plans / Notes" 
                      checked={resetOptions.plans} 
                      onChange={() => toggleResetOption('plans')} 
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="ghost" className="flex-1 order-2 sm:order-1 font-bold h-14" onClick={() => setShowResetModal(false)}>Cancel</Button>
                    <Button variant="danger" className="flex-[2] h-14 font-black shadow-lg shadow-red-600/20 order-1 sm:order-2" onClick={handleResetData} disabled={loading}>
                      {loading ? 'Deleting...' : 'Delete Selected Data'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const ResetCheckbox = ({ label, checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
      checked ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
    }`}
  >
    <span className="font-bold text-sm">{label}</span>
    {checked ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
  </button>
);

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="flex items-center gap-3 mb-1">
      <Icon className="text-gray-400" size={16} />
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-gray-900">{value}</p>
  </div>
);

export default Profile;
