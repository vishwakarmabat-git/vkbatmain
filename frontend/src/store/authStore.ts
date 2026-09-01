import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'admin' || user.role === 'superadmin'
      }),
      updateUser: (user) => set({
        user,
        isAdmin: user.role === 'admin' || user.role === 'superadmin'
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false
      })
    }),
    {
      name: 'vk_auth_storage',
    }
  )
);
