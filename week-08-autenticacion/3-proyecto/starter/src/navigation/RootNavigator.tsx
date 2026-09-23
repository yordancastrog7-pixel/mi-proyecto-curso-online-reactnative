import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useAuthHydration } from '../hooks/useAuthHydration';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../theme';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

// ============================================
// RootNavigator — decide QUÉ navegador mostrar según la sesión.
//
//   isAuthenticated === false  →  AuthNavigator (Login / Registro)
//   isAuthenticated === true   →  AppNavigator  (Cursos / Perfil)
//
// No hay ningún `navigation.navigate('Home')` al iniciar sesión: basta
// con que el store cambie `isAuthenticated` y React vuelve a dibujar con
// el otro navegador. Lo mismo al cerrar sesión, desde cualquier pantalla.
// ============================================
export function RootNavigator(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const hydrated = useAuthHydration();
  const [isRestored, setIsRestored] = useState(false);

  // Cuando persist ya leyó la sesión guardada, verificamos que sus
  // tokens sigan existiendo en SecureStore antes de mostrar nada.
  useEffect(() => {
    if (!hydrated) return;
    void restoreSession().finally(() => setIsRestored(true));
  }, [hydrated, restoreSession]);

  if (!hydrated || !isRestored) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
