import type { UserProfile } from '../types';
import { api } from './api';

// Forma parcial de lo que devuelve /auth/me. La respuesta real trae
// muchos campos más (password, ssn, bank…) que NO declaramos: así
// TypeScript nos impide usarlos por accidente.
interface MeResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  university?: string;
}

/**
 * Perfil del usuario autenticado (`GET /auth/me`). Usa la instancia
 * `api`, así que el access token se agrega solo — y si venció, el
 * interceptor lo renueva y repite la llamada.
 */
export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<MeResponse>('/auth/me');
  // Copiamos SOLO lo que la app necesita (no `...data`).
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    image: data.image,
    university: data.university,
  };
}
