import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { FormField } from '../components/FormField';
import { useItemById, useUpdateItem } from '../hooks/useItems';
import { itemSchema, type ItemFormData } from '../schemas/itemSchema';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>;
type EditScreenRouteProp = RouteProp<RootStackParamList, 'Edit'>;

export function EditScreen(): React.JSX.Element {
  const navigation = useNavigation<EditScreenNavigationProp>();
  const route = useRoute<EditScreenRouteProp>();
  const { id } = route.params;

  // Pide el curso actual al servidor — no reutiliza lo que venía de
  // la lista, para editar siempre sobre el dato más fresco.
  const { data: item, isLoading } = useItemById(id);
  const { mutate: updateItem, isPending } = useUpdateItem();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', description: '' },
  });

  // ============================================
  // EL PATRÓN CLAVE DE ESTA SEMANA: reset() + useEffect
  // useItemById llega vacío al principio (isLoading === true) y luego
  // se llena cuando responde la API — en ESE momento (cuando `item`
  // cambia de undefined a un curso real) usamos `reset()` para
  // rellenar el formulario con los valores actuales. No se puede usar
  // `defaultValues` directamente porque el formulario ya existe antes
  // de que lleguen los datos.
  // ============================================
  useEffect(() => {
    if (item) {
      reset({ name: item.name, description: item.description });
    }
  }, [item, reset]);

  function onSubmit(data: ItemFormData): void {
    updateItem(
      { id, name: data.name, description: data.description },
      { onSuccess: () => navigation.goBack() }
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Solo se puede guardar si el formulario cambió (isDirty) — evita
  // mandar un PUT idéntico a lo que ya había.
  const canSubmit = isDirty && !isSubmitting && !isPending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>
          Los campos ya vienen con los datos actuales del curso
        </Text>

        <FormField<ItemFormData>
          control={control}
          name="name"
          label="Nombre"
          placeholder="Nombre del curso…"
          returnKeyType="next"
          errorMessage={errors.name?.message}
        />

        <FormField<ItemFormData>
          control={control}
          name="description"
          label="Descripción"
          placeholder="De qué trata el curso…"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          errorMessage={errors.description?.message}
        />

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit}
            testID="submit-button"
          >
            {isSubmitting || isPending ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Guardar cambios</Text>
            )}
          </Pressable>

          <Pressable style={styles.cancel} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.background,
  },
  cancel: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textMuted,
  },
});
