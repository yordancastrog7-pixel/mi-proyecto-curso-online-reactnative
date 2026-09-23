import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormField } from '../components/FormField';
import type { AuthStackParamList } from '../navigation/types';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchema';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<RegisterNavigationProp>();

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => clearError, [clearError]);

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      // Registro simulado: no abre sesión. Volvemos al Login con el
      // usuario recién creado ya escrito.
      navigation.navigate('Login', { registeredUsername: values.username });
    } catch {
      // El mensaje ya quedó en `error` del store.
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Crea tu cuenta de estudiante para empezar a aprender.</Text>

        <FormField<RegisterFormValues>
          control={control}
          name="username"
          label="Usuario"
          placeholder="Elige un usuario"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          errorMessage={errors.username?.message}
        />

        <FormField<RegisterFormValues>
          control={control}
          name="email"
          label="Correo electrónico"
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          errorMessage={errors.email?.message}
        />

        <FormField<RegisterFormValues>
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          errorMessage={errors.password?.message}
        />

        <FormField<RegisterFormValues>
          control={control}
          name="confirmPassword"
          label="Confirmar contraseña"
          placeholder="Repite la contraseña"
          secureTextEntry
          autoCapitalize="none"
          errorMessage={errors.confirmPassword?.message}
        />

        {error && <Text style={styles.errorBox}>{error}</Text>}

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          testID="register-submit"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.buttonText}>Crear cuenta</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  hint: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
  },
  errorBox: {
    backgroundColor: COLORS.error + '26',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.error,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.background,
  },
});
