import axios from 'axios';

import type {
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  RegisterData,
} from '../types';

// ============================================
// AUTH SERVICE — llamadas a la API de autenticación (dummyjson.com)
//
// Estas funciones usan `axios` DIRECTO y no la instancia `api` (la que
// tiene interceptores): al iniciar sesión todavía no existe ningún
// token que inyectar, y al renovar, usar la instancia con interceptor
// podría provocar un bucle infinito (el refresh fallaría con 401, lo
// que dispararía otro refresh, y así).
// ============================================
export const API_BASE_URL = 'https://dummyjson.com';

// Cuánto dura el access token. Es CORTO a propósito: si alguien lo
// roba, solo le sirve unos minutos. Se puede cambiar con la variable
// EXPO_PUBLIC_ACCESS_TOKEN_MINUTES (útil para probar la renovación
// automática sin esperar 30 minutos).
const ACCESS_TOKEN_MINUTES = Number(process.env.EXPO_PUBLIC_ACCESS_TOKEN_MINUTES ?? 30);

/** Inicia sesión: devuelve los tokens + los datos del usuario. */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: ACCESS_TOKEN_MINUTES,
    },
    { timeout: 10_000 }
  );
  return data;
}

/**
 * Registro SIMULADO.
 * dummyjson no tiene un endpoint real de registro ni guarda usuarios
 * nuevos: `POST /users/add` responde "201 creado" con un usuario falso
 * pero NO lo guarda, así que ese usuario no podrá iniciar sesión
 * después. Igual hacemos la petición real (para practicar el flujo) y
 * devolvemos solo el id — la respuesta trae hasta la contraseña de
 * vuelta y no la queremos para nada.
 */
export async function register(data: RegisterData): Promise<{ id: number }> {
  const response = await axios.post<{ id: number }>(
    `${API_BASE_URL}/users/add`,
    {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.username,
      lastName: '',
    },
    { timeout: 10_000 }
  );
  return { id: response.data.id };
}

/** Pide un access token nuevo usando el refresh token. */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await axios.post<AuthTokens>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken, expiresInMins: ACCESS_TOKEN_MINUTES },
    { timeout: 10_000 }
  );
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

/** Traduce un error de red/HTTP a un mensaje entendible para el usuario. */
export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    }
    if (error.response.status === 400 || error.response.status === 401) {
      return 'Usuario o contraseña incorrectos.';
    }
    return 'El servidor tuvo un problema. Inténtalo de nuevo en un momento.';
  }
  return 'Ocurrió un error inesperado.';
}
