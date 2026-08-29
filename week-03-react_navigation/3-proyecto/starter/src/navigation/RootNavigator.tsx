import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { DetailScreen } from '../screens/DetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { COLORS } from '../theme';
import type { HomeStackParamList, RootTabParamList } from './types';

// ============================================
// STACK INTERNO — pestaña Home: lista de cursos → detalle
// ============================================
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator(): React.JSX.Element {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: 'Cursos' }}
      />
      <HomeStack.Screen
        name="HomeDetail"
        component={DetailScreen}
        // Título dinámico: usa el nombre del curso que llega por params
        options={({ route }) => ({ title: route.params.name })}
      />
    </HomeStack.Navigator>
  );
}

// ============================================
// TAB NAVIGATOR — raíz de la app
// ============================================
const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName: keyof typeof Ionicons.glyphMap =
            route.name === 'Home'
              ? focused
                ? 'school'
                : 'school-outline'
              : focused
                ? 'heart'
                : 'heart-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Color del ícono/texto activo — valor fijo pedido por la rúbrica
        tabBarActiveTintColor: '#61DAFB',
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        // Cada Stack ya trae su propio header; el Tab no necesita el suyo
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Cursos' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: 'Favoritos' }}
      />
    </Tab.Navigator>
  );
}
