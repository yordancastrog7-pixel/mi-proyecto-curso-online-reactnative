import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ============================================
// DATO SENSIBLE — Expo SecureStore
//
// En el celular, SecureStore guarda el valor CIFRADO en el llavero del
// sistema (Keychain en iOS, Keystore en Android). Por eso es el lugar
// correcto para un PIN o un token — a diferencia de AsyncStorage o
// MMKV, que guardan en texto plano.
//
// Nuestro dato sensible del dominio: el PIN de acceso al panel de
// instructores de la plataforma de cursos.
//
// SecureStore NO existe en la versión web de Expo. Para poder probar
// la pantalla en el navegador, en web usamos una variable en MEMORIA
// (se pierde al recargar la página, y nunca se escribe en
// localStorage) — es solo para desarrollo, en el celular siempre se
// usa SecureStore de verdad.
// ============================================
const PIN_KEY = 'instructor_pin';

export const isSecureStoreAvailable = Platform.OS !== 'web';

let webMemoryPin: string | null = null;

export async function saveSecretPin(pin: string): Promise<void> {
  if (!isSecureStoreAvailable) {
    webMemoryPin = pin;
    return;
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

async function readSecretPin(): Promise<string | null> {
  if (!isSecureStoreAvailable) return webMemoryPin;
  return SecureStore.getItemAsync(PIN_KEY);
}

// Le pregunta al almacén "¿hay un PIN guardado?" SIN entregar el valor
// a la pantalla — solo sí/no.
export async function hasSecretPin(): Promise<boolean> {
  return (await readSecretPin()) !== null;
}

// Compara lo que escribió el usuario con el PIN guardado. Devuelve solo
// true/false: el PIN guardado nunca sale de este archivo, así que la
// pantalla no tiene forma de mostrarlo en texto plano.
export async function verifySecretPin(candidate: string): Promise<boolean> {
  const stored = await readSecretPin();
  return stored !== null && stored === candidate;
}

export async function deleteSecretPin(): Promise<void> {
  if (!isSecureStoreAvailable) {
    webMemoryPin = null;
    return;
  }
  await SecureStore.deleteItemAsync(PIN_KEY);
}
