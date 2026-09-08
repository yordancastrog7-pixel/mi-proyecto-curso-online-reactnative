// ============================================
// NAVIGATION TYPES — Semana 06
// Stack simple: Home → Create (modal) | Home → Edit (push).
// Esta semana no hay pantalla de solo-lectura (Detail) — tocar un
// curso en la lista abre directo su formulario de edición.
// ============================================
export type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  Edit: { id: number; name: string };
};
