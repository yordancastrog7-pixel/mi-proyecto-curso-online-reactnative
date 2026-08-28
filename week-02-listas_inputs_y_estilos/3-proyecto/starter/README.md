# EduOnline — Proyecto Semana 02 (Listas con Búsqueda)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

App móvil que muestra un **catálogo de cursos con búsqueda en tiempo
real**, construida con `FlatList`, `TextInput` y un sistema de theming
centralizado. Es la entrega de la **Semana 02** del bootcamp.

---

## 📚 Mi dominio, explicado paso a paso

Mi dominio asignado es una **plataforma de cursos online** (piensa en
algo como Platzi o Coursera, a menor escala). Tiene 4 entidades
principales, pero cada semana del bootcamp trabajamos sobre una parte
distinta:

| Entidad | Qué representa | ¿Usada esta semana? |
|---|---|---|
| `courses` | Los cursos que se ofrecen (nombre, precio, instructor...) | ✅ Sí, es el foco de esta semana |
| `students` | Los estudiantes que se inscriben | No, se usará en semanas futuras |
| `enrollments` | La relación entre un estudiante y un curso al que se inscribió | No, se usará en semanas futuras |
| `lessons` | Las lecciones dentro de cada curso | No, se usará en semanas futuras |

**¿Por qué `courses` esta semana?** Porque el objetivo de la Semana 02
es practicar **listas largas + búsqueda** (`FlatList` + `TextInput`), y
un catálogo de cursos es el ejemplo más natural de "lista larga que el
usuario querrá filtrar" dentro de mi dominio.

En el código, la interfaz se llama `Item` (así vino en el starter del
profesor, para no romper las importaciones), pero representa un
`Course`:

```typescript
export interface Item {
  id: string;
  name: string;          // nombre del curso
  instructor: string;    // quién lo dicta
  price: number;         // precio en COP
  category: CourseCategory; // Programación, Diseño, Backend, etc.
  duration: string;      // ej: "8 semanas"
  level: CourseLevel;    // Básico | Intermedio | Avanzado
  available: boolean;    // si tiene cupos abiertos
}
```

---

## 🗂️ Estructura del proyecto, explicada archivo por archivo

```
starter/
├── App.tsx                    # Arranca la app, renderiza HomeScreen
├── app.json                   # Config de Expo (nombre, sdkVersion...)
├── package.json                # Dependencias
├── tsconfig.json               # Config de TypeScript
└── src/
    ├── theme/
    │   └── index.ts            # 🆕 Constantes visuales (colores, fuentes, espaciado)
    ├── types/
    │   └── index.ts            # Interfaz Item + tipos auxiliares (CourseCategory, CourseLevel)
    ├── data/
    │   └── mockData.ts         # 12 cursos de ejemplo
    ├── components/
    │   └── ItemCard.tsx        # Tarjeta de un curso
    └── screens/
        └── HomeScreen.tsx      # FlatList + búsqueda + estado vacío
```

### `src/theme/index.ts` — el "diccionario visual" de la app
Define 4 grupos de constantes:
- **`COLORS`**: fondos, bordes, texto y un color de "acento" (azul,
  `#58a6ff`) que se repite en precios y badges.
- **`TYPOGRAPHY`**: tamaños de letra (`xs` a `xxl`) y pesos (`regular`
  a `bold`).
- **`SPACING`**: espaciados consistentes (4px, 8px, 12px...) para
  paddings y márgenes.
- **`RADIUS`**: qué tan redondeadas son las esquinas de tarjetas y
  badges.

**¿Por qué esto importa?** En vez de escribir `color: '#58a6ff'` en 10
archivos distintos, todos importan `COLORS.accent` desde un solo lugar.
Si mañana quiero cambiar el color de la app entera, edito **una sola
línea**.

### `src/types/index.ts` — el "molde" de un curso
TypeScript usa esto para saber qué forma tiene cada curso, y avisarte
en rojo si te equivocas de campo (ej: si escribes `item.precio` en vez
de `item.price`, TypeScript no compila). También define
`CourseCategory` y `CourseLevel` como *union types* (listas cerradas de
valores válidos) — esto es lo que exige el requisito de "TypeScript
estricto, sin `any`".

### `src/data/mockData.ts` — los datos de prueba
12 cursos "hardcodeados" (escritos directamente en el código, sin
backend real) que simulan lo que en el futuro vendría de una API. Sirve
para poder probar la búsqueda con datos variados y reales.

### `src/components/ItemCard.tsx` — la tarjeta visual
Recibe **un** curso (`item`) y lo dibuja: nombre + precio arriba,
instructor y duración/nivel en medio, categoría y disponibilidad abajo
en forma de "badges" (etiquetas redondeadas). Usa `Pressable` para dar
feedback visual (cambia de color) cuando lo tocas.

### `src/screens/HomeScreen.tsx` — el cerebro de la pantalla
Aquí pasa la magia de esta semana:
1. **`useState`** guarda lo que el usuario escribe en el buscador
   (`query`).
2. **`useMemo`** recalcula la lista filtrada *solo* cuando `query`
   cambia (no en cada render de la pantalla) — esto es una
   optimización de rendimiento.
3. **`useCallback`** envuelve las funciones `renderItem` y
   `renderEmpty` para que `FlatList` no las recree innecesariamente en
   cada render.
4. **`FlatList`** dibuja la lista de forma eficiente (solo renderiza lo
   que se ve en pantalla, no los 12 items de una vez si no caben).
5. **`KeyboardAvoidingView`** + **`TouchableWithoutFeedback`** evitan
   que el teclado tape el input, y permiten cerrar el teclado tocando
   fuera de él.

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
> ⚠️ Siempre `npm`, nunca `pnpm` (ver la razón detallada en el README
> de la Semana 01, en la raíz del repo).

### 3. Verificar el SDK antes de arrancar
```bash
npx expo config --type public
```
Confirma que diga `sdkVersion: '54.0.0'` (compatible con Expo Go).

### 4. Iniciar el proyecto
```bash
npx expo start
```
Si el puerto 8081 está ocupado, acepta usar el 8082 (`y`).

### 5. Ver la app
- **Celular:** escanea el QR con Expo Go.
- **Web:** presiona `w` en la terminal, o ve a `http://localhost:8081`.

### 6. Probar la búsqueda
Escribe en el campo "Buscar curso...":
- `"react"` → debería mostrar solo "React Native desde Cero"
- `"sql"` → debería mostrar "Bases de Datos con SQL"
- `"xyz"` → debería mostrar el mensaje de "Sin resultados"

---

## 🐛 Problemas de esta semana y su solución

1. **`ERROR [Invariant Violation: "main" has not been registered...]`**
   Causa: el `package.json` del starter traía `"main": "App.tsx"`, que
   no registra la app correctamente con Expo.
   Solución: cambiar a `"main": "node_modules/expo/AppEntry.js"`.

2. **`It looks like you're trying to use web support but don't have the required dependencies`**
   Causa: faltaban `react-dom` y `react-native-web` para el modo web.
   Solución:
   ```bash
   npx expo install react-dom react-native-web
   ```

3. **Expo SDK 57 en vez de 54**
   Mismo problema que la Semana 01: el `package.json` del starter
   traía Expo `57.0.4`. Se corrigió desde el inicio dejando
   `"expo": "~54.0.36"` y las versiones compatibles de `react` /
   `react-native` directamente en el `package.json`, sin tener que
   hacer el downgrade después.

---

## 🎨 Decisiones de diseño

1. **Theming centralizado**: toda la paleta y tipografía vive en
   `src/theme/index.ts`. Se eligió una paleta oscura consistente con la
   Semana 01, con azul (`#58a6ff`) como color de acento (precios y
   badges de categoría).

2. **Más de 3 campos por tarjeta**: cada `ItemCard` muestra 6 campos
   (nombre, precio, instructor, duración, nivel, categoría) más un
   badge condicional de "No disponible", superando el mínimo pedido.

3. **Filtrado con `useMemo`**: evita recomputar el filtro en cada
   render de la pantalla, solo cuando cambia el texto buscado.

4. **`useCallback` en `renderItem`/`renderEmpty`**: reduce renders
   innecesarios de `FlatList`.

5. **Estado vacío personalizado**: muestra el término buscado
   (`Sin resultados para "xyz"`) en vez de dejar la pantalla en blanco.

6. **`KeyboardAvoidingView` + cierre de teclado al tocar fuera**: mejor
   experiencia de uso en móvil al buscar.

7. **12 cursos variados en `mockData.ts`** (mínimo pedido: 10): con
   distintas categorías y niveles para que la búsqueda tenga sentido
   real al probarla.

---

## 📱 Capturas de pantalla

_(Agregar aquí 2 capturas: 1) la lista completa de cursos, 2) la
búsqueda filtrando resultados, ej. escribiendo "sql" o "react")_

---

## ✅ Checklist de requisitos (rúbrica del profesor Erick — 30 pts)

| Criterio | Cumplido |
|---|---|
| `FlatList` con `keyExtractor` por ID (5 pts) | ✅ |
| `TextInput` con búsqueda funcional (5 pts) | ✅ |
| `useMemo` para filtrado (5 pts) | ✅ |
| `ItemCard` con 3+ campos (5 pts) | ✅ (tiene 6) |
| Estado vacío personalizado (3 pts) | ✅ |
| `KeyboardAvoidingView` correcto (3 pts) | ✅ |
| Constantes de tema (2 pts) | ✅ |
| TypeScript sin `any` (2 pts) | ✅ |

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-02`.
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 02 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
