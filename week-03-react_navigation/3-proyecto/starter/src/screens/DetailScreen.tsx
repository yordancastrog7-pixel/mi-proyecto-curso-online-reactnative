import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

// RouteProp es el tipo genérico de React Navigation para los params de
// CUALQUIER navigator (Stack, Tab, Drawer) — no hay una versión
// "NativeStackRouteProp" separada, esa solo existe para el hook de
// navegación (NativeStackNavigationProp), no para el de route.
type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'HomeDetail'>;

export function DetailScreen(): React.JSX.Element {
  // Los params llegan tipados gracias a HomeStackParamList — TypeScript
  // avisaría en rojo si intentáramos leer un campo que no existe.
  const route = useRoute<DetailScreenRouteProp>();
  const { name, instructor, price, category, duration, level, available } =
    route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{category}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Instructor</Text>
        <Text style={styles.fieldValue}>{instructor}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Precio</Text>
        <Text style={styles.fieldValue}>${price.toLocaleString()}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Duración</Text>
        <Text style={styles.fieldValue}>{duration}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Nivel</Text>
        <Text style={styles.fieldValue}>{level}</Text>
      </View>

      <View style={[styles.field, !available && styles.fieldWarning]}>
        <Text style={styles.fieldLabel}>Disponibilidad</Text>
        <Text style={[styles.fieldValue, !available && styles.unavailableValue]}>
          {available ? 'Cupos disponibles' : 'No disponible por ahora'}
        </Text>
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
  },
  name: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.accent,
    textTransform: 'capitalize',
  },
  field: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldWarning: {
    borderColor: COLORS.error,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
  },
  unavailableValue: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});
