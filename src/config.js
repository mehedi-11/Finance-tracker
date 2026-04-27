const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_API_URL = RAW_URL.replace(/\/auth$/, '').replace(/\/$/, '');

export const API_ENDPOINTS = {
  AUTH: `${BASE_API_URL}/auth`,
  FINANCE: `${BASE_API_URL}/finance`,
  NOTES: `${BASE_API_URL}/notes`,
  NOTIFICATIONS: `${BASE_API_URL}/notifications`,
  LOANS: `${BASE_API_URL}/loans`
};
