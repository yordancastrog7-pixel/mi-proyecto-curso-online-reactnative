import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { jwtDecode } from 'jwt-decode';

import { getEnrolledCourses } from '../data/enrollments';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { JwtPayload } from '../types';

// Lee cuándo vence el access token DECODIFICANDO el JWT (su payload es
// base64, no está cifrado — cualquiera puede leerlo, por eso nunca se
// guardan secretos ahí). Devuelve solo la hora, jamás el token.
function getSessionExpiryLabel(accessToken: string | null): string | null {
  if (!accessToken) return null;
  try {
    const { exp } = jwtDecode<JwtPayload>(accessToken);
    return new Date(exp * 1000).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export function ProfileScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  // El perfil se muestra al instante con lo guardado (`user`) y se
  // completa/actualiza con /auth/me (pasa por el interceptor de tokens).
  const { data: profile, isLoading, isError } = useProfile();

  if (!user) return <View style={styles.container} />;

  const enrolledCourses = getEnrolledCourses(user.id);
  const expiry = getSessionExpiryLabel(accessToken);
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {user.image ? (
          <Image source={{ uri: user.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <Text style={styles.name} testID="profile-name">
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mi cuenta</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Correo</Text>
          <Text style={styles.rowValue} testID="profile-email">
            {user.email}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Universidad</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <Text style={styles.rowValue} testID="profile-university">
              {profile?.university ?? '—'}
            </Text>
          )}
        </View>
        {isError && (
          <Text style={styles.warning}>
            No se pudo actualizar el perfil desde el servidor. Se muestran los datos guardados.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mis cursos inscritos</Text>
        {enrolledCourses.map((course) => (
          <View key={course.id} style={styles.courseRow}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseInstructor}>👤 {course.instructor}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sesión</Text>
        <Text style={styles.sessionText}>
          🔒 Tus credenciales están guardadas cifradas en el teléfono.
        </Text>
        {expiry && (
          <Text style={styles.sessionText} testID="session-expiry">
            El acceso actual vence a las {expiry} y se renueva solo.
          </Text>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={() => void logout()} testID="logout-button">
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
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
  hero: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentDim,
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.accent,
  },
  name: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowLabel: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  warning: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.warning,
  },
  courseRow: {
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 2,
  },
  courseName: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textPrimary,
  },
  courseInstructor: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
  },
  sessionText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.error,
  },
});
