# EduOnline — Proyecto Semana 06 (Formularios con React Hook Form + Zod)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

Continúa el catálogo de cursos de la Semana 05 (misma API real,
JSONPlaceholder), y le agrega **formularios validados**: crear un
curso nuevo y **editar uno existente**, ambos con React Hook Form +
Zod, y un componente `FormField` reutilizado en las dos pantallas.

---

## 📚 Mi dominio, aplicado a formularios

| Entidad | Qué representa | ¿Usada esta semana? |
|---|---|---|
| `courses` | Los cursos que se ofrecen | ✅ Sí, foco de esta semana |
| `students` | Estudiantes inscritos | No, semanas futuras |
| `enrollments` | Relación estudiante-curso | No, semanas futuras |
| `lessons` | Lecciones dentro de un curso | No, semanas futuras |

**Campos del formulario:** `name` (nombre del curso) y `description`
(descripción) — los mismos 2 campos reales que soporta la API de
práctica (JSONPlaceholder `/posts`), con reglas de validación propias
del dominio (ver `src/schemas/itemSchema.ts`).

En el código la interfaz se sigue llamando `Item` (para no romper los
imports de semanas anteriores), pero representa un `Course`.

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                         # QueryClientProvider + NavigationContainer
├── app.json
├── package.json                    # + react-hook-form, zod, @hookform/resolvers
├── tsconfig.json
└── src/
    ├── schemas/
    │   └── itemSchema.ts            # 🆕 Reglas de validación con Zod
    ├── components/
    │   └── FormField.tsx            # 🆕 Controller + TextInput + error, reutilizable
    ├── hooks/
    │   └── useItems.ts              # useItems, useItemById, useCreateItem, useUpdateItem
    ├── navigation/
    │   ├── types.ts                 # RootStackParamList
    │   └── RootNavigator.tsx        # Stack: Home, Create (modal), Edit
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista — tocar un curso abre su edición
    │   ├── CreateScreen.tsx         # Formulario Create
    │   └── EditScreen.tsx           # Formulario Edit — reset() con datos del servidor
    ├── services/
    │   └── api.ts                   # Instancia Axios
    ├── types/
    │   └── index.ts                 # Item, CreateItemPayload, UpdateItemPayload
    └── theme/
        └── index.ts
```

### `src/schemas/itemSchema.ts` — la única fuente de verdad de validación
```ts
export const itemSchema = z.object({
  name: z.string().min(3, '...').max(80, '...'),
  description: z.string().min(10, '...').max(500, '...'),
});
export type ItemFormData = z.infer<typeof itemSchema>;
```
`ItemFormData` no se escribe a mano — se **infiere** del schema con
`z.infer`. Así, si mañana agrego un campo al schema, el tipo se
actualiza solo, y es imposible que el tipo TypeScript y las reglas de
validación en runtime queden desincronizados (justo lo que penaliza la
rúbrica con −5 pts: "interfaz manual duplicando el schema").

### `src/components/FormField.tsx` — el componente reutilizable
Une 3 cosas que, sin este componente, tocaría repetir en cada campo de
cada formulario: la etiqueta, el `Controller` de react-hook-form (que
conecta el campo con el estado del formulario), y el mensaje de error
debajo. Se usa igual en `CreateScreen` y en `EditScreen` — ninguna de
las dos pantallas repite ese código.

### `src/screens/EditScreen.tsx` — el patrón nuevo de esta semana
Combina 3 piezas que no habían aparecido juntas antes: pedir datos a
la API (`useItemById`), un formulario con validación (`useForm` +
`zodResolver`), y sincronizar ambos con `reset()` dentro de un
`useEffect`. Ver la explicación completa abajo.

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. `Controller` en vez de `register` — por qué en React Native es obligatorio

```tsx
<Controller
  control={control}
  name={name}
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput value={value} onChangeText={onChange} onBlur={onBlur} />
  )}
/>
```

En la web, `register('campo')` funciona porque le devuelve a un
`<input>` un `ref` que React Hook Form usa para leer su valor
directamente del DOM. Los `TextInput` de React Native **no** exponen
el valor a través de un `ref` de esa forma — no hay DOM. Por eso RHF
ofrece `Controller`: en vez de un `ref`, te da 3 funciones/valores
(`onChange`, `onBlur`, `value`) que tú mismo conectas a las props del
componente que quieras (`TextInput`, un `Switch`, un `Picker`, etc.).
Es el puente entre "cómo funciona React Native" y "cómo funciona React
Hook Form".

### 2. `zodResolver` — quién valida y cuándo

```ts
useForm<ItemFormData>({
  resolver: zodResolver(itemSchema),
  defaultValues: { name: '', description: '' },
});
```

Sin `resolver`, `useForm` no sabe validar nada — solo guarda lo que
escribes. `zodResolver(itemSchema)` le dice: "antes de llamar a
`onSubmit`, corre `itemSchema.safeParse(valores)` — si falla, llena
`formState.errors` con los mensajes de Zod y **no** llames a
`onSubmit`". Por eso `handleSubmit(onSubmit)` (no `onSubmit` directo)
es lo que va en el botón: `handleSubmit` es el que decide si se llama
a mi función o no, según pase o no la validación.

### 3. El flujo completo de `EditScreen` — por qué el orden importa

```tsx
const { data: item, isLoading } = useItemById(id);       // 1. pedir datos
const { control, reset, formState } = useForm<ItemFormData>({  // 2. formulario vacío
  resolver: zodResolver(itemSchema),
  defaultValues: { name: '', description: '' },
});

useEffect(() => {                                          // 3. sincronizar
  if (item) reset({ name: item.name, description: item.description });
}, [item, reset]);
```

El problema que resuelve este patrón: `useItemById` tarda un momento en
responder (es una petición real a internet), pero el formulario
(`useForm`) se crea **inmediatamente**, con campos vacíos. No puedo
poner los datos del curso directamente en `defaultValues` porque en
ese momento todavía no existen (`item` es `undefined`). La solución es
dejar que el formulario nazca vacío, y cuando `item` finalmente llegue
(el `useEffect` se vuelve a ejecutar porque `item` cambió), usar
`reset()` para "reescribir" los valores del formulario con los datos
reales. `reset` está en las dependencias del `useEffect` porque ESLint
lo exige (siempre poner en la lista todo lo que se usa adentro), pero
en la práctica `reset` nunca cambia de referencia entre renders.

### 4. `isDirty` — por qué el botón de Editar no se habilita de una

```ts
const canSubmit = isDirty && !isSubmitting && !isPending;
```

`isDirty` es `true` solo si el usuario **modificó** algún campo desde
que se cargó el formulario (comparado contra el último `reset()`). Sin
este chequeo, se podría enviar un `PUT` idéntico a lo que ya había en
el servidor con solo abrir y cerrar la pantalla — un request de red
completamente innecesario. Con `isDirty`, el botón "Guardar cambios"
solo se activa si realmente hay algo que guardar.

### 5. Por qué `CreateScreen` no necesita `isDirty` pero `EditScreen` sí

En `CreateScreen` el formulario siempre arranca vacío — cualquier
envío implica que el usuario escribió algo nuevo, así que no hace
falta distinguir "cambió" de "no cambió". En `EditScreen` el
formulario arranca **con datos ya existentes** (después del `reset`),
así que si el usuario no toca nada y presiona "Guardar", no habría
ningún cambio real que enviar — de ahí la diferencia.

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### 1. Requisitos previos
- Node.js instalado
- App **Expo Go** en tu celular
- Celular y PC en la **misma red WiFi**
- Conexión a internet (esta semana también depende de una API real)

### 2. Instalar dependencias
```bash
cd starter
npm install
```
> ⚠️ Siempre `npm`, nunca `pnpm` (mismo motivo de siempre).

### 3. Iniciar el proyecto
```bash
npx expo start
```

### 4. Ver la app
- **Celular:** escanea el QR con Expo Go.
- **Web:** presiona `w` en la terminal.

### 5. Probar el flujo completo
1. Abre la app → lista de 15 cursos.
2. Toca el "+" del header → formulario de creación. Intenta enviarlo
   vacío → deberían aparecer los mensajes de error en rojo bajo cada
   campo. Corrige y envía → vuelve solo a la lista.
3. Toca un curso de la lista → se abre su formulario de **edición**,
   ya con el nombre y la descripción actuales cargados.
4. Sin cambiar nada, fíjate que el botón "Guardar cambios" está
   deshabilitado (gris). Cambia el nombre → el botón se habilita.
   Guarda → vuelve a la lista.

> Recuerda (documentado desde la Semana 05): JSONPlaceholder simula
> las escrituras, así que los cambios no se guardan realmente en el
> servidor entre peticiones — lo importante es que el formulario
> valide, envíe la petición correcta, y navegue de vuelta sin errores.

---

## 🎨 Decisiones de diseño

1. **Sin pantalla de Detail separada**: a diferencia de la Semana 05,
   esta semana tocar un curso abre directo su edición — es el patrón
   más común en apps reales de gestión (lista → editar), y es lo que
   pide la especificación (`Home`, `Create`, `Edit`, sin `Detail`).
2. **`FormField` con generics, sin `any`**: tipado sobre `T extends
   FieldValues`, así `name` solo acepta campos que existen de verdad en
   el formulario que lo usa — error de compilación si me equivoco de
   nombre de campo.
3. **`isDirty` en Edit, no en Create**: evita mandar peticiones de
   actualización vacías (ver punto 5 de la guía de estudio).
4. **Mismos 15 cursos y traducción al español que la Semana 05**: es
   el mismo catálogo evolucionando, ahora con edición.
5. **Tema compartido con semanas 02-05**: mismos
   `COLORS`/`TYPOGRAPHY`/`SPACING`/`RADIUS` de siempre.

---

## 📱 Capturas de pantalla

_(Agregar aquí 3 capturas: 1) lista, 2) formulario de creación con un
error de validación visible, 3) formulario de edición con datos
precargados)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| `FormField` reutilizable, usado en ambas pantallas | 5 | ✅ |
| `CreateScreen` funcional (zodResolver, mutation, navega atrás) | 8 | ✅ |
| `EditScreen` con `defaultValues` vía `reset()` en `useEffect` | 8 | ✅ |
| Validación activa y mensajes visibles | 5 | ✅ |
| App corriendo en simulador, sin errores | 4 | ⏳ (probar antes de entregar) |

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-06` (creada desde
   `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 06 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
