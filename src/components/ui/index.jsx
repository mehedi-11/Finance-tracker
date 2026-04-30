import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-2 px-6 rounded-xl transition-all shadow-lg shadow-red-500/10 active:scale-95',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-900 py-2 px-6 rounded-xl transition-all'
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, type = 'text', className = '', prefix, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-5 z-10 select-none">
            <span className="text-gray-400 font-bold text-sm">{prefix}</span>
          </div>
        )}
        <input 
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`input-premium ${className} ${isPassword ? 'pr-12' : ''} ${prefix ? 'pl-16' : ''}`} 
          {...props} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'info' }) => {
  const variants = {
    info: 'bg-indigo-50 text-indigo-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-red-50 text-red-600',
    warning: 'bg-amber-50 text-amber-600'
  };

  return (
    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const Loader = ({ fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-black text-primary-600 uppercase tracking-widest animate-pulse">Loading Data...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-20 flex items-center justify-center w-full">{content}</div>;
};
