# EduOnline — Proyecto Semana 05 (Networking con TanStack Query)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

A diferencia de las semanas 2-4 (datos falsos escritos a mano en
`mockData.ts`), esta app pide los cursos a una **API real por
internet**, usando Axios + TanStack Query v5: lista con estados de
carga/error/vacío, pull-to-refresh, pantalla de detalle, y un
formulario para crear cursos nuevos.

---

## 🌐 Sobre la API que usé

La especificación de esta semana sugiere, para quien no tiene backend
propio, usar **[JSONPlaceholder](https://jsonplaceholder.typicode.com/)**
con `/posts` "como proxy". La usé así: cada `post` de esa API
(`{ id, userId, title, body }`) se muestra en la app como si fuera un
curso, y el `instructor` se calcula a partir de `userId` (ver
`src/hooks/useItems.ts`, con los mismos nombres de instructores de las
semanas 2-4).

**Sobre el idioma:** `title`/`body` en JSONPlaceholder son texto latín
de relleno ("lorem ipsum", sin significado real — no es que esté en
otro idioma, es texto generado al azar). Para que la app se vea
coherente con el dominio, reemplazo ese texto por un nombre y
descripción reales en español, mapeados por `id` en `COURSE_CONTENT_ES`
(`useItems.ts`) — la petición HTTP sigue siendo 100% real (loading,
error, `id`, `userId` vienen todos de la API), solo cambio qué texto
muestro para esos 2 campos. Como `_limit=15` siempre devuelve los
mismos 15 posts (datos estáticos de JSONPlaceholder), el mapeo por id
es estable.

**Limitación conocida de esta API (no es un bug de mi código):**
JSONPlaceholder **simula** las escrituras — cuando el formulario hace
`POST /posts`, la API responde `201 Created` con un curso "nuevo"
(`id: 101`, con los datos que mandé), pero **no lo guarda realmente**.
Por eso, cuando vuelvo a la lista después de crear un curso, la lista
sigue mostrando los mismos posts de siempre — el nuevo no aparece. Esto
es un comportamiento documentado de JSONPlaceholder (pensada solo para
practicar la forma de las peticiones), no un error en
`useCreateItem`/`invalidateQueries`. Lo dejo anotado acá para no
confundirlo con un bug al revisar el código en el futuro.

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                         # QueryClientProvider + NavigationContainer
├── app.json
├── package.json                    # + axios, @tanstack/react-query
├── tsconfig.json
└── src/
    ├── services/
    │   └── api.ts                   # Instancia Axios con baseURL fija
    ├── hooks/
    │   └── useItems.ts              # useItems, useItemById, useCreateItem
    ├── navigation/
    │   ├── types.ts                 # RootStackParamList
    │   └── RootNavigator.tsx        # Stack: Home → Detail, Create (modal)
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista + loading/error/empty + refresh
    │   ├── DetailScreen.tsx         # Detalle (vuelve a pedir el curso solo)
    │   └── CreateScreen.tsx         # Formulario + useMutation
    ├── types/
    │   └── index.ts                 # Item, CreateItemPayload
    └── theme/
        └── index.ts                 # COLORS, TYPOGRAPHY, SPACING, RADIUS
```

### `src/services/api.ts` — el cliente HTTP centralizado
Una sola instancia de Axios con `baseURL` fija. Sin esto, cada hook
tendría que escribir la URL completa (`https://jsonplaceholder...`) en
cada llamada — con la instancia, solo escriben la ruta (`/posts`).

### `src/hooks/useItems.ts` — donde vive todo TanStack Query
Tres hooks, cada uno envolviendo una operación de red distinta:
- **`useItems()`** — `useQuery` que trae la lista completa.
- **`useItemById(id)`** — `useQuery` para un curso individual (usado en
  `DetailScreen`; tiene su propia `queryKey` para cachearse aparte).
- **`useCreateItem()`** — `useMutation` que hace el `POST` y, en
  `onSuccess`, invalida la query de la lista.

También vive acá el **mapeo** de "post genérico" a "curso" — así
`HomeScreen` y `DetailScreen` nunca tienen que saber que la data viene
de una API que en realidad no es de cursos.

### `src/screens/HomeScreen.tsx` — los 4 estados de red
Desestructura `{ data, isLoading, isError, isFetching, error, refetch }`
de `useItems()` y renderiza una pantalla distinta según el estado —
ver la sección de abajo para el detalle de cada uno.

### `src/screens/CreateScreen.tsx` — el formulario
Dos campos (nombre, descripción) y un botón que llama a
`createItem(...)` del hook `useCreateItem()`. El botón se deshabilita
mientras `isPending` (evita doble-envío), y al tener éxito vuelve a
`Home` con `navigation.goBack()`.

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. Los 4 estados de una `useQuery`, en orden

```tsx
const { data, isLoading, isError, isFetching, error, refetch } = useItems();

if (isLoading) { /* primera carga, sin datos aún */ }
if (isError)   { /* la petición falló */ }
// si llegamos aquí: data existe (puede ser un array vacío)
```

- **`isLoading`**: `true` solo en la PRIMERA carga (cuando todavía no
  hay ningún dato en caché). Es el único momento en que tiene sentido
  bloquear toda la pantalla con un spinner grande.
- **`isFetching`**: `true` cada vez que hay una petición en curso —
  incluida la primera carga Y cada refetch posterior (por ejemplo, al
  hacer pull-to-refresh). Por eso el `FlatList` usa
  `refreshing={isFetching && !isLoading}`: así el ícono de "refrescando"
  solo aparece en los refetch manuales, no también durante la carga
  inicial (que ya tiene su propio spinner de pantalla completa).
- **`isError`** / **`error`**: la petición terminó en error (después de
  los reintentos automáticos configurados en `App.tsx`, `retry: 2`).
  `error` trae el mensaje real de Axios.
- **`refetch()`**: vuelve a pedir los datos manualmente — lo uso tanto
  en el botón "Reintentar" como en el `onRefresh` del `FlatList`.

### 2. Por qué `queryKey` es un arreglo, no un string

```ts
export const ITEMS_QUERY_KEY = ['courses'] as const;
// ...
queryKey: [...ITEMS_QUERY_KEY, id],  // en useItemById
```

TanStack Query usa la `queryKey` como identificador único de CADA
consulta en caché — dos queries con la misma key comparten el mismo
caché; con keys distintas, viven separadas. Uso un arreglo (no un
string) porque permite tener **keys jerárquicas**: `['courses']` para
la lista completa, y `['courses', 5]` para el curso con id 5 —
ambas queries conviven en caché sin pisarse, y como
`['courses', 5]` "contiene" a `['courses']`, TanStack Query puede
invalidar ambas con solo `invalidateQueries({ queryKey: ['courses'] })`.

### 3. `invalidateQueries` — qué hace exactamente

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
},
```

`invalidateQueries` **no** actualiza el caché a mano — lo marca como
"stale" (viejo/desactualizado) y, si hay algún componente en pantalla
usando esa `queryKey` en ese momento (como `HomeScreen` con
`useItems()`), dispara un refetch automático. Por eso, después de crear
un curso, no necesito hacer nada manual para que la lista se actualice
— React Query se encarga solo. La alternativa sería `setQueryData`
(actualización optimista: edito el caché directamente sin volver a
pedir nada a la API) — más rápida de percibir, pero más código y más
riesgo de que el caché quede desincronizado del servidor real.

### 4. Por qué `DetailScreen` vuelve a pedir el curso (no reutiliza el de la lista)

```tsx
const { id } = route.params; // solo id (y name, para el título del header)
const { data: item } = useItemById(id);
```

Podría haber pasado el curso completo por params (como hice en las
semanas 3 y 4) y ahorrarme una petición. No lo hice a propósito: en una
app que consume una API real, el dato de la lista puede estar
desactualizado (otro usuario lo editó, etc.), así que `DetailScreen`
pide su propio dato fresco. Además, así la pantalla funciona igual si
se abriera directo por un link profundo (deep link) sin pasar antes por
`HomeScreen`.

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### 1. Requisitos previos
- Node.js instalado
- App **Expo Go** en tu celular
- Celular y PC en la **misma red WiFi**
- **Conexión a internet** (esta semana la app depende de una API real —
  sin internet, vas a ver la pantalla de error todo el tiempo, y eso es
  lo correcto)

### 2. Instalar dependencias
```bash
cd starter
npm install
```
> ⚠️ Siempre `npm`, nunca `pnpm` (mismo motivo de siempre: `pnpm` falla
> en Windows con `EINVAL: readlink`).

### 3. Iniciar el proyecto
```bash
npx expo start
```

### 4. Ver la app
- **Celular:** escanea el QR con Expo Go.
- **Web:** presiona `w` en la terminal.

### 5. Probar el flujo completo
1. Al abrir, deberías ver el spinner de carga un instante y luego la
   lista de 15 cursos.
2. Desliza hacia abajo sobre la lista → pull-to-refresh (vuelve a pedir
   los datos).
3. Toca un curso → detalle con instructor y descripción.
4. Vuelve, toca el "+" del header → formulario → escribe un nombre →
   "Crear curso" → deberías volver a Home automáticamente (recuerda: el
   curso nuevo no va a aparecer en la lista, ver la sección de arriba
   sobre la limitación de JSONPlaceholder).
5. Para ver el estado de error: apaga el WiFi del celular y desliza para
   refrescar → debería aparecer el mensaje de error con "Reintentar".

---

## 🎨 Decisiones de diseño

1. **Mapeo API → dominio centralizado en el hook**: `HomeScreen` y
   `DetailScreen` solo conocen la forma `Item` (curso) — nunca ven la
   forma real de un "post" de JSONPlaceholder. Si el día de mañana
   cambio de API, solo edito `mapPostToItem` en un lugar.
2. **`instructor` derivado de `userId`**: en vez de mostrar un
   `userId` numérico sin sentido, lo traduzco a uno de los nombres de
   instructores ya usados en semanas anteriores — mantiene la
   coherencia del catálogo de cursos en todo el trimestre.
3. **`name`/`description` en español, no el texto latín de la API**:
   JSONPlaceholder devuelve "lorem ipsum" sin sentido en `title`/`body`
   — lo reemplazo por contenido real en español (`COURSE_CONTENT_ES`,
   mapeado por `id`) para que la app sea presentable, sin dejar de
   hacer la petición real a la API.
3. **Sin `useDeleteItem`**: la especificación de esta semana no pide
   eliminar, solo listar/ver detalle/crear — no agregué funcionalidad
   que no se pidió.
4. **Tema compartido con semanas 02-04**: mismos
   `COLORS`/`TYPOGRAPHY`/`SPACING`/`RADIUS` de siempre.
5. **`DetailScreen` no usa params para los datos** (solo para el
   título del header) — pide su propio dato fresco con `useItemById`,
   como se explica en el punto 4 de la guía de estudio arriba.

---

## 📱 Capturas de pantalla

_(Agregar aquí 4 capturas: 1) lista cargando, 2) lista con datos,
3) detalle de un curso, 4) formulario de creación)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| `QueryClientProvider` envuelve la app en `App.tsx` | 3 | ✅ |
| Instancia Axios en `src/services/api.ts` con `baseURL` | 4 | ✅ |
| `useQuery` obtiene lista de cursos con `queryKey` semántico (`['courses']`) | 6 | ✅ |
| `useMutation` crea un curso y `onSuccess` invalida la query | 7 | ✅ |
| Estados loading, error y vacío (`ListEmptyComponent`) implementados | 5 | ✅ |
| Pull-to-refresh funcional con `refetch` en `onRefresh` | 5 | ✅ |

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-05` (creada desde
   `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 05 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
