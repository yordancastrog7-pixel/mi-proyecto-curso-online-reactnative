# EduOnline — Proyecto Semana 03 (React Navigation)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

App móvil con **navegación completa** construida con React Navigation 7:
un Tab Navigator con 2 pestañas (Cursos / Favoritos), y dentro de la
pestaña "Cursos" un Stack Navigator anidado para ir de la lista al
detalle de un curso, con parámetros tipados. Es la entrega de la
**Semana 03** del bootcamp.

---

## 📚 Mi dominio, aplicado a navegación

| Entidad | Qué representa | ¿Usada esta semana? |
|---|---|---|
| `courses` | Los cursos que se ofrecen | ✅ Sí, foco de esta semana |
| `students` | Estudiantes inscritos | No, semanas futuras |
| `enrollments` | Relación estudiante-curso | No, semanas futuras |
| `lessons` | Lecciones dentro de un curso | No, semanas futuras |

**Cómo mapeé el objetivo de la semana a mi dominio** (navegación
Tab + Stack con lista → detalle):

- **Pantalla lista (Home / `HomeList`)**: catálogo de cursos (`FlatList`,
  reutiliza los mismos 12 cursos de la Semana 02).
- **Pantalla detalle (`HomeDetail`)**: ficha del curso — instructor,
  precio, duración, nivel y disponibilidad.
- **Pestaña Favoritos**: 3 cursos guardados como favoritos (estáticos).

En el código la interfaz se sigue llamando `Item` (así vino en el
starter del profesor, para no romper los imports), pero representa un
`Course`.

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                         # NavigationContainer raíz
├── app.json                        # Config de Expo
├── package.json                    # Dependencias (React Navigation 7 + Expo 54)
├── tsconfig.json
└── src/
    ├── navigation/
    │   ├── types.ts                 # RootTabParamList, HomeStackParamList
    │   └── RootNavigator.tsx        # Tab Navigator + Stack anidado
    ├── screens/
    │   ├── HomeScreen.tsx           # Lista de cursos (FlatList)
    │   ├── DetailScreen.tsx         # Detalle — lee params del Stack
    │   └── FavoritesScreen.tsx      # Segunda pestaña
    ├── data/
    │   └── mockData.ts              # 12 cursos + 3 favoritos
    ├── types/
    │   └── index.ts                 # Interfaz Item (Course) + CourseCategory/Level
    └── theme/
        └── index.ts                 # COLORS, TYPOGRAPHY, SPACING, RADIUS
```

### `src/navigation/types.ts` — el "contrato" de la navegación
Define qué pantallas existen y qué parámetros recibe cada una:
- `RootTabParamList`: las 2 pestañas (`Home`, `Favorites`), ninguna
  recibe params (`undefined`).
- `HomeStackParamList`: las 2 pantallas del stack interno. `HomeDetail`
  exige `id`, `name`, `instructor`, `price`, `category`, `duration`,
  `level` y `available` — si en `HomeScreen` me olvido de pasar alguno,
  TypeScript no compila. Esto es lo que la rúbrica pide como "params
  tipados con RootParamList".

### `src/navigation/RootNavigator.tsx` — la estructura de navegación
Aquí se arma todo:
1. **`HomeStack`** (`createNativeStackNavigator`): controla
   `HomeList` → `HomeDetail`. El título de `HomeDetail` se lee
   dinámicamente del nombre del curso (`route.params.name`), así el
   header siempre dice el nombre del curso que estás viendo.
2. **`Tab`** (`createBottomTabNavigator`): la pestaña "Cursos" usa el
   `HomeStack` completo (lista + detalle comparten la misma pestaña,
   sin perder la barra inferior). La pestaña "Favoritos" va directo a
   `FavoritesScreen`, sin Stack.
3. **`tabBarIcon`**: función que cambia el ícono de Ionicons según la
   pestaña y si está activa (`school`/`school-outline` para Cursos,
   `heart`/`heart-outline` para Favoritos).
4. **`tabBarActiveTintColor: '#61DAFB'`**: color exacto pedido por la
   rúbrica para la pestaña activa (independiente del azul de acento
   que uso en el resto de la app).

### `src/screens/HomeScreen.tsx` — la lista
`FlatList` de los 12 cursos. Al presionar una tarjeta,
`navigation.navigate('HomeDetail', {...})` pasa **todos** los campos
del curso como params — así `DetailScreen` no tiene que volver a buscar
el curso en `mockData.ts`, solo lee lo que llegó por params.

### `src/screens/DetailScreen.tsx` — el detalle
Usa `useRoute<DetailScreenRouteProp>()` para leer los params tipados.
Muestra el nombre, categoría (badge), instructor, precio, duración,
nivel y disponibilidad — si el curso no tiene cupos, el campo se
resalta en rojo.

### `src/screens/FavoritesScreen.tsx` — la segunda pestaña
`FlatList` sobre `FAVORITES` (3 cursos fijos definidos en
`mockData.ts`), con un ícono de corazón y datos resumidos.

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

Notas para releer en un mes, cuando ya no recuerde por qué escribí esto
así. Cada bloque es código real del proyecto + la razón detrás.

### 1. `App.tsx` — por qué van 3 componentes envolviendo todo

```tsx
<SafeAreaProvider>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
  <StatusBar style="light" />
</SafeAreaProvider>
```

- **`SafeAreaProvider`** (afuera de todo): calcula cuánto espacio ocupan
  el notch, la isla dinámica o la barra de estado del celular, para que
  ningún contenido quede tapado. Tiene que envolver TODA la app, por
  eso va en el nivel más externo.
- **`NavigationContainer`**: es el "cerebro" que guarda en memoria en
  qué pantalla estás y tu historial de navegación (para que el botón
  de volver funcione). Sin esto, ningún navigator de React Navigation
  funciona — es obligatorio y va uno solo por app.
- **`RootNavigator`**: mi propio componente (en
  `src/navigation/RootNavigator.tsx`) con la estructura real de Tabs +
  Stack. Lo separé de `App.tsx` para que este último quede simple y
  fácil de leer.

### 2. `src/navigation/types.ts` — por qué tipar la navegación

```ts
export type HomeStackParamList = {
  HomeList: undefined;
  HomeDetail: { id: string; name: string; instructor: string; /* ... */ };
};
```

Esto es un **mapa** de "qué pantallas existen" y "qué le tienes que
pasar a cada una". `HomeList: undefined` significa "esta pantalla no
recibe parámetros". `HomeDetail: {...}` dice exactamente qué campos
son obligatorios. Gracias a esto:
- Si escribo `navigation.navigate('HomeDetail')` sin pasar `name`,
  TypeScript marca error ANTES de correr la app.
- Si en `DetailScreen` escribo `route.params.precio` (mal escrito, con
  tilde y en español), TypeScript también lo marca — porque el tipo
  real es `price`.

Es el mismo principio de `interface Item` en `types/index.ts` (semanas
1 y 2), pero aplicado a "qué datos viajan entre pantallas" en vez de
"qué forma tiene un curso".

### 3. Dos tipos de navigator, dos trabajos distintos

- **`createNativeStackNavigator`** (`HomeStack`): apila pantallas una
  encima de otra, como una pila de cartas. Al navegar hacia adelante
  agrega una pantalla arriba; `goBack()` la quita. Usa las transiciones
  y gestos **nativos** del sistema operativo (deslizar para volver en
  iOS, por ejemplo) — por eso no hace falta importar
  `react-native-gesture-handler` a mano, como sí se necesitaba en
  versiones antiguas de React Navigation con el stack basado en JS.
- **`createBottomTabNavigator`** (`Tab`): muestra una barra fija abajo
  con botones; cada botón lleva a una pantalla (o a otro navigator)
  distinta, y **no** se apilan — cambiar de tab no cuenta como "ir
  hacia adelante" en el historial.

### 4. Por qué el Stack va *dentro* del Tab (navegación anidada)

```
Tab.Navigator
 ├── Home  → HomeStack.Navigator (HomeList → HomeDetail)
 └── Favorites → FavoritesScreen
```

Si el Stack no estuviera anidado dentro del Tab, y en vez de eso todo
viviera en un solo navigator plano, pasaría esto: al abrir el detalle
de un curso, la app tendría que "salir" de la pestaña Cursos para
mostrarlo, y la barra inferior con las pestañas probablemente
desaparecería o perdería su estado. Anidando el Stack **dentro** de la
tab "Home", cada pestaña mantiene su **propio historial independiente**
— puedo estar en el detalle de un curso, cambiar a Favoritos, volver a
Cursos, y sigo viendo el mismo curso abierto, con la tab bar siempre
visible. (Esta es literalmente la pregunta teórica 3 de la rúbrica —
quedó respondida en código, no solo en teoría.)

### 5. `useNavigation<T>()` y `useRoute<T>()` — los dos lados de pasar datos

**Lado que envía** (`HomeScreen.tsx`):
```tsx
type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeList'>;
const navigation = useNavigation<HomeScreenNavigationProp>();
navigation.navigate('HomeDetail', { id: item.id, name: item.name, /* ...resto */ });
```

**Lado que recibe** (`DetailScreen.tsx`):
```tsx
type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'HomeDetail'>;
const route = useRoute<DetailScreenRouteProp>();
const { name, instructor, price } = route.params;
```
(`RouteProp` viene de `@react-navigation/native` — es genérico para
cualquier navigator, a diferencia de `NativeStackNavigationProp` que sí
es específico del Stack nativo.)

El patrón es siempre el mismo: le paso a `useNavigation` o `useRoute` un
**tipo genérico** (`<...>`) que apunta a la entrada correcta de
`HomeStackParamList`. Eso es lo que le da a VS Code el autocompletado
de `route.params.` — sin el genérico, `params` sería de tipo `any` y
perderíamos toda la seguridad de tipos (justo lo que penaliza la
rúbrica con −5 pts).

### 6. `tabBarIcon` — una función, no una imagen fija

```tsx
tabBarIcon: ({ focused, color, size }) => {
  const iconName = route.name === 'Home'
    ? (focused ? 'school' : 'school-outline')
    : (focused ? 'heart' : 'heart-outline');
  return <Ionicons name={iconName} size={size} color={color} />;
},
```

React Navigation no te deja poner un ícono fijo — te pide una
**función** que él mismo llama por cada pestaña, pasándole si está
activa (`focused`), el color que le corresponde y el tamaño. Por eso el
ícono "se rellena" (`school` vs `school-outline`) cuando tocas esa
pestaña: es la misma función devolviendo un ícono distinto según
`focused`.

### 7. Título dinámico en el header

```tsx
<HomeStack.Screen
  name="HomeDetail"
  component={DetailScreen}
  options={({ route }) => ({ title: route.params.name })}
/>
```

`options` también puede ser una función (en vez de un objeto fijo) que
recibe la misma `route` con los params. Así el header del detalle
siempre muestra el nombre del curso que estás viendo, sin tener que
repetirlo manualmente dentro de `DetailScreen`.

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### 1. Requisitos previos
- Node.js instalado
- App **Expo Go** en tu celular
- Celular y PC en la **misma red WiFi**

### 2. Instalar dependencias
Terminal dentro de `starter` (donde está `package.json`):
```bash
npm install
```
> ⚠️ Siempre `npm`, nunca `pnpm` — en Windows `pnpm` genera symlinks que
> fallan con `EINVAL: readlink` (mismo problema documentado en la
> Semana 01).

### 3. Iniciar el proyecto
```bash
npx expo start
```
Si el puerto 8081 está ocupado, acepta usar el 8082 (`y`).

### 4. Ver la app
- **Celular:** escanea el QR con Expo Go.
- **Web:** presiona `w` en la terminal.

### 5. Probar la navegación
1. En la pestaña "Cursos", toca cualquier tarjeta → debe abrir el
   detalle con el nombre del curso en el header.
2. Presiona el botón de volver (‹) → debe regresar a la lista sin
   perder la posición del scroll.
3. Cambia a la pestaña "Favoritos" → deben verse 3 cursos guardados.

---

## 🐛 Notas técnicas de esta semana

1. **Versiones de React Navigation fijadas a Expo SDK 54.** El starter
   original del profesor traía Expo `57.0.4` (mismo desfase que en
   semanas anteriores). Se fijaron las versiones de
   `@react-navigation/*`, `react-native-screens`,
   `react-native-safe-area-context` y `react-native-gesture-handler`
   a las que Expo reporta como compatibles con el SDK 54 (con
   `npx expo install`), para evitar errores de versión al abrir la app
   en Expo Go.

2. **`main` del `package.json`.** El starter traía
   `"main": "expo-router/entry"` (piensa en rutas basadas en archivos),
   pero este proyecto **no usa `expo-router`** — la navegación se arma
   a mano con `NavigationContainer` en `App.tsx`, como pide la
   especificación. Se cambió a
   `"main": "node_modules/expo/AppEntry.js"` (mismo fix que en semanas
   anteriores) para que Expo registre `App.tsx` correctamente.

3. **`react-native-gesture-handler` sin importar manualmente.** No fue
   necesario agregar el `import 'react-native-gesture-handler'` al
   inicio de `App.tsx` (común en guías antiguas) porque
   `createNativeStackNavigator` usa el navigator nativo de cada
   plataforma, no el basado en JS que sí lo necesita.

---

## 🎨 Decisiones de diseño

1. **Params completos en vez de solo `id`**: se pasa el curso entero
   como params al detalle (no solo `id` + `name`) para evitar una
   búsqueda adicional en `mockData.ts` — más simple para un catálogo
   pequeño como este.
2. **Ícono por dominio**: se usó `school`/`school-outline` en vez del
   genérico `home`/`home-outline` del starter, porque representa mejor
   una plataforma de cursos.
3. **Header dinámico en el detalle**: el título del header cambia según
   el curso (`route.params.name`), en vez de un texto fijo "Detalle".
4. **Tema compartido con semanas anteriores**: mismos `COLORS`,
   `TYPOGRAPHY`, `SPACING` y `RADIUS` de la Semana 02, para mantener
   identidad visual consistente en todo el trimestre.
5. **`tabBarActiveTintColor` fijo en `#61DAFB`**: valor exacto pedido
   por la rúbrica, aplicado solo a la tab bar (el resto de la UI sigue
   usando el azul de acento `#58a6ff` del tema).

---

## 📱 Capturas de pantalla

_(Agregar aquí 3 capturas: 1) lista de cursos, 2) detalle de un curso,
3) pestaña de favoritos)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| Tab Navigator con 2+ tabs adaptadas al dominio | 6 | ✅ |
| Stack Navigator anidado con pantalla de detalle | 6 | ✅ |
| Params tipados con `RootParamList` en TypeScript | 5 | ✅ |
| Header de cada pantalla con título descriptivo del dominio | 4 | ✅ |
| `NavigationContainer` correctamente configurado | 4 | ✅ |
| App funcional en simulador iOS y/o Android | 3 | ⏳ (probar antes de entregar) |
| TypeScript sin `any` | 2 | ✅ |

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-03` (creada desde
   `main`, no desde `week-02`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 03 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
