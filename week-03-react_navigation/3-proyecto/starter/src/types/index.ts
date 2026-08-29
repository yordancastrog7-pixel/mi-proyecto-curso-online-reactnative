// ============================================
// TYPES — Semana 03
// Interfaz del dominio: Plataforma de cursos online
// Mismo shape que la Semana 02, más `description` (la usa DetailScreen).
// ============================================
export interface Item {
  id: string;
  name: string;
  description: string;
  instructor: string;
  price: number;
  category: CourseCategory;
  duration: string; // ej: "8 semanas"
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
