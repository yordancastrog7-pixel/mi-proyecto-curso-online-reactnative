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
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormField } from '../components/FormField';
import type { AuthStackParamList } from '../navigation/types';
import { loginSchema, type LoginFormValues } from '../schemas/authSchema';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginRouteProp = RouteProp<AuthStackParamList, 'Login'>;

export function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginNavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const registeredUsername = route.params?.registeredUsername;

  // Selectores específicos: cada uno lee solo lo que necesita del store.
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: registeredUsername ?? '', password: '' },
  });

  // Al salir de la pantalla, borra un error viejo para que no aparezca
  // en el siguiente intento.
  useEffect(() => clearError, [clearError]);

  async function onSubmit(values: LoginFormValues): Promise<void> {
    try {
      await login(values);
      // No hace falta navegar: al cambiar `isAuthenticated`, RootNavigator
      // reemplaza solo este navegador por el de la app.
    } catch {
      // El store ya guardó el mensaje en `error`; se muestra abajo.
    }
  }

  function fillPracticeAccount(): void {
    setValue('username', 'emilys', { shouldValidate: true });
    setValue('password', 'emilyspass', { shouldValidate: true });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>EduOnline</Text>
          <Text style={styles.subtitle}>Inicia sesión para ver tus cursos</Text>
        </View>

        {registeredUsername && (
          <View style={styles.infoBox} testID="registered-banner">
            <Text style={styles.infoText}>
              Cuenta simulada creada para «{registeredUsername}». La API de práctica no guarda
              usuarios nuevos, así que para entrar usa la cuenta de práctica.
            </Text>
          </View>
        )}

        <FormField<LoginFormValues>
          control={control}
          name="username"
          label="Usuario"
          placeholder="Tu usuario"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          errorMessage={errors.username?.message}
        />

        <FormField<LoginFormValues>
          control={control}
          name="password"
          label="Contraseña"
          placeholder="Tu contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          errorMessage={errors.password?.message}
        />

        {error && (
          <Text style={styles.errorBox} testID="login-error">
            {error}
          </Text>
        )}

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          testID="login-submit"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={fillPracticeAccount} testID="fill-practice">
          <Text style={styles.secondaryButtonText}>Usar cuenta de práctica</Text>
        </Pressable>

        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Register')}
          testID="go-register"
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
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
  header: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.lg,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
  },
  infoBox: {
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  infoText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textPrimary,
    lineHeight: 19,
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
  secondaryButton: {
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
  link: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  linkText: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
  },
});
