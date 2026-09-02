// ============================================
// TYPES — Semana 05
// Modelo del dominio: courses, tal como los vamos a MOSTRAR en la app.
//
// Nota importante: esta semana los datos vienen de una API real
// (JSONPlaceholder, usada como "proxy" — así lo sugiere la
// especificación de la semana) que solo expone
// { id, userId, title, body } por cada post. Por eso `Item` esta
// semana es más simple que el `Item` de las semanas 2-4 (no hay
// price/category/duration/level reales que pedirle a esta API) — el
// mapeo entre lo que la API devuelve y esta forma vive en
// `src/hooks/useItems.ts`.
// ============================================
export interface Item {
  id: number;
  name: string; // ← post.title
  description: string; // ← post.body
  instructor: string; // ← derivado de post.userId (ver useItems.ts)
}

// Lo que se envía al crear un curso nuevo (CreateScreen).
// No lleva `id` — lo asigna el servidor.
export interface CreateItemPayload {
  name: string;
  description: string;
}
