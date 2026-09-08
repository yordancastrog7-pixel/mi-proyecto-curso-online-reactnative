import axios from 'axios';

// ============================================
// CLIENTE AXIOS — Semana 06
// Misma API de práctica que la Semana 05 (JSONPlaceholder), esta vez
// usada también para actualizar (PUT), no solo leer y crear.
// ============================================
export const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);
