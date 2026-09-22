import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useOfflineCache } from '../hooks/useOfflineCache';
import { ITEMS_PER_PAGE_OPTIONS, usePreferences } from '../hooks/usePreferences';
import { useSecureCode } from '../hooks/useSecureCode';
import { pinSchema } from '../schemas/pinSchema';
import { storageBackend } from '../storage/mmkv';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { SortBy, SortOrder } from '../types';

const SORT_BY_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Nombre' },
  { value: 'instructor', label: 'Instructor' },
];

const SORT_ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'asc', label: 'A → Z' },
  { value: 'desc', label: 'Z → A' },
];

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}

function Chip({ label, selected, onPress, testID }: ChipProps): React.JSX.Element {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      testID={testID}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function SettingsScreen(): React.JSX.Element {
  // Toda la lógica de almacenamiento vive en hooks — esta pantalla solo
  // dibuja y llama a lo que los hooks exponen.
  const {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    compactMode,
    setCompactMode,
    itemsPerPage,
    setItemsPerPage,
  } = usePreferences();
  const { hasCache, clear: clearCache } = useOfflineCache();
  const { isSaved, isLoading, save, verify, remove, isSecureStoreAvailable } = useSecureCode();

  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSave(): Promise<void> {
    const result = pinSchema.safeParse(pin);
    if (!result.success) {
      setMessage({ text: result.error.issues[0]?.message ?? 'PIN inválido', ok: false });
      return;
    }
    await save(result.data);
    setPin('');
    setMessage({ text: 'PIN guardado de forma segura.', ok: true });
  }

  async function handleVerify(): Promise<void> {
    const matches = await verify(pin);
    setMessage(
      matches
        ? { text: '✓ El PIN coincide con el guardado.', ok: true }
        : { text: '✗ El PIN no coincide.', ok: false }
    );
  }

  async function handleRemove(): Promise<void> {
    await remove();
    setPin('');
    setMessage({ text: 'PIN eliminado.', ok: true });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ============ 1. PREFERENCIAS — MMKV ============ */}
      <Text style={styles.sectionTitle}>Preferencias de la lista</Text>
      <Text style={styles.sectionHint}>
        Se guardan al instante (sin botón "Guardar") y se mantienen aunque cierres la app.
      </Text>
      {storageBackend === 'fallback' && (
        <Text style={styles.notice}>
          Estás en Expo Go: MMKV necesita una app compilada, así que se usa un respaldo
          equivalente. En una app compilada se usa MMKV real.
        </Text>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Ordenar por</Text>
        <View style={styles.chipRow}>
          {SORT_BY_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={sortBy === option.value}
              onPress={() => setSortBy(option.value)}
              testID={`sortby-${option.value}`}
            />
          ))}
        </View>

        <Text style={styles.label}>Dirección</Text>
        <View style={styles.chipRow}>
          {SORT_ORDER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={sortOrder === option.value}
              onPress={() => setSortOrder(option.value)}
              testID={`sortorder-${option.value}`}
            />
          ))}
        </View>

        <Text style={styles.label}>Cursos por página</Text>
        <View style={styles.chipRow}>
          {ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={String(option)}
              selected={itemsPerPage === option}
              onPress={() => setItemsPerPage(option)}
              testID={`perpage-${option}`}
            />
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.label}>Modo compacto</Text>
            <Text style={styles.sectionHint}>Muestra solo el nombre de cada curso.</Text>
          </View>
          <Switch
            value={compactMode}
            onValueChange={setCompactMode}
            trackColor={{ true: COLORS.accent, false: COLORS.border }}
            testID="compact-switch"
          />
        </View>
      </View>

      {/* ============ 2. CACHÉ — AsyncStorage ============ */}
      <Text style={styles.sectionTitle}>Datos sin conexión</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          {hasCache
            ? '💾 Hay una copia de los cursos guardada en el teléfono.'
            : 'Todavía no hay copia guardada. Se crea sola la primera vez que se cargan los cursos con internet.'}
        </Text>
        <Pressable
          style={[styles.secondaryButton, !hasCache && styles.buttonDisabled]}
          onPress={() => void clearCache()}
          disabled={!hasCache}
          testID="clear-cache-button"
        >
          <Text style={styles.secondaryButtonText}>Borrar copia guardada</Text>
        </Pressable>
      </View>

      {/* ============ 3. SEGURIDAD — SecureStore ============ */}
      <Text style={styles.sectionTitle}>Seguridad</Text>
      <View style={styles.card}>
        <Text style={styles.body}>PIN de acceso al panel de instructores</Text>
        {!isSecureStoreAvailable && (
          <Text style={styles.notice}>
            Vista web: SecureStore no existe en el navegador, así que el PIN vive solo en
            memoria mientras la página está abierta. En el celular se guarda cifrado.
          </Text>
        )}

        <Text style={[styles.status, isSaved && styles.statusOk]} testID="pin-status">
          {isLoading ? '…' : isSaved ? '🔒 Hay un PIN guardado' : 'No hay ningún PIN guardado'}
        </Text>

        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder="PIN de 4 a 6 dígitos"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          testID="pin-input"
        />

        {message && (
          <Text style={[styles.message, message.ok ? styles.messageOk : styles.messageError]}>
            {message.text}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => void handleSave()}
            testID="pin-save-button"
          >
            <Text style={styles.primaryButtonText}>Guardar PIN</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, !isSaved && styles.buttonDisabled]}
            onPress={() => void handleVerify()}
            disabled={!isSaved}
            testID="pin-verify-button"
          >
            <Text style={styles.secondaryButtonText}>Verificar</Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.dangerButton, !isSaved && styles.buttonDisabled]}
          onPress={() => void handleRemove()}
          disabled={!isSaved}
          testID="pin-delete-button"
        >
          <Text style={styles.dangerButtonText}>Eliminar PIN</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  sectionHint: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textMuted,
  },
  notice: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  body: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
  },
  chipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  switchText: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  status: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textMuted,
  },
  statusOk: {
    color: COLORS.success,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
  },
  message: {
    fontSize: TYPOGRAPHY.size.sm,
  },
  messageOk: {
    color: COLORS.success,
  },
  messageError: {
    color: COLORS.error,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.background,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.accent,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.error,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
