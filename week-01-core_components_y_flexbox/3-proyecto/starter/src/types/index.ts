// ============================================================
// TYPES — src/types/index.ts
// ============================================================
// Interfaz que define la forma de un Curso dentro de la
// plataforma de cursos online.
// ============================================================
export interface Course {
  id: string;
  name: string;
  imageUri: string;
  subtitle: string;       // descripción corta del curso
  instructor: string;     // nombre del instructor
  price: number;           // precio del curso
  category: string;        // categoría (ej: "Programación", "Diseño")
}