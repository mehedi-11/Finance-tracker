const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: `${BASE_API_URL}/auth`,
  FINANCE: `${BASE_API_URL}/finance`,
  NOTES: `${BASE_API_URL}/notes`,
  NOTIFICATIONS: `${BASE_API_URL}/notifications`
};
