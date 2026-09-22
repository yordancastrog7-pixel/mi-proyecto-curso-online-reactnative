import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Item } from '../types';

// ============================================
// CACHÉ OFFLINE DE CURSOS — AsyncStorage
//
// ¿Por qué AsyncStorage y no MMKV para esto? La lista de cursos es un
// dato "grande" (un arreglo de objetos) y no se lee en cada render —
// solo al arrancar o cuando falla la red. AsyncStorage es asíncrono
// (hay que usar `await`) pero está pensado justo para eso. MMKV se
// reserva para lo pequeño y que se lee todo el tiempo (preferencias).
// ============================================
const CACHE_KEY = '@courses_cache';

interface CachedItems {
  savedAt: number; // Date.now() del momento en que se guardó
  items: Item[];
}

export async function saveItemsCache(items: Item[]): Promise<void> {
  const payload: CachedItems = { savedAt: Date.now(), items };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export async function readItemsCache(): Promise<CachedItems | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedItems;
  } catch {
    // Caché corrupta (JSON inválido): la descartamos en vez de romper la app.
    await AsyncStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export async function clearItemsCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}

export async function hasItemsCache(): Promise<boolean> {
  return (await AsyncStorage.getItem(CACHE_KEY)) !== null;
}
