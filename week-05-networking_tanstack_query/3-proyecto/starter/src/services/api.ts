import axios from 'axios';

// ============================================
// CLIENTE AXIOS — Semana 05
// Instancia centralizada con baseURL fija — así ningún hook tiene que
// repetir la URL completa en cada llamada, y si el backend cambia,
// se edita en un solo lugar.
//
// Usamos JSONPlaceholder (https://jsonplaceholder.typicode.com) como
// API de práctica — es la opción que sugiere la especificación de esta
// semana para quienes no tienen un backend propio. Solo expone
// /posts, /users, etc., así que la usamos como "proxy": cada /posts
// se muestra como si fuera un curso (ver el mapeo en
// src/hooks/useItems.ts).
// ============================================
export const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de respuesta: log centralizado de errores de red,
// útil para depurar sin tener que agregar try/catch en cada hook.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);
