import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { readItemsCache, saveItemsCache } from '../storage/itemsCache';
import type {
  CreateItemPayload,
  Item,
  ItemsWithSource,
  UpdateItemPayload,
} from '../types';

// ============================================
// MAPEO API → DOMINIO (igual que las Semanas 05-06)
// ============================================
interface PostResponse {
  id: number;
  userId: number;
  title: string;
  body: string;
}

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

// Mismo catálogo en español que la Semana 05 — misma API, mismos 15
// cursos, para que sea el mismo catálogo evolucionando semana a
// semana (esta vez con edición).
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

export const ITEMS_QUERY_KEY = ['courses'] as const;

// ============================================
// useItems — lista de cursos CON CACHÉ OFFLINE (novedad de la Semana 07)
//
// Flujo:
//   1. Intenta pedir la lista a la API.
//   2. Si funciona → guarda una copia en AsyncStorage y devuelve
//      { source: 'network' }.
//   3. Si falla (sin internet, servidor caído…) → lee la última copia
//      guardada y devuelve { source: 'cache' } — la pantalla muestra el
//      banner "Mostrando datos sin red".
//   4. Si falla Y nunca se guardó nada → ahora sí lanza error (la
//      pantalla muestra el estado de error de la semana 05).
//
// Como el `catch` devuelve datos en vez de lanzar error, TanStack
// Query lo considera un éxito y NO hace los reintentos automáticos.
// ============================================
export function useItems() {
  return useQuery<ItemsWithSource>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async (): Promise<ItemsWithSource> => {
      try {
        const { data } = await apiClient.get<PostResponse[]>('/posts?_limit=15');
        const items = data.map(mapPostToItem);
        // Guardar la caché nunca debe romper la carga: si falla el
        // guardado, igual mostramos los datos frescos.
        await saveItemsCache(items).catch(() => undefined);
        return { items, source: 'network' };
      } catch (networkError) {
        const cached = await readItemsCache();
        if (cached) {
          return { items: cached.items, source: 'cache', cachedAt: cached.savedAt };
        }
        throw networkError;
      }
    },
  });
}

// ============================================
// useItemById — un curso individual (EditScreen)
// ============================================
export function useItemById(id: number) {
  return useQuery<Item>({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<PostResponse>(`/posts/${id}`);
      return mapPostToItem(data);
    },
    enabled: !!id,
  });
}

// ============================================
// useCreateItem — POST (CreateScreen)
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
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}

// ============================================
// useUpdateItem — PUT (EditScreen)
// A diferencia de crear, editar sí apunta a un curso que existe de
// verdad en JSONPlaceholder (ids 1-15), así que el PUT es contra un
// recurso real (igual sigue sin persistir entre peticiones, es una
// API de práctica — ver el README).
// ============================================
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, UpdateItemPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.put<PostResponse>(`/posts/${payload.id}`, {
        id: payload.id,
        title: payload.name,
        body: payload.description,
        userId: 1,
      });
      return mapPostToItem(data);
    },
    onSuccess: (_data, variables) => {
      // Invalida la lista Y el curso individual — así, si alguien
      // vuelve a abrir el mismo curso, no ve datos viejos en caché.
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ITEMS_QUERY_KEY, variables.id] });
    },
  });
}
