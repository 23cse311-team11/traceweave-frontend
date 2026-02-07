import { create } from 'zustand';
import { api } from '@/lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true,

  // Method to check if the cookie is valid
  checkAuth: async () => {
    try {
      set({ isChecking: true });
      // OP-347: Backend must implement GET /auth/me that returns user profile
      const { data } = await api.get('/auth/me');
      console.log("Authentication check: ", data);
      set({ user: data.user, isAuthenticated: data.isAuthenticated });
    } catch (error) {
      // Cookie invalid or missing
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isChecking: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (err) {
      console.error('Logout failed', err);
    }
  }
}));