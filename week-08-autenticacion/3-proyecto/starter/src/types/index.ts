// ============================================
// TIPOS — Semana 08 (Autenticación)
// ============================================

/** Tokens que entrega el servidor al autenticarse o al renovar */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Datos del usuario (en el dominio: un ESTUDIANTE de la plataforma de
 * cursos). Solo guardamos lo que la app necesita mostrar — la API
 * devuelve muchísimos más campos (incluso sensibles como `password` o
 * `ssn`) y a propósito NO los copiamos.
 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
}

/** Perfil completo (/auth/me): el usuario + datos extra de la API */
export interface UserProfile extends AuthUser {
  university?: string;
}

/**
 * Lo que devuelve /auth/login. Ojo: el JWT de dummyjson trae `id` (no
 * `sub`), `iat` y `exp` — ver JwtPayload.
 */
export interface LoginResponse extends AuthTokens, AuthUser {
  gender?: string;
}

/** Contenido decodificado del JWT (parte "payload") */
export interface JwtPayload {
  id: number;
  username: string;
  iat: number; // emitido en (segundos desde 1970)
  exp: number; // vence en (segundos desde 1970)
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// ============================================
// DOMINIO: cursos y matrículas
// ============================================
export type CourseCategory =
  | 'Programación'
  | 'Diseño'
  | 'Backend'
  | 'Marketing'
  | 'Datos'
  | 'Idiomas';

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  price: number;
  category: CourseCategory;
  duration: string;
  level: CourseLevel;
  available: boolean;
}
