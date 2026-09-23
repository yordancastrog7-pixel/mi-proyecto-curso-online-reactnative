import { z } from 'zod';

// ============================================
// SCHEMAS ZOD — Semana 08
// Igual que en la Semana 06: una sola fuente de verdad para las reglas,
// y los tipos TypeScript se INFIEREN de aquí (`z.infer`).
// ============================================

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'El usuario debe tener al menos 2 caracteres')
    .max(50, 'El usuario no puede superar 50 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'Contraseña demasiado larga'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, 'El usuario debe tener al menos 2 caracteres')
      .max(50, 'El usuario no puede superar 50 caracteres'),
    email: z.email('Ingresa un correo electrónico válido').toLowerCase(),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'Contraseña demasiado larga'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  // `refine` a nivel de todo el objeto: compara DOS campos entre sí, algo
  // que una regla de un solo campo no puede hacer.
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
