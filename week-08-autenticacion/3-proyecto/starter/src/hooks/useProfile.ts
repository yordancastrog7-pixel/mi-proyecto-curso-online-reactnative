import { useQuery } from '@tanstack/react-query';

import { getProfile } from '../services/profileService';
import type { UserProfile } from '../types';

export const PROFILE_QUERY_KEY = ['profile'] as const;

// ============================================
// useProfile — perfil del usuario autenticado (GET /auth/me)
// Con TanStack Query, igual que en la semana 05. Esta es la llamada
// que pasa por el interceptor: si el access token venció, se renueva
// solo y la pantalla recibe los datos sin enterarse.
// ============================================
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
  });
}
