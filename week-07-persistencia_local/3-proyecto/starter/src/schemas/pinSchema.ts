import { z } from 'zod';

// ============================================
// SCHEMA ZOD — PIN de instructor (Semana 07)
// Misma idea de la Semana 06 (una sola fuente de verdad para las
// reglas), aplicada al dato sensible: 4 a 6 dígitos, solo números.
// ============================================
export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, 'El PIN debe tener entre 4 y 6 dígitos (solo números)');
