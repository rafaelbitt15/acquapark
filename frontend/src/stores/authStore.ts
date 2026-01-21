import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface AuthState {
  token: string | null;
  user: { email: string; is_admin: boolean } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuth = create<AuthState>()(  persist(
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
        } catch (error: any) {
          throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
        }
      },
      
      logout: () => {
        set({ token: null, user: null });
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
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);