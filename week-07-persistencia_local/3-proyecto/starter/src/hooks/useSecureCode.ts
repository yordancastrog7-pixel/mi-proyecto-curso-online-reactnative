import { useCallback, useEffect, useState } from 'react';

import {
  deleteSecretPin,
  hasSecretPin,
  isSecureStoreAvailable,
  saveSecretPin,
  verifySecretPin,
} from '../storage/secure';

// ============================================
// useSecureCode — hook del PIN sensible (Expo SecureStore)
//
// Encapsula TODA la lógica de SecureStore: la pantalla de ajustes solo
// llama a `save`, `verify` y `remove`, y solo recibe de vuelta
// `isSaved` (sí/no) y el resultado de `verify` (true/false). El PIN
// guardado nunca llega a la pantalla, así que no puede mostrarse en
// texto plano.
// ============================================
export function useSecureCode() {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    setIsSaved(await hasSecretPin());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (pin: string): Promise<void> => {
      await saveSecretPin(pin);
      await refresh();
    },
    [refresh]
  );

  const verify = useCallback((candidate: string): Promise<boolean> => {
    return verifySecretPin(candidate);
  }, []);

  const remove = useCallback(async (): Promise<void> => {
    await deleteSecretPin();
    await refresh();
  }, [refresh]);

  return { isSaved, isLoading, save, verify, remove, isSecureStoreAvailable };
}
