// ============================================
// TYPES — Semana 07
// Mismo `Item` (curso) de las semanas 05-06, más los tipos nuevos de
// esta semana: de dónde salió la lista (red o caché) y las opciones
// de las preferencias.
// ============================================
export interface Item {
  id: number;
  name: string;
  description: string;
  instructor: string;
}

export interface CreateItemPayload {
  name: string;
  description: string;
}

export interface UpdateItemPayload {
  id: number;
  name: string;
  description: string;
}

// Lo que devuelve `useItems`: la lista Y de dónde salió. Con `source`
// la pantalla sabe si mostrar el banner "sin red" o no.
export interface ItemsWithSource {
  items: Item[];
  source: 'network' | 'cache';
  // Cuándo se guardó la caché (solo cuando source === 'cache')
  cachedAt?: number;
}

// Preferencias del usuario (guardadas con MMKV)
export type SortBy = 'name' | 'instructor';
export type SortOrder = 'asc' | 'desc';
export type ItemsPerPage = 5 | 10 | 15;
