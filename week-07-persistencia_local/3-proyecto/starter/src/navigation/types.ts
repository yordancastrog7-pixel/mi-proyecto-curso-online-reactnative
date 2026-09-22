// ============================================
// NAVIGATION TYPES — Semana 07
// Igual que la Semana 06 (Home → Create modal | Home → Edit) más la
// pantalla nueva de Ajustes (preferencias y seguridad).
// ============================================
export type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  Edit: { id: number; name: string };
  Settings: undefined;
};
