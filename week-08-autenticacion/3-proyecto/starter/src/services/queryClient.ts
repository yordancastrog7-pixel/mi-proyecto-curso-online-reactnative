import { QueryClient } from '@tanstack/react-query';

// ============================================
// QueryClient compartido
// Vive en su propio archivo (y no dentro de App.tsx) para que el store
// de auth pueda vaciar el caché al cerrar sesión — si no, el perfil del
// usuario anterior seguiría en memoria y podría verlo el siguiente.
// ============================================
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
