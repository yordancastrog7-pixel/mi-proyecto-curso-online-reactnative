// ============================================
// NAVIGATION TYPES — Semana 03
// Tipa cada navigator para tener autocompletado y errores de
// compilación si navegas a una pantalla que no existe o le
// pasas params incorrectos.
// ============================================

// TAB NAVIGATOR — pantallas de nivel raíz
export type RootTabParamList = {
  Home: undefined; // pestaña con Stack interno (lista → detalle)
  Favorites: undefined; // pestaña secundaria, sin Stack
};

// STACK NAVIGATOR — anidado dentro de la pestaña Home
export type HomeStackParamList = {
  HomeList: undefined;
  // Detalle de un curso — se pasan los campos del dominio como params
  // para no tener que volver a buscar el curso por id en DetailScreen.
  HomeDetail: {
    id: string;
    name: string;
    instructor: string;
    price: number;
    category: string;
    duration: string;
    level: string;
    available: boolean;
  };
};
