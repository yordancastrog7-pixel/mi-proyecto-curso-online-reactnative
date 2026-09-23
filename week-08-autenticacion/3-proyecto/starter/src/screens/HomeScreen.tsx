import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { COURSES } from '../data/courses';
import { getEnrolledCourses } from '../data/enrollments';
import { useAuthStore } from '../stores/authStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { Course } from '../types';

export function HomeScreen(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  // Ids de los cursos en los que está inscrito este estudiante (simulado).
  const enrolledIds = useMemo(
    () => new Set(user ? getEnrolledCourses(user.id).map((course) => course.id) : []),
    [user]
  );

  function renderCourse({ item }: { item: Course }): React.JSX.Element {
    const isEnrolled = enrolledIds.has(item.id);
    return (
      <View style={styles.card} testID={`course-${item.id}`}>
        <View style={styles.headerRow}>
          <Text style={styles.courseName}>{item.name}</Text>
          <Text style={styles.price}>${item.price.toLocaleString()}</Text>
        </View>
        <Text style={styles.instructor}>👤 {item.instructor}</Text>
        <Text style={styles.meta}>
          ⏱ {item.duration} · {item.level}
        </Text>
        <View style={styles.footerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
          {isEnrolled && (
            <View style={styles.enrolledBadge}>
              <Text style={styles.enrolledText}>✓ Inscrito</Text>
            </View>
          )}
          {!item.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>No disponible</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={COURSES}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle} testID="greeting">
              Hola, {user?.firstName ?? 'estudiante'} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              Este es el catálogo de cursos. Los que tienen la etiqueta «Inscrito» ya son tuyos.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.base,
    paddingBottom: SPACING.xl,
  },
  greeting: {
    marginBottom: SPACING.base,
    gap: SPACING.xs,
  },
  greetingTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  courseName: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  price: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.accent,
  },
  instructor: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  meta: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentDim,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.accent,
  },
  enrolledBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success + '33',
  },
  enrolledText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.success,
  },
  unavailableBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error + '33',
  },
  unavailableText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.error,
  },
  separator: {
    height: SPACING.sm,
  },
});
