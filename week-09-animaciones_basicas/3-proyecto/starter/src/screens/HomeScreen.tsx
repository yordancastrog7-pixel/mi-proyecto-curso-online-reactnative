import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedButton } from '../components/AnimatedButton';
import { AnimatedCard } from '../components/AnimatedCard';
import { ProgressBar } from '../components/ProgressBar';
import { COURSES } from '../data/courses';
import { getProgress, INITIAL_ENROLLMENTS, TOTAL_LESSONS } from '../data/lessons';
import type { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import type { Enrollment } from '../types';

// Android necesita activar LayoutAnimation a mano. Va FUERA del componente
// (se ejecuta una sola vez, al cargar el archivo). El `?.` es porque en
// iOS y en la nueva arquitectura esta función puede no existir.
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(INITIAL_ENROLLMENTS);

  // Un Animated.Value POR CURSO (0 = invisible, 1 = visible) para la
  // entrada en cascada. Van en un `useRef` para que sobrevivan a los
  // re-renders sin recrearse. Una lista dinámica no puede tener un
  // arreglo fijo, por eso se guardan en un Map por id.
  //
  // IMPORTANTE: los cursos iniciales se crean YA en 0 (invisibles), antes
  // del primer dibujo. Si se crearan "por demanda" al dibujar cada
  // tarjeta, nacerían en 1 (visibles) y la cascada no se vería: el efecto
  // que la lanza corre DESPUÉS del primer dibujo.
  const animsRef = useRef<Map<string, Animated.Value> | null>(null);
  if (animsRef.current === null) {
    animsRef.current = new Map(
      INITIAL_ENROLLMENTS.map((e) => [e.course.id, new Animated.Value(0)])
    );
  }
  const anims = animsRef.current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  function getAnim(courseId: string, initial = 0): Animated.Value {
    let anim = anims.get(courseId);
    if (!anim) {
      anim = new Animated.Value(initial);
      anims.set(courseId, anim);
    }
    return anim;
  }

  // ── Animación de entrada al montar: cabecera + tarjetas en cascada ──
  useEffect(() => {
    const fadeIn = (anim: Animated.Value): Animated.CompositeAnimation =>
      Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true });

    // `stagger(80, [...])` lanza cada animación 80 ms después de la anterior.
    Animated.stagger(80, [
      fadeIn(headerAnim),
      ...INITIAL_ENROLLMENTS.map((e) => fadeIn(getAnim(e.course.id))),
    ]).start();
    // Solo al montar: `anims` y `headerAnim` no cambian nunca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enrolledIds = new Set(enrollments.map((e) => e.course.id));
  const nextCourse = COURSES.find((c) => c.available && !enrolledIds.has(c.id));

  function handleRemove(courseId: string): void {
    // `configureNext` va ANTES del setState: le dice a React Native "el
    // próximo cambio de layout, anímalo". Sin esto, la tarjeta
    // desaparecería de golpe y las de abajo "saltarían" hacia arriba.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    anims.delete(courseId);
    setEnrollments((prev) => prev.filter((e) => e.course.id !== courseId));
  }

  function handleEnroll(): void {
    if (!nextCourse) return;
    // La tarjeta nueva entra con fundido (Animated) mientras las demás se
    // acomodan (LayoutAnimation): dos animaciones que se complementan.
    const anim = getAnim(nextCourse.id, 0);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEnrollments((prev) => [...prev, { course: nextCourse, completedLessons: 0 }]);
    Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  function renderItem({ item }: { item: Enrollment }): React.JSX.Element {
    const anim = getAnim(item.course.id, 1);
    const total = TOTAL_LESSONS[item.course.id] ?? 1;

    return (
      <Animated.View
        style={{
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          ],
        }}
      >
        <AnimatedCard
          onPress={() =>
            navigation.navigate('Detail', {
              courseId: item.course.id,
              completedLessons: item.completedLessons,
            })
          }
        >
          <Text style={styles.courseName}>{item.course.name}</Text>
          <Text style={styles.instructor}>👤 {item.course.instructor}</Text>
          <ProgressBar
            progress={getProgress(item.course.id, item.completedLessons)}
            label="Lecciones completadas"
            detail={`${item.completedLessons} de ${total}`}
          />
          <AnimatedButton
            label="Darme de baja"
            variant="danger"
            onPress={() => handleRemove(item.course.id)}
            testID={`remove-${item.course.id}`}
          />
        </AnimatedCard>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.course.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>Mis cursos</Text>
            <Text style={styles.subtitle} testID="course-count">
              {enrollments.length} curso{enrollments.length !== 1 ? 's' : ''} inscrito
              {enrollments.length !== 1 ? 's' : ''}
            </Text>
          </Animated.View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No estás inscrito en ningún curso todavía.</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <AnimatedButton
              label={nextCourse ? '+ Inscribirme a un curso' : 'Ya estás en todos los cursos'}
              onPress={handleEnroll}
              disabled={!nextCourse}
              testID="enroll-button"
            />
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.base,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.size.sm,
    marginTop: 2,
  },
  courseName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  instructor: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.sm,
  },
  separator: {
    height: SPACING.md,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.base,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  footer: {
    marginTop: SPACING.xl,
  },
});
