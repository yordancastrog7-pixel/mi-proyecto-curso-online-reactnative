import { useEffect, useState } from 'react';

import { useAuthStore } from '../stores/authStore';

// ============================================
// useAuthHydration — ¿ya sabemos si hay una sesión guardada?
//
// Al abrir la app, `persist` lee `user` / `isAuthenticated` de
// AsyncStorage, y eso es ASÍNCRONO: durante un instante el store todavía
// tiene sus valores iniciales (`isAuthenticated: false`). Si dibujáramos
// la navegación en ese instante, un usuario con sesión vería un
// parpadeo de la pantalla de Login antes de pasar a Inicio.
//
// Por eso la app espera a que este hook devuelva `true` (y a que
// `restoreSession` termine) antes de decidir qué navegador mostrar.
// ============================================
export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Por si terminó justo entre el primer render y este efecto.
    setHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
