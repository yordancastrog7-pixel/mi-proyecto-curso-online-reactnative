import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ProgressBar } from '../components/ProgressBar';
import { getCourse, getProgress, TOTAL_LESSONS } from '../data/lessons';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route }: Props): React.JSX.Element {
  const { courseId, completedLessons } = route.params;
  const course = getCourse(courseId);

  // Entrada del detalle: aparece (opacity 0→1) y sube (translateY 30→0) a
  // la vez, 500 ms. `Animated.parallel` lanza las dos animaciones juntas;
  // ambas son opacity/transform, así que corren en el hilo nativo.
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, translateYAnim]);

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.description}>No se encontró el curso.</Text>
      </View>
    );
  }

  const total = TOTAL_LESSONS[course.id] ?? 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View
        style={{ opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }}
        testID="detail-content"
      >
        <View style={styles.card}>
          <Text style={styles.name}>{course.name}</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mi progreso</Text>
          <ProgressBar
            progress={getProgress(course.id, completedLessons)}
            label="Lecciones completadas"
            detail={`${completedLessons} de ${total}`}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos del curso</Text>
          <Row label="Instructor" value={course.instructor} />
          <Row label="Categoría" value={course.category} />
          <Row label="Nivel" value={course.level} />
          <Row label="Duración" value={course.duration} />
          <Row label="Lecciones" value={String(total)} />
          <Row label="Precio" value={`$${course.price.toLocaleString()}`} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: 22,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  rowLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.size.base,
  },
  rowValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.size.base,
    flexShrink: 1,
    textAlign: 'right',
  },
});
