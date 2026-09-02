// ============================================
// NAVIGATION TYPES — Semana 05
// Stack simple (sin Tabs esta semana): Home → Detail, y Create como
// modal accesible desde el botón "+" del header de Home.
// ============================================
export type RootStackParamList = {
  Home: undefined;
  Detail: { id: number; name: string };
  Create: undefined;
};
