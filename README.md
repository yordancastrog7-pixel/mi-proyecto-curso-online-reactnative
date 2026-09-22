# bc-reactnative — Entregas del Bootcamp

> **Aprendiz:** Yordan Castro Guerrero
> **Ficha:** 3228970
> **Bootcamp:** bc-reactnative
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`

Este repositorio contiene todas mis entregas semanales del bootcamp de
React Native, dictado por el profesor Erick Granados. Se usa el **mismo
repo durante todo el trimestre** — cada semana se sube en su propia rama
(`week-01`, `week-02`, `week-03`, `week-04`), adaptando siempre el
material de clase a mi dominio asignado.

---

## 📚 Índice de semanas

| Semana | Tema | Rama | Estado |
|---|---|---|---|
| **01** | Fundamentos RN — Core Components y Flexbox | [`week-01`](../../tree/week-01) | ✅ Entregado |
| **02** | Listas, Inputs y Estilos | [`week-02`](../../tree/week-02) | ✅ Entregado |
| **03** | React Navigation (Tabs + Stack) | [`week-03`](../../tree/week-03) | ✅ Entregado |
| **04** | Estado Global con Zustand | [`week-04`](../../tree/week-04) | ✅ Entregado |
| **05** | Networking con TanStack Query | [`week-05`](../../tree/week-05) | ✅ Entregado |
| **06** | Formularios y Validación (RHF + Zod) | [`week-06`](../../tree/week-06) | ✅ Entregado |
| **07** | Persistencia Local (MMKV + AsyncStorage + SecureStore) | [`week-07`](../../tree/week-07) | ✅ Entregado |

> 💡 Para ver el código de una semana específica, cambia de rama con el
> selector de GitHub o clona y haz `git checkout week-0N`.

---

## 🎓 Semana 01 — App de Tarjetas (EduOnline)

**Objetivo:** pantalla única con lista de tarjetas usando Core
Components y Flexbox, adaptada al dominio de una plataforma de cursos
online.

**Entidad usada:** `Course` (curso) — con campos `name`, `subtitle`,
`imageUri`, `instructor`, `price`, `category`.

**Ruta del proyecto en esta rama:**
```
week-01-core_components_y_flexbox/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta
(`.../starter/README.md`) para instrucciones detalladas de instalación,
ejecución y solución de problemas comunes.

**Stack:** React Native · Expo SDK 54 · TypeScript

---

## 🎓 Semana 02 — Catálogo con Búsqueda (EduOnline)

**Objetivo:** lista de cursos con `FlatList`, búsqueda en tiempo real con
`TextInput` y estilos centralizados en un tema, adaptada al dominio de
una plataforma de cursos online.

**Entidad usada:** `Item` (representa `Course`) — con campos `name`,
`instructor`, `price`, `category`, `duration`, `level`, `available`.

**Ruta del proyecto en esta rama:**
```
week-02-listas_inputs_y_estilos/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta
(`.../starter/README.md`).

**Stack:** React Native · Expo SDK 54 · TypeScript

---

## 🎓 Semana 03 — Navegación (Tabs + Stack anidado)

**Objetivo:** navegación completa con React Navigation 7 — Tab
Navigator con 2 pestañas (Cursos / Favoritos) y Stack Navigator anidado
dentro de "Cursos" para ir de la lista al detalle, con parámetros
tipados end-to-end.

**Entidad usada:** `Item` (representa `Course`), con navegación
`HomeList → HomeDetail` y una segunda pestaña `Favorites`.

**Ruta del proyecto en esta rama:**
```
week-03-react_navigation/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta — incluye
además una guía de estudio con la explicación de cada patrón de
navegación usado (navigators anidados, params tipados, `useRoute`,
`useNavigation`).

**Stack:** React Native · Expo SDK 54 · React Navigation 7 · TypeScript

---

## 🎓 Semana 04 — Estado Global con Zustand

**Objetivo:** carrito de cursos con estado global compartido entre
pestañas (`useCartStore`) — agregar/quitar un curso desde su detalle
actualiza en tiempo real el badge de la pestaña "Carrito", sin pasar
props ni callbacks entre pantallas.

**Entidad usada:** `Item` (representa `Course`), con un store Zustand
(`addItem`, `removeItem`, `clearAll`, `isItemInCart`) inspirado en la
entidad `enrollments` del dominio (un carrito de inscripción).

**Ruta del proyecto en esta rama:**
```
week-04-estado_global_zustand/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta — incluye
la guía de estudio con la explicación de selectores de Zustand y un bug
real de reactividad que encontré y corregí probando la app.

**Stack:** React Native · Expo SDK 54 · React Navigation 7 · Zustand · TypeScript

---

## 🎓 Semana 05 — Networking con TanStack Query

**Objetivo:** consumir una API REST real (Axios + TanStack Query v5) —
lista de cursos con estados de carga/error/vacío, pull-to-refresh,
detalle, y formulario de creación con `useMutation`.

**Entidad usada:** `Item` (representa `Course`), obtenida de
JSONPlaceholder (`/posts` como proxy, sugerido por la especificación),
con nombre/descripción traducidos al español e instructor derivado del
`userId`.

**Ruta del proyecto en esta rama:**
```
week-05-networking_tanstack_query/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta — incluye
la guía de estudio sobre los estados de `useQuery`, `queryKey` e
`invalidateQueries`, y una nota sobre una limitación conocida de la API
de práctica usada.

**Stack:** React Native · Expo SDK 54 · Axios · TanStack Query v5 · TypeScript

---

## 🎓 Semana 06 — Formularios y Validación (React Hook Form + Zod)

**Objetivo:** formularios de crear/editar curso con validación en
tiempo real — React Hook Form maneja el estado del formulario, Zod
define las reglas de validación, y un componente `FormField`
reutilizable muestra los errores.

**Entidad usada:** `Item` (representa `Course`), sobre la misma API de
la semana 05 — se agrega `EditScreen` (edita un curso existente,
precargado) junto a `CreateScreen`.

**Ruta del proyecto en esta rama:**
```
week-06-formularios_validacion/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta.

**Stack:** React Native · Expo SDK 54 · React Hook Form · Zod · TypeScript

---

## 🎓 Semana 07 — Persistencia Local

**Objetivo:** la app recuerda cosas entre sesiones usando el
almacenamiento correcto para cada dato: **MMKV** para preferencias
(orden, modo compacto, cursos por página), **AsyncStorage** como caché
offline de la lista de cursos, y **Expo SecureStore** para un dato
sensible (PIN de acceso al panel de instructores).

**Entidad usada:** `Item` (representa `Course`), sobre la misma API de
las semanas 05-06, ahora con memoria local.

**Ruta del proyecto en esta rama:**
```
week-07-persistencia_local/3-proyecto/starter/
```

**Cómo ejecutarlo:** ver el `README.md` dentro de esa carpeta — incluye
la guía de estudio sobre cuándo usar cada tipo de almacenamiento, y una
nota sobre el respaldo usado para MMKV al probar en Expo Go.

**Stack:** React Native · Expo SDK 57 · MMKV · AsyncStorage · SecureStore · TypeScript

---

## 🛠️ Sobre este dominio

Cada aprendiz del bootcamp trabaja sobre un dominio único para evitar
copias y fomentar implementaciones originales. El mío es una
**plataforma de cursos online**, con estas entidades:

- **`courses`** — los cursos ofrecidos (usada en la Semana 01)
- **`students`** — estudiantes inscritos
- **`enrollments`** — relación entre estudiantes y cursos
- **`lessons`** — lecciones dentro de cada curso

A medida que avance el bootcamp, cada semana adaptará una parte distinta
del dominio según el tema técnico correspondiente (navegación, formularios,
consumo de APIs, estado global, etc.).