import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

// ============================================
// FormField — Semana 06
// Componente genérico reutilizado en CreateScreen y EditScreen.
// Encapsula: label + Controller (conecta el TextInput con
// react-hook-form) + mensaje de error debajo.
//
// Es genérico sobre `T` (la forma del formulario) para que `name`
// solo acepte nombres de campo que EXISTEN en ese formulario —
// TypeScript marcaría error si escribiera `name="precio"` en un
// formulario que no tiene ese campo. Sin `any` en ningún lado.
// ============================================
interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  errorMessage?: string;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  ...textInputProps
}: FormFieldProps<T>): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, !!errorMessage && styles.inputError]}
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor={COLORS.textMuted}
            {...textInputProps}
          />
        )}
      />

      {/* Siempre reserva el espacio (aunque no haya error) para que el
          formulario no "salte" de tamaño cuando aparece un mensaje. */}
      <Text style={styles.error} numberOfLines={1}>
        {errorMessage ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.error,
    minHeight: 16,
  },
});
