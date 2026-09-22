import { useCallback, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as MMKVModule from 'react-native-mmkv';

// ============================================
// ALMACENAMIENTO DE PREFERENCIAS — MMKV (con respaldo para Expo Go)
//
// MMKV es una librería NATIVA (C++ vía JSI/Nitro): no viene dentro de
// la app Expo Go, así que solo funciona en una app compilada
// (`npx expo run:android` / `run:ios`, o un build de EAS). Por eso este
// archivo elige el "backend" UNA sola vez al arrancar:
//
//   • 'mmkv'     → MMKV de verdad. Se usa en apps compiladas y en web
//                  (en web MMKV guarda en localStorage).
//   • 'fallback' → solo cuando corre dentro de Expo Go. Mantiene los
//                  valores en memoria y los copia a AsyncStorage para
//                  que sobrevivan a un reinicio. Expone EXACTAMENTE la
//                  misma forma de hooks, así ningún otro archivo se
//                  entera de la diferencia.
//
// Todo el resto de la app importa `useMMKVString`, `useMMKVBoolean` y
// `useMMKVNumber` de aquí y los usa igual que los de la librería.
// ============================================

type Setter<T> = (value: T | undefined) => void;
type StorageHook<T> = (key: string) => [value: T | undefined, setValue: Setter<T>];

interface StorageBackend {
  name: 'mmkv' | 'fallback';
  // Se resuelve cuando el backend ya puede leer valores. MMKV es
  // síncrono (ya está listo); el respaldo debe leer AsyncStorage primero.
  ready: Promise<void>;
  useString: StorageHook<string>;
  useBoolean: StorageHook<boolean>;
  useNumber: StorageHook<number>;
}

// ── Backend 1: MMKV real ─────────────────────────────────────────────────────
function createMmkvBackend(): StorageBackend {
  // `require` (y no un `import` arriba) para que la librería nativa solo se
  // cargue si de verdad vamos a usarla — dentro de Expo Go nunca se ejecuta.
  const mmkv: typeof MMKVModule = require('react-native-mmkv');
  // En MMKV v4 la instancia se crea con `createMMKV` (en v3 era `new MMKV`).
  const instance = mmkv.createMMKV({ id: 'app-storage' });

  return {
    name: 'mmkv',
    ready: Promise.resolve(),
    useString: (key) => mmkv.useMMKVString(key, instance),
    useBoolean: (key) => mmkv.useMMKVBoolean(key, instance),
    useNumber: (key) => mmkv.useMMKVNumber(key, instance),
  };
}

// ── Backend 2: respaldo para Expo Go ─────────────────────────────────────────
const FALLBACK_STORAGE_KEY = '@fallback_preferences';

type StoredValue = string | number | boolean;

function createFallbackBackend(): StorageBackend {
  const values = new Map<string, StoredValue>();
  const listeners = new Set<(changedKey: string) => void>();

  const ready = AsyncStorage.getItem(FALLBACK_STORAGE_KEY)
    .then((raw) => {
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, StoredValue>;
      Object.entries(parsed).forEach(([key, value]) => values.set(key, value));
    })
    .catch(() => undefined);

  function write(key: string, value: StoredValue | undefined): void {
    if (value === undefined) values.delete(key);
    else values.set(key, value);
    listeners.forEach((listener) => listener(key));
    // Copia a disco en segundo plano (no bloquea la interfaz).
    void AsyncStorage.setItem(
      FALLBACK_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(values))
    );
  }

  function createHook<T extends StoredValue>(
    isType: (value: unknown) => value is T
  ): StorageHook<T> {
    return (key) => {
      const subscribe = useCallback(
        (onStoreChange: () => void) => {
          const listener = (changedKey: string): void => {
            if (changedKey === key) onStoreChange();
          };
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        [key]
      );
      const getSnapshot = useCallback((): T | undefined => {
        const value = values.get(key);
        return isType(value) ? value : undefined;
      }, [key]);
      const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      const setValue = useCallback<Setter<T>>((next) => write(key, next), [key]);
      return [value, setValue];
    };
  }

  return {
    name: 'fallback',
    ready,
    useString: createHook((v): v is string => typeof v === 'string'),
    useBoolean: createHook((v): v is boolean => typeof v === 'boolean'),
    useNumber: createHook((v): v is number => typeof v === 'number'),
  };
}

// ── Elección del backend (una sola vez, al cargar el módulo) ─────────────────
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function chooseBackend(): StorageBackend {
  if (isExpoGo) return createFallbackBackend();
  try {
    return createMmkvBackend();
  } catch (error) {
    // Si MMKV no se pudo iniciar (por ejemplo, una app sin el módulo
    // nativo), la app sigue funcionando con el respaldo en vez de caerse.
    console.warn('MMKV no disponible, usando respaldo:', error);
    return createFallbackBackend();
  }
}

const backend = chooseBackend();

export const storageBackend = backend.name;
export const storageReady = backend.ready;
export const useMMKVString = backend.useString;
export const useMMKVBoolean = backend.useBoolean;
export const useMMKVNumber = backend.useNumber;
