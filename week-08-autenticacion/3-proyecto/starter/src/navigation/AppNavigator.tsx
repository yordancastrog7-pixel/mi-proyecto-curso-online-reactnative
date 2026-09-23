import React from 'react';
import { Pressable, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuthStore } from '../stores/authStore';
import { COLORS, TYPOGRAPHY } from '../theme';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

// Botón "Salir" del encabezado: como está en las opciones de pantalla del
// Tab, aparece en TODAS las pantallas de la app con sesión (requisito
// opcional: cerrar sesión desde cualquier pantalla).
function LogoutButton(): React.JSX.Element {
  const logout = useAuthStore((state) => state.logout);
  return (
    <Pressable
      onPress={() => void logout()}
      hitSlop={12}
      style={{ marginRight: 16 }}
      testID="header-logout-button"
    >
      <Text style={{ color: COLORS.error, fontSize: TYPOGRAPHY.size.base, fontWeight: '600' }}>
        Salir
      </Text>
    </Pressable>
  );
}

// Pantallas para quien SÍ inició sesión.
export function AppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <LogoutButton />,
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: () => (
          <Text style={{ fontSize: 18 }}>{route.name === 'Home' ? '🎓' : '👤'}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Cursos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
    </Tab.Navigator>
  );
}
