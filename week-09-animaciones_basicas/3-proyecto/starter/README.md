# EduOnline — Proyecto Semana 09 (Animaciones Básicas)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidades usadas esta semana:** `enrollments` (mis cursos inscritos), `courses` y `lessons` (progreso = lecciones completadas)

---

## 🎯 Qué es este proyecto

La pantalla **"Mis cursos"** de un estudiante, con las 5 animaciones que
pide la semana, cada una con un motivo en el dominio (que ayude a
entender lo que pasa, no que solo "se mueva"):

| # | Animación | Técnica | Dónde | Para qué sirve en la app |
|---|---|---|---|---|
| 1 | Entrada del detalle | `Animated.parallel` (fade + slide up, 500 ms) | `DetailScreen` | El curso "aparece" suavemente en vez de saltar |
| 2 | Rebote al tocar | `Animated.spring` (escala 1 → 0.95 → 1) | `AnimatedCard` | Confirma que tu toque se registró |
| 3 | Barra de progreso | `interpolate` de ancho y color | `ProgressBar` | Muestra cuántas **lecciones** llevas, y el color avisa (rojo → amarillo → verde) |
| 4 | Entrada en cascada | `Animated.stagger(80, …)` | `HomeScreen` | Las tarjetas entran una tras otra, guían la mirada |
| 5 | Cambios de lista | `LayoutAnimation` | `HomeScreen` | Al inscribirte o darte de baja, el resto de tarjetas se acomoda suave |

Además: el botón `AnimatedButton` se comprime con `timing` (80 ms) y
rebota con `spring` al soltar.

---

## 📚 Mi dominio, aplicado a animaciones

| Entidad | Cómo se usa esta semana |
|---|---|
| `enrollments` | La lista: cada tarjeta es un curso en el que estoy inscrito. "+ Inscribirme" y "Darme de baja" agregan/quitan matrículas |
| `lessons` | El progreso: `lecciones completadas / total de lecciones` alimenta la barra |
| `courses` | El contenido de cada tarjeta y del detalle (instructor, nivel, duración, precio) |
| `students` | No se usa esta semana |

Adaptación por dominio (la especificación da ejemplos como "% de stock"
en Farmacia): en cursos, el dato natural para una barra es el
**% de lecciones completadas**.

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                         # Solo StatusBar + RootNavigator
├── app.json
├── package.json                    # Sin librerías de animación: solo `Animated` de React Native
└── src/
    ├── components/
    │   ├── AnimatedCard.tsx        # 🎬 #2 spring: se hunde al tocar y rebota
    │   ├── AnimatedButton.tsx      # 🎬 timing al presionar + spring al soltar
    │   └── ProgressBar.tsx         # 🎬 #3 interpolate: ancho + color
    ├── screens/
    │   ├── HomeScreen.tsx          # 🎬 #4 stagger + #5 LayoutAnimation
    │   └── DetailScreen.tsx        # 🎬 #1 parallel: fade + slide up
    ├── data/
    │   ├── courses.ts              # Catálogo de 12 cursos (semanas anteriores)
    │   └── lessons.ts              # Lecciones por curso + matrículas iniciales
    ├── navigation/                 # Home → Detail (tipado)
    ├── types/index.ts
    └── theme/index.ts
```

**Sin librerías nuevas.** La especificación pide la API `Animated` y
`LayoutAnimation`, ambas ya vienen en React Native. (El starter traía
react-query, zustand, axios y AsyncStorage, pero esta semana no se usan,
así que no los instalé.)

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. Cómo funciona `Animated.Value` y por qué es fluido (Conocimiento 1)

```ts
const scaleAnim = useRef(new Animated.Value(1)).current;
<Animated.View style={{ transform: [{ scale: scaleAnim }] }} />
```
Un `Animated.Value` es un **número que cambia en el tiempo**, y
`Animated.View` sabe leerlo. `useRef` lo mantiene igual entre renders (si
fuera una variable normal, cada re-render lo reiniciaría).

Con `useNativeDriver: true`, React Native **manda la animación completa al
hilo nativo** (el de la interfaz) una sola vez, y ahí corre a 60 fps sin
volver a preguntarle nada a JavaScript. Por eso no se traba aunque JS
esté ocupado. Sin el driver nativo, cada fotograma pasa por JS y por el
puente, y si JS está ocupado se ven saltos.

### 2. `timing` vs `spring` (Conocimiento 2)

- **`timing`**: va de A a B en un tiempo fijo (`duration`). Predecible.
  Lo uso para entradas (fade, cascada) y para presionar el botón (80 ms).
- **`spring`**: simula un **resorte**: se pasa un poco y vuelve
  (rebote), no tiene duración fija. Se afina con `tension` (qué tan
  fuerte tira) y `friction` (cuánto frena). Lo uso al soltar tarjetas y
  botones: medí que la escala llega a **1.007** y se asienta en 1.000.
- `decay` (no lo usé): arranca con una velocidad y va frenando, como al
  soltar una lista con "lanzada".

### 3. `interpolate`: traducir un número a otra cosa (Conocimiento 3)

```ts
const widthInterp = progressAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['0%', '100%'],
  extrapolate: 'clamp',
});
const colorInterp = progressAnim.interpolate({
  inputRange: [0, 0.5, 1],
  outputRange: ['#ef4444', '#facc15', '#22c55e'],
  extrapolate: 'clamp',
});
```
Un solo `Animated.Value` (de 0 a `progress`) alimenta **dos** resultados:
el ancho y el color. `inputRange` son los valores de entrada y
`outputRange` lo que se devuelve para cada uno (React Native calcula lo
que queda **entre** medio). `extrapolate: 'clamp'` evita que un valor
fuera de rango siga "estirando" (sin él, 1.2 daría 120% de ancho).
Medí en la app: 79 % → verde amarillento, 44 % → amarillo, 11 % →
naranja-rojo, y los anchos coinciden con el progreso.

### 4. ¿Por qué la barra usa `useNativeDriver: false`? (⚠️ importante)

La rúbrica penaliza `useNativeDriver: false` "cuando debería ser true".
El driver nativo **solo puede animar `opacity` y `transform`**. `width` y
`backgroundColor` no: obligan a recalcular el layout/pintura, y solo se
pueden animar desde JS. Por eso, en `ProgressBar.tsx` (y **solo ahí**),
`false` es lo correcto y así está explicado en el código. En las otras 4
animaciones (opacity/transform) va `true`.

### 5. `Animated.parallel`, `sequence` y `stagger`

- `parallel([a, b])`: **a la vez** (fade + slide del detalle).
- `sequence([a, b])`: una **tras otra**.
- `stagger(80, [a, b, c])`: cada una arranca **80 ms después de la
  anterior**. Por dentro es un `parallel` donde cada animación va
  precedida de un retraso de `80 × posición`. Medí exactamente eso:
  retrasos de 80, 160, 240 y 320 ms, y toda la cascada termina a los
  720 ms (= 80×4 + 400).

### 6. El bug que encontré: una cascada que no se veía 🐛

Mi primera versión creaba el `Animated.Value` de cada tarjeta **al
dibujarla**, con un valor por defecto de `1` (visible). Pero el
`useEffect` que lanza la cascada corre **después** del primer dibujo, así
que las tarjetas ya habían nacido visibles: la cascada "corría" sobre
tarjetas que ya estaban en pantalla, y solo la cabecera se animaba.

**Arreglo:** crear los valores de los cursos iniciales **ya en `0`**
antes del primer dibujo (con un `useRef` que se llena una sola vez). Es
una clase de error típica: el estado inicial de una animación debe estar
correcto *antes* de que el componente aparezca, no después.

### 7. `LayoutAnimation` y por qué va ANTES del `setState`

```ts
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
setEnrollments((prev) => prev.filter(...));
```
`configureNext` le avisa a React Native "el **próximo** cambio de layout,
anímalo". Si se llamara después del `setState`, el cambio ya ocurrió y no
habría nada que animar. Sin esto, la tarjeta desaparecería de golpe y las
de abajo "saltarían". Al inscribirme uso las **dos** animaciones juntas:
`Animated` hace el fundido de la tarjeta nueva y `LayoutAnimation`
acomoda las demás.

En Android hay que activarlo a mano, **fuera del componente**:
```ts
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
```
(El `?.` es porque en iOS y en la nueva arquitectura esa función puede
no existir; la rúbrica descuenta −3 si falta.)

### 8. Una animación por elemento de una lista dinámica

El starter sugería un arreglo fijo de `Animated.Value`, pero mi lista
cambia (inscribirse / darse de baja). Uso un `Map` guardado en un
`useRef`, con **un valor por id de curso**, y borro el de un curso cuando
me doy de baja.

---

## ⚠️ Qué probé y qué no (para ser honesto con quien lo revise)

Las animaciones dependen del **tiempo**, y mi navegador de pruebas
pausa el reloj de animación cuando la pestaña está oculta. Para
verificarlas de verdad hice un **reloj virtual**: avanzo el tiempo
fotograma a fotograma y mido la opacidad/escala/color reales de la app.
Resultados medidos:

- ✅ `tsc --noEmit` sin errores, sin `any`.
- ✅ **Bundle de Android (Hermes) compila** sin errores (`expo export`).
- ✅ **Cascada:** cabecera primero, cada tarjeta 80 ms después, todo a los 720 ms.
- ✅ **Barra:** anchos 79/44/11/61 % con los colores interpolados.
- ✅ **Rebote:** escala baja hacia 0.95 al presionar, sube a 1.007 y se asienta en 1 al soltar.
- ✅ **Detalle:** opacidad 0→1 y `translateY` 30→0 a la vez, ~500 ms.
- ✅ **Inscribirse / darme de baja:** la lista cambia de 4 a 5 y vuelve a 4; la tarjeta nueva entra con 0 %.
- ⏳ **`LayoutAnimation`:** en el navegador es un "no-op" (no existe ahí), así
  que solo comprobé que los cambios de lista funcionan; **cómo se ve el
  acomodo suave lo debes ver tú en el celular**.
- ⏳ **Fluidez a 60 fps y el driver nativo real:** solo se puede juzgar
  en el celular.

---

## 🚀 Cómo ejecutarlo (paso a paso)

En **PowerShell**, parado en la carpeta del proyecto:
```powershell
cd C:\Users\ASUS\Desktop\mi-proyecto-curso_online_reactnative\week-09-animaciones_basicas\3-proyecto\starter
npm install
$env:EXPO_OFFLINE=1; npx expo start
```
Escanea el QR con Expo Go (celular y PC en el **mismo WiFi**). > ⚠️
Siempre `npm`, nunca `pnpm` (falla en Windows con `EINVAL: readlink`).
Si sale `fetch failed`, el `EXPO_OFFLINE=1` de arriba lo evita.

### Probar cada cosa
1. **Cascada:** al abrir, la cabecera y luego las 4 tarjetas entran una tras otra.
2. **Barra:** cada tarjeta llena su barra en ~0,8 s; observa los colores (79 % verde, 44 % amarillo, 11 % rojo).
3. **Rebote:** mantén presionada una tarjeta (se hunde) y suéltala (rebota).
4. **Detalle:** toca una tarjeta → el contenido aparece y sube suavemente.
5. **LayoutAnimation:** toca "+ Inscribirme a un curso" (entra una tarjeta y las demás se acomodan) y "Darme de baja" en cualquiera (las de abajo suben suavemente).

---

## 🐛 Notas técnicas de esta semana

1. **Expo SDK 57** (igual que las semanas 7-8: mi Expo Go solo soporta 57).
2. **`SafeAreaView` de `react-native`** (que usa el starter) está
   deprecado; como el encabezado de la navegación ya deja el espacio
   superior, no lo usé.
3. **`plugins: ["expo-router"]`** del `app.json` del starter: no se usa
   (la navegación es React Navigation manual), lo quité.
4. **`main` del `package.json`** = `node_modules/expo/AppEntry.js`, como
   en semanas anteriores.
5. **En web**, `useNativeDriver: true` avisa que el módulo nativo no
   existe y usa el motor de JS: es normal en el navegador; en el celular
   sí corre en el hilo nativo.

---

## 🎨 Decisiones de diseño

1. **Datos de ejemplo locales** (`lessons.ts`): esta semana no pide red,
   así que la lista es local; el progreso sale de lecciones completadas.
2. **Inscribirse** agrega el siguiente curso disponible con **0 %** (barra
   roja vacía): así se ve el color de arranque y la tarjeta nueva.
3. **`ProgressBar` reutilizable** (Home y Detalle): recibe `progress`,
   una etiqueta y un detalle ("19 de 24").
4. **Animaciones con propósito:** cada una responde a una acción del
   estudiante (tocar, entrar, inscribirse, borrar).

---

## 📱 Capturas de pantalla

_(Agregar aquí 3 capturas: 1) Mis cursos con las barras de colores,
2) Detalle de un curso, 3) tras inscribirse a un curso nuevo)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| Animación de entrada en la pantalla principal (`useEffect` + `Animated.timing`) | 8 | ✅ (cabecera + cascada) |
| Feedback de tap animado en botones/cards (`Animated.spring`) | 7 | ✅ |
| `LayoutAnimation` al agregar/eliminar elementos | 7 | ✅ código · ⏳ verlo en el celular |
| App compila y corre sin errores | 5 | ✅ TS + bundle Android · ⏳ probar en el celular |
| Animaciones coherentes con el dominio | 3 | ✅ |

Penalizaciones evitadas: `useNativeDriver: true` en toda animación de
opacity/transform (la barra usa `false` por necesidad, ver punto 4) ·
`LayoutAnimation` con `setLayoutAnimationEnabledExperimental` en Android ·
todo con `Animated.Value` (nada hardcodeado) · sin crashes al animar.

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-09` (creada desde `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 09 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
