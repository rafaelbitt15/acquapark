import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useAuth = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      
      login: async (email, password) => {
        try {
          const response = await axios.post(`${API}/auth/login`, { email, password });
          const { access_token } = response.data;
          
          set({ token: access_token });
          
          // Get user info
          const userResponse = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          
          set({ user: userResponse.data });
        } catch (error) {
          throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
        }
      },
      
      logout: () => {
        set({ token: null, user: null });
      },
      
      getAuthHeaders: () => {
        const token = get().token;
        return { Authorization: `Bearer ${token}` };
      },
      
      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;
        
        try {
          const userResponse = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: userResponse.data });
          return true;
        } catch (error) {
          set({ token: null, user: null });
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Axios interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    // Only add admin token if it's an admin endpoint
    if (config.url?.includes('/api/admin') || config.url?.includes('/api/auth')) {
      const token = useAuth.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to handle 401 errors - ONLY for admin routes
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin login if it was an admin request
    const isAdminRequest = error.config?.url?.includes('/api/admin') || error.config?.url?.includes('/api/auth/');
    if (error.response?.status === 401 && isAdminRequest) {
      useAuth.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);