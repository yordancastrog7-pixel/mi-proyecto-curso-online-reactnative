// ============================================
// TYPES — Semana 06
// Igual que la Semana 05: `Item` representa un curso, con datos
// que vienen de la API real (JSONPlaceholder /posts como proxy).
// ============================================
export interface Item {
  id: number;
  name: string;
  description: string;
  instructor: string;
}

export interface CreateItemPayload {
  name: string;
  description: string;
}

export interface UpdateItemPayload {
  id: number;
  name: string;
  description: string;
}
