import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@services/api';
import { User, AuthTokens } from '@types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setAuth: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (tokens: AuthTokens) => {
        apiService.setToken(tokens.accessToken);
        set({
          user: tokens.user ?? null,
          token: tokens.accessToken,
          isAuthenticated: true,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, error: null });
      },

      clearAuth: () => {
        apiService.setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiService.login(email, password);
          get().setAuth(data);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (registerData: { name: string; email: string; password: string; confirmPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          const authData = await apiService.register(registerData);
          get().setAuth(authData);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        if (!get().isAuthenticated) return;
        try {
          const user = await apiService.getProfile();
          get().setUser(user);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiService.updateProfile(data);
          get().setUser(user);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Update failed';
          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiService.setToken(state.token);
        }
      },
    }
  )
);