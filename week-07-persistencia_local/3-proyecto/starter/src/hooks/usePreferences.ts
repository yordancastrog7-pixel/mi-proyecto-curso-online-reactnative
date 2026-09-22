import { useMMKVBoolean, useMMKVNumber, useMMKVString } from '../storage/mmkv';
import type { ItemsPerPage, SortBy, SortOrder } from '../types';

// ============================================
// usePreferences — preferencias del usuario (MMKV)
//
// Encapsula TODA la lógica de MMKV en un solo lugar: las pantallas
// (Home y Ajustes) no saben que existe MMKV, solo llaman a
// `usePreferences()` y reciben valores ya tipados y con su valor por
// defecto.
//
// Los hooks `useMMKVString/Boolean/Number` son REACTIVOS: cuando
// Ajustes cambia una preferencia, Home se re-renderiza sola con el
// nuevo valor, y como MMKV es síncrono no hay `await` ni botón de
// "Guardar" — el cambio queda guardado en disco al instante.
// ============================================

// Claves en un solo objeto para no escribir strings sueltos por todo
// el código (un typo en una clave crearía una preferencia "fantasma").
const PREF_KEYS = {
  SORT_BY: 'pref_sortBy',
  SORT_ORDER: 'pref_sortOrder',
  COMPACT_MODE: 'pref_compactMode',
  ITEMS_PER_PAGE: 'pref_itemsPerPage',
} as const;

export const ITEMS_PER_PAGE_OPTIONS: readonly ItemsPerPage[] = [5, 10, 15];

// MMKV guarda strings/números/booleans "crudos" — al leer validamos
// que el valor guardado sea uno de los permitidos y, si no (nunca se
// guardó, o quedó algo raro), usamos el valor por defecto.
function toSortBy(raw: string | undefined): SortBy {
  return raw === 'instructor' ? 'instructor' : 'name';
}

function toSortOrder(raw: string | undefined): SortOrder {
  return raw === 'desc' ? 'desc' : 'asc';
}

function toItemsPerPage(raw: number | undefined): ItemsPerPage {
  return ITEMS_PER_PAGE_OPTIONS.find((option) => option === raw) ?? 10;
}

export function usePreferences() {
  const [sortByRaw, setSortByRaw] = useMMKVString(PREF_KEYS.SORT_BY);
  const [sortOrderRaw, setSortOrderRaw] = useMMKVString(PREF_KEYS.SORT_ORDER);
  const [compactModeRaw, setCompactModeRaw] = useMMKVBoolean(PREF_KEYS.COMPACT_MODE);
  const [itemsPerPageRaw, setItemsPerPageRaw] = useMMKVNumber(PREF_KEYS.ITEMS_PER_PAGE);

  return {
    // Ordenar por: nombre del curso / instructor
    sortBy: toSortBy(sortByRaw),
    setSortBy: (value: SortBy): void => setSortByRaw(value),

    // Dirección: ascendente / descendente
    sortOrder: toSortOrder(sortOrderRaw),
    setSortOrder: (value: SortOrder): void => setSortOrderRaw(value),

    // Modo compacto: la lista muestra menos información por curso
    compactMode: compactModeRaw ?? false,
    setCompactMode: (value: boolean): void => setCompactModeRaw(value),

    // Cuántos cursos se muestran por "página"
    itemsPerPage: toItemsPerPage(itemsPerPageRaw),
    setItemsPerPage: (value: ItemsPerPage): void => setItemsPerPageRaw(value),
  };
}
