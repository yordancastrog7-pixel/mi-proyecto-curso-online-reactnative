import axios from 'axios';

// ============================================
// CLIENTE AXIOS — Semana 07
// Misma API de práctica de las semanas 05-06 (JSONPlaceholder).
//
// La URL se puede cambiar con la variable de entorno
// EXPO_PUBLIC_API_URL (Expo solo expone las que empiezan con
// `EXPO_PUBLIC_`). Sirve para probar el modo sin red: si apuntas a una
// dirección que no responde, la petición falla y la app muestra los
// cursos guardados en la caché (AsyncStorage).
// ============================================
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://jsonplaceholder.typicode.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
