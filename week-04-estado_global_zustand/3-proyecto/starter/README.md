# EduOnline — Proyecto Semana 04 (Estado Global con Zustand)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

App móvil con navegación Tab + Stack (igual que la Semana 03) más un
**carrito de cursos con estado global Zustand**: agregas un curso desde
su detalle, y el badge de la pestaña "Carrito" se actualiza solo, sin
pasar props entre pantallas. Es la entrega de la **Semana 04** del
bootcamp.

---

## 📚 Mi dominio, aplicado a estado global

| Entidad | Qué representa | ¿Usada esta semana? |
|---|---|---|
| `courses` | Los cursos que se ofrecen | ✅ Sí, foco de esta semana |
| `students` | Estudiantes inscritos | No, semanas futuras |
| `enrollments` | Relación estudiante-curso | Inspiró el "carrito" (ver abajo) |
| `lessons` | Lecciones dentro de un curso | No, semanas futuras |

**Cómo mapeé el objetivo de la semana a mi dominio** (store compartido
entre pestañas): la especificación pide un "carrito o guardados" — en
una plataforma de cursos, lo natural es un **carrito de inscripción**:
agregas cursos que quieres tomar antes de "inscribirte" (entidad
`enrollments`). Por eso el store se llama `useCartStore`, no
`useSavedStore` genérico — nombre coherente con el dominio, como pide
la rúbrica.

En el código la interfaz se sigue llamando `Item` (para no romper los
imports de semanas anteriores), pero representa un `Course`.

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                         # NavigationContainer raíz
├── app.json
├── package.json                    # + zustand, sobre la base de la Semana 03
├── tsconfig.json
└── src/
    ├── navigation/
    │   ├── types.ts                 # RootTabParamList, HomeStackParamList
    │   └── RootNavigator.tsx        # Tab + Stack, badge del carrito
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista de cursos
    │   ├── DetailScreen.tsx         # Detalle + botón Agregar/Quitar del carrito
    │   └── CartScreen.tsx           # Pestaña del carrito (lee el store)
    ├── stores/
    │   └── cartStore.ts             # 🆕 Store Zustand del carrito
    ├── data/
    │   └── mockData.ts              # 12 cursos (mismos de semanas anteriores)
    ├── types/
    │   └── index.ts                 # Interfaz Item (Course)
    └── theme/
        └── index.ts                 # COLORS, TYPOGRAPHY, SPACING, RADIUS
```

### `src/stores/cartStore.ts` — el store, pieza nueva de esta semana
```ts
interface CartStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isItemInCart: (id: string) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const alreadyInCart = get().items.some((i) => i.id === item.id);
    if (alreadyInCart) return;
    set((state) => ({ items: [...state.items, item] }));
  },
  // ...removeItem, clearAll, isItemInCart
}));
```
`create<CartStore>()` define el store tipado (sin `any`) — TypeScript
exige que `set` reciba exactamente la forma de `CartStore`. `get()`
deja **leer** el estado actual dentro de una acción, sin depender de
closures viejos — por eso `addItem` usa `get().items` para chequear
duplicados en vez de una variable capturada de afuera.

### `src/navigation/RootNavigator.tsx` — dónde se conecta el badge
```tsx
const cartCount = useCartStore((state) => state.items.length);
// ...
<Tab.Screen
  name="Cart"
  component={CartScreen}
  options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
/>
```
Este componente vive **fuera** de las pantallas Home/Detail/Cart, y
aun así sabe cuántos cursos hay en el carrito — esa es la idea central
de Zustand: cualquier componente que llame a `useCartStore(selector)`
se conecta al mismo estado, sin que nadie tenga que pasárselo por
props.

### `src/screens/DetailScreen.tsx` — agregar/quitar del carrito
Lee `inCart` (calculado directamente del arreglo `items`, ver el bug
real explicado en la sección "🧠 Explicación de código relevante" más
abajo), `addItem` y `removeItem`, y arma el curso completo desde los
params del Stack para poder guardarlo en el store con `addItem(item)`.

### `src/screens/CartScreen.tsx` — la pestaña del carrito
Lee `items`, `removeItem` y `clearAll` del store — sin recibir nada por
props. Además calcula el total a pagar sumando los precios (`reduce`),
un detalle propio del dominio de cursos (no estaba en el starter
genérico).

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. Selector específico vs. traer todo el store

```ts
// ❌ Mal (penalizado por la rúbrica: −5 pts si se hace así)
const store = useCartStore();
const count = store.items.length;

// ✅ Bien — lo que hice
const cartCount = useCartStore((state) => state.items.length);
```

Zustand llama a la función que le pasas (el "selector") cada vez que el
store cambia, y compara el resultado con el anterior. Si pido el store
completo, CUALQUIER cambio (agregar, quitar, lo que sea) dispara un
re-render de mi componente. Si pido solo `state.items.length`, mi
componente solo se re-renderiza cuando ese número específico cambia —
por ejemplo, si en el futuro el store guardara también un `filtro` de
búsqueda, cambiar el filtro NO haría re-renderizar el badge del carrito.

### 2. `set` vs. `get` dentro de una acción

```ts
addItem: (item) => {
  const alreadyInCart = get().items.some((i) => i.id === item.id);
  if (alreadyInCart) return;
  set((state) => ({ items: [...state.items, item] }));
},
```

- **`get()`** lee el estado actual del store en ese instante — lo uso
  para chequear si el curso ya está antes de agregarlo (evita
  duplicados).
- **`set((state) => ...)`** actualiza el estado. Le paso una *función*
  (no un objeto fijo) para tener acceso al `state` más reciente en el
  momento de actualizar — así evito bugs si dos acciones se disparan
  casi al mismo tiempo. `set({ items: [] })` (como en `clearAll`) sí
  puede ser un objeto fijo porque no depende del estado anterior.

### 3. Por qué el store vive fuera de `src/screens/`

Un store Zustand no es un componente ni un hook común — es un objeto
que existe **una sola vez** en toda la app (fuera del árbol de React),
y `useCartStore` es solo la forma de "engancharse" a él desde un
componente. Por eso `RootNavigator`, `DetailScreen` y `CartScreen`
pueden importar el mismo `useCartStore` y ver siempre los mismos datos,
aunque estén en ramas completamente distintas del árbol de navegación
(uno está dentro del Stack de Home, otro es una pestaña aparte).

### 4. `isItemInCart` como *método del store*, no como estado

```ts
isItemInCart: (id) => {
  return get().items.some((i) => i.id === id);
},
```

No guardo un booleano "estáIncluido" en el store — lo **calculo al
vuelo** a partir de `items` cada vez que se llama. Si guardara un
booleano separado, tendría que acordarme de actualizarlo en `addItem` y
`removeItem` también, con riesgo de que se desincronice del arreglo
real. Calculándolo siempre desde `items`, es imposible que quede
desactualizado — el problema (ver el punto 5) es *desde dónde* lo llamo.

### 5. El bug real que encontré probando esto — seleccionar una función NO es reactivo

Mi primer intento en `DetailScreen.tsx` fue este (se ve razonable, pero
tiene un bug):

```ts
// ❌ Así lo escribí primero — compila bien, pero no funciona en pantalla
const isItemInCart = useCartStore((state) => state.isItemInCart);
const inCart = isItemInCart(id);
```

Al probarlo: tocaba "Agregar al carrito", el badge de la pestaña subía
a "1" (¡o sea que el store SÍ se actualizó!), pero el botón se quedaba
diciendo "Agregar al carrito" en vez de cambiar a "En el carrito".

**Por qué pasa esto:** el selector que le paso a `useCartStore` es
`(state) => state.isItemInCart` — eso selecciona la **función**
`isItemInCart`, no un valor derivado de `items`. Esa función es
*siempre la misma referencia* (Zustand no la recrea cuando cambian los
`items`), así que Zustand compara "la función de antes" contra "la
función de ahora", ve que son la misma, y concluye que "no cambió
nada" — y NO vuelve a renderizar el componente. El badge sí se
actualizaba porque ese selector es distinto:
`(state) => state.items.length` — ahí sí selecciono un **número**, que
cambia de verdad cuando agrego un curso.

**El arreglo:**

```ts
// ✅ Correcto — selecciono el booleano calculado, no la función
const inCart = useCartStore((state) => state.items.some((i) => i.id === id));
```

Ahora el selector devuelve `true`/`false` — un valor que sí cambia
cuando `items` cambia, así que React sí vuelve a renderizar el botón
con el texto correcto.

**La regla general para recordar:** un selector de Zustand debe
devolver el *dato* que te interesa mostrar (un número, un booleano, un
arreglo, un objeto), no una función que vas a llamar después dentro del
render. Si necesitas llamar a un método del store con un argumento
dinámico (como `id`), o lo resuelves con un selector que ya incluya ese
cálculo (como hice acá), o lo llamas fuera del render (por ejemplo,
dentro de otra acción del store, usando `get()`, donde sí es seguro).

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### 1. Requisitos previos
- Node.js instalado
- App **Expo Go** en tu celular
- Celular y PC en la **misma red WiFi**

### 2. Instalar dependencias
```bash
cd starter
npm install
```
> ⚠️ Siempre `npm`, nunca `pnpm` (mismo motivo que semanas anteriores:
> `pnpm` falla en Windows con `EINVAL: readlink`).

### 3. Iniciar el proyecto
```bash
npx expo start
```

### 4. Ver la app
- **Celular:** escanea el QR con Expo Go.
- **Web:** presiona `w` en la terminal.

### 5. Probar el carrito
1. En "Cursos", toca un curso disponible → detalle.
2. Toca "＋ Agregar al carrito" → el botón cambia a "✓ En el carrito",
   y el número en la pestaña "Carrito" (abajo) aparece o sube.
3. Cambia a la pestaña "Carrito" → debe verse el curso, con el total al
   final.
4. Vuelve al detalle del mismo curso (sin recargar la app) → el botón
   debe seguir mostrando "✓ En el carrito" (persiste porque es el mismo
   store, no estado local de esa pantalla).
5. Quítalo desde el Carrito (✕) o desde el Detalle → el badge baja o
   desaparece.

---

## 🎨 Decisiones de diseño

1. **`useCartStore` en vez de `useSavedStore`**: nombre específico del
   dominio (carrito de inscripción), no el genérico del starter.
2. **Total del carrito**: el starter no lo pedía; lo agregué porque es
   el detalle más natural de un carrito de cursos (cuánto vas a pagar).
3. **Botón deshabilitado si el curso no está disponible**: un curso sin
   cupos (`available: false`) no se puede agregar al carrito — el botón
   se atenúa y dice "No disponible".
4. **Sin `persist` middleware**: la especificación del proyecto no lo
   pide (solo el ejercicio de práctica en clase lo usa) — el carrito
   vive solo en memoria mientras la app está abierta.
5. **Tema y estructura compartidos con semanas 02-03**: mismos
   `COLORS`/`TYPOGRAPHY`/`SPACING`/`RADIUS`, mismo patrón de Stack
   anidado en Tab, para mantener consistencia en todo el trimestre.

---

## 📱 Capturas de pantalla

_(Agregar aquí 3 capturas: 1) lista de cursos, 2) detalle con el botón
de carrito activado, 3) pestaña Carrito con el total)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| Tab Navigator funcional (2 pestañas: Cursos + Carrito) | 5 | ✅ |
| Store creado con `create<CartStore>()` y tipos correctos | 5 | ✅ |
| Al menos 2 acciones en el store (agregar, eliminar, vaciar) | 5 | ✅ (3: `addItem`, `removeItem`, `clearAll`) |
| Componente consumiendo el store con selector (sin `any`) | 5 | ✅ |
| Badge en tab bar refleja conteo en tiempo real | 5 | ✅ |
| App funcional en simulador, sin errores TypeScript | 5 | ⏳ (probar antes de entregar) |

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-04` (creada desde
   `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 04 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
