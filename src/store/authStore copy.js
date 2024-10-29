// src/store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  role: null,
  isAuthenticated: false,
  login: (role) => set({ role, isAuthenticated: true }),
  logout: () => set({ role: null, isAuthenticated: false }),
}));

export default useAuthStore;