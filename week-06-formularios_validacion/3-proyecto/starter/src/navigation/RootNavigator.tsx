import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CreateScreen } from '../screens/CreateScreen';
import { EditScreen } from '../screens/EditScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { COLORS } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Cursos', headerRight: () => <AddButton /> }}
      />
      <Stack.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: 'Nuevo curso', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}

function AddButton(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      onPress={() => navigation.navigate('Create')}
      hitSlop={12}
      testID="header-create-button"
    >
      <Text style={{ color: COLORS.accent, fontSize: 26, fontWeight: '300' }}>+</Text>
    </Pressable>
  );
}
