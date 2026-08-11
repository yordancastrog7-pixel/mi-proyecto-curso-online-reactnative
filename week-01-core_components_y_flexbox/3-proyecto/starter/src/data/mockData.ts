// ============================================================
// MOCK DATA — src/data/mockData.ts
// ============================================================
// Datos de ejemplo para la plataforma de cursos online.
// ============================================================
import { Course } from '../types';

export const MOCK_ITEMS: Course[] = [
  {
    id: '1',
    name: 'React Native desde Cero',
    subtitle: 'Aprende a construir apps móviles multiplataforma',
    imageUri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSn68lxiivTBHKmQglC4hEH7gpLH4MwivhQPZibe3ZBA&s=10',
    instructor: 'Erick Granados',
    price: 149000,
    category: 'Programación',
  },
  {
    id: '2',
    name: 'Fundamentos de UX/UI',
    subtitle: 'Diseña interfaces centradas en el usuario',
    imageUri: 'https://calltek.es/wp-content/uploads/2022/09/5809368.webp',
    instructor: 'Laura Méndez',
    price: 89000,
    category: 'Diseño',
  },
  {
    id: '3',
    name: 'Bases de Datos con SQL',
    subtitle: 'Modela y consulta datos de forma profesional',
    imageUri: 'https://www.utadeo.edu.co/sites/tadeo/files/node/continued/field_image/diplomado_administracion_y_consulta_de_bases_de_datos_sql_server._portada.png',
    instructor: 'Carlos Rojas',
    price: 119000,
    category: 'Backend',
  },
  {
    id: '4',
    name: 'Marketing Digital Práctico',
    subtitle: 'Estrategias reales para redes sociales y SEO',
    imageUri: 'https://unir.edu.co/wp-content/uploads/sites/2/2025/07/Como-empezar-a-trabajar-en-Marketing-Digital1.jpg',
    instructor: 'Andrea Silva',
    price: 69000,
    category: 'Marketing',
  },
];
