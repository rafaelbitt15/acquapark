import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useCustomerAuth = create(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      
      register: async (data) => {
        try {
          const response = await axios.post(`${API}/customers/register`, data);
          const { access_token, customer } = response.data;
          set({ token: access_token, customer });
          return { success: true };
        } catch (error) {
          throw new Error(error.response?.data?.detail || 'Erro ao criar conta');
        }
      },
      
      login: async (email, password) => {
        try {
          const response = await axios.post(`${API}/customers/login`, { email, password });
          const { access_token, customer } = response.data;
          set({ token: access_token, customer });
        } catch (error) {
          throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
        }
      },
      
      logout: () => {
        set({ token: null, customer: null });
      },
      
      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;
        
        try {
          const response = await axios.get(`${API}/customers/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ customer: response.data });
          return true;
        } catch (error) {
          set({ token: null, customer: null });
          return false;
        }
      },

      getAuthHeaders: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }),
    {
      name: 'customer-auth-storage',
    }
  )
);