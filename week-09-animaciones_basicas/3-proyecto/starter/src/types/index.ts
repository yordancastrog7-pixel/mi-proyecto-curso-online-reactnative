// ============================================
// TIPOS — Semana 09 (Animaciones)
// ============================================
export type CourseCategory =
  | 'Programación'
  | 'Diseño'
  | 'Backend'
  | 'Marketing'
  | 'Datos'
  | 'Idiomas';

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  price: number;
  category: CourseCategory;
  duration: string;
  level: CourseLevel;
  available: boolean;
}

// Una MATRÍCULA (`enrollment`): el estudiante está inscrito en un curso y
// lleva `completedLessons` lecciones hechas de las que tiene ese curso.
// De ahí sale el progreso que muestra la barra (completadas / total).
export interface Enrollment {
  course: Course;
  completedLessons: number;
}
