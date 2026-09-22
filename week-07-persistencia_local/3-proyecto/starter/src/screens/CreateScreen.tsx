import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormField } from '../components/FormField';
import { useCreateItem } from '../hooks/useItems';
import { itemSchema, type ItemFormData } from '../schemas/itemSchema';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type CreateScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Create'>;

export function CreateScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateScreenNavigationProp>();
  const { mutate: createItem } = useCreateItem();

  // zodResolver conecta el schema de arriba con react-hook-form: antes
  // de llamar a onSubmit, RHF valida `data` contra `itemSchema` y, si
  // algo falla, llena `errors` solo — nunca escribimos un `if` de
  // validación a mano.
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', description: '' },
  });

  function onSubmit(data: ItemFormData): void {
    createItem(data, {
      onSuccess: () => navigation.goBack(),
    });
  }

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
        <Text style={styles.sectionLabel}>Datos del nuevo curso</Text>

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
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            testID="submit-button"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Crear curso</Text>
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
  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
