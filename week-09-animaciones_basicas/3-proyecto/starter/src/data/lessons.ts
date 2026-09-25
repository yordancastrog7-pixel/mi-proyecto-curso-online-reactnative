import { COURSES } from './courses';
import type { Course, Enrollment } from '../types';

// ============================================
// LECCIONES (`lessons`) por curso — datos de ejemplo
// Total de lecciones de cada curso, por id.
// ============================================
export const TOTAL_LESSONS: Record<string, number> = {
  '1': 24,
  '2': 12,
  '3': 18,
  '4': 9,
  '5': 30,
  '6': 15,
  '7': 36,
  '8': 18,
  '9': 12,
  '10': 18,
  '11': 9,
  '12': 30,
};

export function getCourse(courseId: string): Course | undefined {
  return COURSES.find((course) => course.id === courseId);
}

export function getProgress(courseId: string, completedLessons: number): number {
  const total = TOTAL_LESSONS[courseId] ?? 1;
  return Math.min(completedLessons / total, 1);
}

// Cursos en los que el estudiante ya está inscrito al abrir la app,
// cada uno con un avance distinto para que la barra pase por los tres
// colores (rojo → amarillo → verde).
export const INITIAL_ENROLLMENTS: Enrollment[] = [
  { course: COURSES[0], completedLessons: 19 }, // 79%  → verde
  { course: COURSES[2], completedLessons: 8 }, //  44%  → amarillo
  { course: COURSES[3], completedLessons: 1 }, //  11%  → rojo
  { course: COURSES[9], completedLessons: 11 }, // 61%  → amarillo-verde
];
