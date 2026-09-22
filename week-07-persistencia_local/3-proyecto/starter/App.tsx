import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './src/navigation/RootNavigator';
import { storageReady } from './src/storage/mmkv';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      // Un solo reintento: si la red falla, useItems ya tiene su
      // propio plan B (la caché offline), no hace falta insistir.
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.JSX.Element | null {
  // Espera a que el almacenamiento de preferencias esté listo antes de
  // dibujar nada — así la primera pantalla ya nace con las preferencias
  // guardadas (con MMKV real esto se resuelve al instante).
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    void storageReady.then(() => setIsStorageReady(true));
  }, []);

  if (!isStorageReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
