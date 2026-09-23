// ============================================
// NAVIGATION TYPES — Semana 08
// Dos navegadores que NUNCA conviven: el de "sin sesión" (Auth) y el de
// "con sesión" (App). RootNavigator elige cuál según `isAuthenticated`.
// ============================================

// Sin sesión
export type AuthStackParamList = {
  // `registeredUsername`: al terminar el registro simulado volvemos al
  // Login con el usuario recién creado ya escrito.
  Login: { registeredUsername?: string } | undefined;
  Register: undefined;
};

// Con sesión
export type AppTabParamList = {
  Home: undefined;
  Profile: undefined;
};
