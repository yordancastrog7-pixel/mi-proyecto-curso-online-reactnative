import { COURSES } from './courses';
import type { Course } from '../types';

// ============================================
// MATRÍCULAS (enrollments) — SIMULADAS
//
// La API de práctica (dummyjson) no sabe nada de cursos ni de
// matrículas. Para que el Perfil muestre datos del DOMINIO (los cursos
// en los que está inscrito el estudiante), se calcula una lista de
// cursos a partir del id del usuario: cada usuario ve siempre los
// mismos 3 cursos, y usuarios distintos ven cursos distintos. En una
// app real esto vendría de un endpoint (`GET /me/enrollments`).
// ============================================
export function getEnrolledCourses(userId: number): Course[] {
  const total = COURSES.length;
  const indexes = [userId % total, (userId + 4) % total, (userId + 8) % total];
  return indexes.map((index) => COURSES[index]);
}
