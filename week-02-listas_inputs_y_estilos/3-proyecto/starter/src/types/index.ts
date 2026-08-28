// ============================================
// TYPES — Semana 02
// Interfaz del dominio: Plataforma de cursos online
// ============================================
export interface Item {
  id: string;
  /** Nombre o título principal del elemento */
  name: string;
  instructor: string;
  price: number;
  category: CourseCategory;
  duration: string; // ej: "8 horas", "3 semanas"
  level: CourseLevel;
  available: boolean;
}

export type CourseCategory =
  | 'Programación'
  | 'Diseño'
  | 'Backend'
  | 'Marketing'
  | 'Datos'
  | 'Idiomas';

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';