// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      role: null,
      isAuthenticated: false,
      login: (role) => set({ role, isAuthenticated: true }),
      logout: () => set({ role: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // nombre de la key en localStorage
      storage: createJSONStorage(() => localStorage), // usando localStorage
      partialize: (state) => ({ 
        role: state.role, 
        isAuthenticated: state.isAuthenticated 
      }), // solo persistir estas propiedades
    }
  )
);

export default useAuthStore;