import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { clearItemsCache, hasItemsCache } from '../storage/itemsCache';
import { ITEMS_QUERY_KEY } from './useItems';

// ============================================
// useOfflineCache — estado de la caché de cursos (AsyncStorage)
//
// Lo usa la pantalla de ajustes para mostrar si hay una copia guardada
// y permitir borrarla (removeItem) — útil para probar el modo sin red
// desde cero.
// ============================================
export function useOfflineCache() {
  const queryClient = useQueryClient();
  const [hasCache, setHasCache] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    setHasCache(await hasItemsCache());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const clear = useCallback(async (): Promise<void> => {
    await clearItemsCache();
    // Sacamos también la lista de la memoria de TanStack Query para que
    // la próxima vez que se abra la lista vuelva a pedirla de cero.
    queryClient.removeQueries({ queryKey: ITEMS_QUERY_KEY });
    await refresh();
  }, [queryClient, refresh]);

  return { hasCache, clear };
}
