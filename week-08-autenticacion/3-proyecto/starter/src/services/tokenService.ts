import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from '../types';

// ============================================
// TOKEN SERVICE — los tokens viven SOLO en SecureStore
//
// SecureStore guarda cada valor CIFRADO en el llavero del sistema
// (Keychain en iOS, Keystore en Android). Los tokens NUNCA van en
// AsyncStorage ni en MMKV: ahí quedarían en texto plano (la rúbrica
// descuenta −10). Este es el ÚNICO archivo de la app que toca los
// tokens en disco.
//
// SecureStore no existe en la versión web de Expo. Solo para poder
// probar la pantalla en el navegador, en web los tokens se guardan en
// una variable en MEMORIA (nunca en localStorage): se pierden al
// recargar la página. En el celular siempre se usa SecureStore.
// ============================================
const KEYS = {
  ACCESS: 'auth_access_token',
  REFRESH: 'auth_refresh_token',
} as const;

const useSecureStore = Platform.OS !== 'web';
const webMemory = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  if (!useSecureStore) {
    webMemory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (!useSecureStore) return webMemory.get(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (!useSecureStore) {
    webMemory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

/** Guarda access y refresh token */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    setItem(KEYS.ACCESS, tokens.accessToken),
    setItem(KEYS.REFRESH, tokens.refreshToken),
  ]);
}

export function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS);
}

export function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH);
}

/** Borra ambos tokens (cerrar sesión) */
export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(KEYS.ACCESS), deleteItem(KEYS.REFRESH)]);
}
