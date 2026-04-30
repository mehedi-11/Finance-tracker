import React, { createContext, useContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import { API_ENDPOINTS } from '../config';

const API_URL = API_ENDPOINTS.AUTH;

const EMAILJS_SERVICE_ID = 'service_huxfu4e';
const EMAILJS_TEMPLATE_ID = 'template_lenjhh8';
const EMAILJS_PUBLIC_KEY = 'F39LsRFNqk0FODJ_n';

emailjs.init(EMAILJS_PUBLIC_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('finance_app_user');
      const loginTime = localStorage.getItem('finance_login_time');
      
      if (savedUser && loginTime) {
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (currentTime - parseInt(loginTime) > oneHour) {
          localStorage.removeItem('finance_app_user');
          localStorage.removeItem('finance_login_time');
          return null;
        } else {
          return JSON.parse(savedUser);
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      localStorage.removeItem('finance_app_user');
      localStorage.removeItem('finance_login_time');
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Check for auto-logout every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const loginTime = localStorage.getItem('finance_login_time');
      if (loginTime) {
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000;
        if (currentTime - parseInt(loginTime) > oneHour) {
          toast.error('Session expired. Please login again.');
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  const register = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: userData.email,
        verification_code: data.verificationCode,
        app_name: 'Money Tracker'
      });
      toast.success('Verification code sent!');
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Email failed. Code: ' + data.verificationCode);
    }
    return data;
  };

  const verify = async (email, code) => {
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Verification failed');

    setUser(data);
    localStorage.setItem('finance_app_user', JSON.stringify(data));
    localStorage.setItem('finance_login_time', new Date().getTime().toString());
    toast.success('Verified successfully!');
  };

  const login = async (email, password, twoFactorCode = null) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, twoFactorCode }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    if (data.requires2FA) {
      toast.success('2FA code sent!');
      return { requires2FA: true };
    }

    setUser(data);
    localStorage.setItem('finance_app_user', JSON.stringify(data));
    localStorage.setItem('finance_login_time', new Date().getTime().toString());
    toast.success('Welcome back!');
    return { success: true };
  };

  const updateProfile = async (userData) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Update failed');

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('finance_app_user', JSON.stringify(updatedUser));
    toast.success('Profile updated!');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to change password');
    toast.success('Password changed successfully!');
  };

  const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to request reset');

    try {
      // Send reset token via EmailJS
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: email,
        verification_code: data.resetToken,
        app_name: 'Money Tracker'
      });
      toast.success('Reset code sent to your email!');
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Email failed. Token: ' + data.resetToken);
    }
  };

  const resetPassword = async (token, password) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Reset failed');
    toast.success('Password reset successfully! Please login.');
  };

  function logout() {
    setUser(null);
    localStorage.removeItem('finance_app_user');
    localStorage.removeItem('finance_login_time');
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, verify, login, updateProfile, changePassword, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
