import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshAccessToken, setAuthCallbacks } from '../services/api';
import * as authService from '../services/authService';
import { queryClient } from '../services/queryClient';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../services/tokenService';
import type { AuthUser, LoginCredentials, RegisterData } from '../types';

// ============================================
// AUTH STORE — Zustand + persist
//
// Qué se guarda y DÓNDE (la regla más importante de la semana):
//   • Tokens (access / refresh)  → SecureStore (cifrado), vía tokenService
//   • `user` e `isAuthenticated` → AsyncStorage, vía `persist` (no son
//                                   secretos: solo el nombre, correo, etc.)
//   • `accessToken` en este store → solo en MEMORIA: `partialize` lo deja
//                                   fuera de lo que persist escribe a disco
//
// Toda la lógica de sesión vive aquí y en los servicios: las pantallas
// solo llaman a login() / logout() y leen el estado.
// ============================================
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null; // copia en memoria (nunca se persiste)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Inicia sesión, guarda los tokens cifrados y actualiza el estado */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Registro simulado (no abre sesión: la API no guarda usuarios nuevos) */
  register: (data: RegisterData) => Promise<void>;
  /** Cierra sesión: borra los tokens y vacía todo rastro del usuario */
  logout: () => Promise<void>;
  /** Renueva el access token con el refresh token guardado */
  refreshTokens: () => Promise<void>;
  /** Al abrir la app: verifica que la sesión guardada siga siendo válida */
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          await saveTokens({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          set({
            user: {
              id: response.id,
              username: response.username,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              image: response.image,
            },
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: authService.getAuthErrorMessage(error), isLoading: false });
          // Se relanza para que el formulario también pueda enterarse.
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ error: authService.getAuthErrorMessage(error), isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await clearTokens();
        // Vaciar el caché de TanStack Query: sin esto, el perfil del
        // usuario anterior seguiría en memoria.
        queryClient.clear();
        set({ user: null, accessToken: null, isAuthenticated: false, error: null });
      },

      refreshTokens: async () => {
        try {
          const accessToken = await refreshAccessToken();
          set({ accessToken });
        } catch {
          // Si no se puede renovar, la sesión ya no sirve.
          await get().logout();
        }
      },

      restoreSession: async () => {
        if (!get().isAuthenticated) return;

        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);

        // `isAuthenticated` quedó guardado en disco, pero los tokens ya
        // no están (SecureStore borrado, reinstalación, etc.): sesión inválida.
        if (!refreshToken) {
          await get().logout();
          return;
        }
        set({ accessToken });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // `partialize` elige QUÉ parte del estado escribe persist a disco.
      // Solo user e isAuthenticated — el accessToken se queda fuera.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Conecta el interceptor de Axios con el store (ver services/api.ts).
setAuthCallbacks({
  onTokensRefreshed: (accessToken) => useAuthStore.setState({ accessToken }),
  onSessionExpired: () => {
    void useAuthStore.getState().logout();
  },
});
