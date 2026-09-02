import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CreateItemPayload, Item } from '../types';

// ============================================
// MAPEO API → DOMINIO
// JSONPlaceholder devuelve posts genéricos; los adaptamos a la forma
// de un curso. Centralizar este mapeo aquí (y no repetirlo en cada
// pantalla) es lo que permite que HomeScreen/DetailScreen trabajen
// siempre con `Item` (curso), sin saber nada de "posts".
// ============================================
interface PostResponse {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// Nombres de instructores reutilizados de las semanas 2-4, para que
// los "cursos" de esta semana se sientan parte del mismo catálogo.
const INSTRUCTOR_NAMES = [
  'Erick Granados',
  'Laura Méndez',
  'Carlos Rojas',
  'Andrea Silva',
  'Mónica Herrera',
  'David Torres',
];

function instructorFromUserId(userId: number): string {
  return INSTRUCTOR_NAMES[(userId - 1) % INSTRUCTOR_NAMES.length];
}

// ============================================
// TRADUCCIÓN DE CONTENIDO — Semana 05
// JSONPlaceholder devuelve título/cuerpo en texto latín de relleno
// ("lorem ipsum"), sin ningún significado real — no es que esté en
// otro idioma real, es texto generado sin sentido. Como se pide que
// la app se vea coherente con el dominio (cursos), reemplazamos el
// `title`/`body` de cada post por un nombre y descripción reales en
// español, mapeados por `id`.
//
// Esto NO reemplaza la petición real a la API: seguimos pidiendo los
// datos a `/posts` de verdad (con su loading, su error, su id, su
// userId) — solo cambiamos qué texto mostramos para esos 2 campos.
// `_limit=15` siempre devuelve los mismos posts (id 1 al 15, datos
// estáticos de JSONPlaceholder), así que el mapeo por id es estable.
// Si algún día se pidiera un id fuera de este rango (no debería pasar
// en esta app), se usa el texto original de la API como respaldo.
// ============================================
const COURSE_CONTENT_ES: Record<number, { name: string; description: string }> = {
  1: {
    name: 'Introducción a TypeScript',
    description: 'Tipado estático aplicado a proyectos reales de JavaScript, desde cero.',
  },
  2: {
    name: 'Testing en React Native con Jest',
    description: 'Pruebas unitarias y de componentes para apps móviles confiables.',
  },
  3: {
    name: 'Git y Control de Versiones',
    description: 'Flujo de trabajo colaborativo con ramas, merges y resolución de conflictos.',
  },
  4: {
    name: 'Diseño de APIs REST',
    description: 'Buenas prácticas para diseñar endpoints claros, versionados y documentados.',
  },
  5: {
    name: 'Bases de Datos NoSQL con MongoDB',
    description: 'Modelado de documentos y consultas para aplicaciones de alto volumen.',
  },
  6: {
    name: 'Introducción a Docker',
    description: 'Contenedores para empaquetar y desplegar aplicaciones de forma consistente.',
  },
  7: {
    name: 'Accesibilidad Web y Móvil',
    description: 'Cómo construir interfaces usables para todas las personas, sin excepciones.',
  },
  8: {
    name: 'Fundamentos de Ciberseguridad',
    description: 'Principios básicos para proteger aplicaciones y datos de usuarios.',
  },
  9: {
    name: 'Introducción a GraphQL',
    description: 'Consultas flexibles de datos como alternativa a REST tradicional.',
  },
  10: {
    name: 'Animaciones con Reanimated',
    description: 'Transiciones fluidas y gestos nativos en aplicaciones React Native.',
  },
  11: {
    name: 'Clean Code y Buenas Prácticas',
    description: 'Principios para escribir código legible y fácil de mantener en equipo.',
  },
  12: {
    name: 'Introducción a CI/CD',
    description: 'Automatización de pruebas y despliegues con integración continua.',
  },
  13: {
    name: 'UX Writing para Apps',
    description: 'Cómo escribir microcopy claro que guía al usuario dentro de la interfaz.',
  },
  14: {
    name: 'Patrones de Diseño en JavaScript',
    description: 'Singleton, Factory y Observer aplicados a proyectos reales.',
  },
  15: {
    name: 'Introducción a WebSockets',
    description: 'Comunicación en tiempo real entre cliente y servidor.',
  },
};

function mapPostToItem(post: PostResponse): Item {
  const translated = COURSE_CONTENT_ES[post.id];
  return {
    id: post.id,
    name: translated?.name ?? post.title,
    description: translated?.description ?? post.body,
    instructor: instructorFromUserId(post.userId),
  };
}

// ============================================
// QUERY KEY — centralizada para no equivocarse al invalidar
// ============================================
export const ITEMS_QUERY_KEY = ['courses'] as const;

// ============================================
// useItems — lista de cursos
// ============================================
export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<PostResponse[]>('/posts?_limit=15');
      return data.map(mapPostToItem);
    },
  });
}

// ============================================
// useItemById — un curso individual (DetailScreen)
// ============================================
export function useItemById(id: number) {
  return useQuery<Item>({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<PostResponse>(`/posts/${id}`);
      return mapPostToItem(data);
    },
    enabled: !!id, // no corre la query si todavía no hay id
  });
}

// ============================================
// useCreateItem — crear un curso nuevo (CreateScreen)
// ============================================
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<PostResponse>('/posts', {
        title: payload.name,
        body: payload.description,
        userId: 1,
      });
      return mapPostToItem(data);
    },
    onSuccess: () => {
      // Marca la lista de cursos como "vieja" (stale) → TanStack Query
      // vuelve a pedirla automáticamente, sin que nadie llame a
      // refetch() a mano.
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('No se pudo crear el curso:', error.message);
    },
  });
}
