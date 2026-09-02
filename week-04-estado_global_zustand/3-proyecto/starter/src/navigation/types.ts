// ============================================
// NAVIGATION TYPES — Semana 04
// Igual patrón que la Semana 03: cada navigator tipado, y
// HomeDetail lleva el curso completo en los params (para poder
// agregarlo al carrito sin volver a buscarlo en mockData.ts).
// ============================================

export type RootTabParamList = {
  Home: undefined; // pestaña con Stack interno (lista → detalle)
  Cart: undefined; // pestaña del carrito, sin Stack
};

export type HomeStackParamList = {
  HomeList: undefined;
  HomeDetail: {
    id: string;
    name: string;
    description: string;
    instructor: string;
    price: number;
    category: string;
    duration: string;
    level: string;
    available: boolean;
  };
};
