import { z } from 'zod';

// ============================================
// SCHEMA ZOD — Semana 06
// Una sola fuente de verdad para las reglas del formulario de curso.
// El tipo TypeScript (`ItemFormData`) se infiere de este schema con
// `z.infer` — así nunca hay que mantener una interfaz manual aparte
// que se pueda desincronizar de las reglas reales de validación.
// ============================================
export const itemSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'Máximo 80 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

export type ItemFormData = z.infer<typeof itemSchema>;
