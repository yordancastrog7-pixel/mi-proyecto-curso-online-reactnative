import axios, { type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, refreshTokens } from './authService';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenService';

// ============================================
// API — instancia Axios para las llamadas AUTENTICADAS
//
// 1. Interceptor de PETICIÓN: pega el access token en cada llamada.
// 2. Interceptor de RESPUESTA: si el servidor contesta 401 (token
//    vencido), renueva el token con el refresh token y REINTENTA la
//    llamada original — el usuario ni se entera.
// ============================================
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// El store de auth necesita enterarse de lo que pasa aquí (token nuevo,
// sesión vencida), pero este archivo NO puede importar el store (el
// store ya importa servicios: sería un import circular). Por eso el
// store se "registra" a sí mismo con estas funciones al iniciar.
interface AuthCallbacks {
  onTokensRefreshed: (accessToken: string) => void;
  onSessionExpired: () => void;
}

let callbacks: AuthCallbacks | null = null;

export function setAuthCallbacks(next: AuthCallbacks): void {
  callbacks = next;
}

// Si 3 pantallas piden datos a la vez y las 3 reciben 401, NO queremos
// 3 renovaciones simultáneas (el refresh token podría invalidarse): todas
// comparten UNA sola promesa de renovación.
let refreshPromise: Promise<string> | null = null;

/** Renueva el access token (una sola vez aunque la llamen varios a la vez). */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No hay refresh token guardado');

      const tokens = await refreshTokens(refreshToken);
      await saveTokens(tokens);
      callbacks?.onTokensRefreshed(tokens.accessToken);
      return tokens.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Interceptor de petición ──────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor de respuesta ─────────────────────────────────────────────────
// `_retry` marca la petición que ya reintentamos: si el reintento vuelve
// a dar 401, no lo intentamos otra vez (evita un bucle infinito).
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const original = error.config as RetriableConfig;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return await api(original);
      } catch (refreshError) {
        // No se pudo renovar (refresh vencido/inválido): la sesión terminó.
        await clearTokens();
        callbacks?.onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
