# EduOnline — Proyecto Semana 07 (Persistencia Local)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada esta semana:** `Item` (representa un `Course` / curso)

---

## 🎯 Qué es este proyecto

Continúa el catálogo de cursos de las semanas 5-6 (misma API real) y le
agrega **memoria**: la app ahora recuerda cosas aunque la cierres o te
quedes sin internet. Usa los **tres tipos de almacenamiento** que pide
la semana, cada uno para lo que mejor sirve:

| Qué se guarda | Dónde | Por qué ahí |
|---|---|---|
| Preferencias de la lista (orden, modo compacto, cursos por página) | **MMKV** | Datos pequeños que se leen todo el tiempo; MMKV es **síncrono** (sin `await`) y rapidísimo |
| Copia de la lista de cursos (para verla sin red) | **AsyncStorage** | Dato más grande y que se lee poco; es asíncrono pero está hecho para eso |
| PIN de acceso al panel de instructores | **Expo SecureStore** | Dato sensible: se guarda **cifrado** en el llavero del teléfono |

---

## 📚 Mi dominio, aplicado a persistencia

| Entidad | Qué representa | ¿Usada esta semana? |
|---|---|---|
| `courses` | Los cursos que se ofrecen | ✅ Sí (lista + caché offline) |
| `students` | Estudiantes inscritos | No, semanas futuras |
| `enrollments` | Relación estudiante-curso | No, semanas futuras |
| `lessons` | Lecciones dentro de un curso | No, semanas futuras |

Adaptación al dominio (la especificación da ejemplos de Farmacia,
Biblioteca, etc.):
- **Preferencias:** ordenar los cursos por *nombre* o por *instructor*,
  de A→Z o Z→A, cuántos mostrar por página (5/10/15) y modo compacto.
- **Dato sensible:** el **PIN de acceso al panel de instructores**
  (equivalente al "PIN de caja" de Farmacia).

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                          # Espera al almacenamiento y arranca la app
├── app.json                         # Config de Expo (+ plugin expo-secure-store)
├── package.json                     # + mmkv, async-storage, secure-store
└── src/
    ├── storage/                     # 🆕 TODO el acceso a disco vive aquí
    │   ├── mmkv.ts                  #   MMKV real + respaldo para Expo Go
    │   ├── itemsCache.ts            #   Caché de cursos (AsyncStorage)
    │   └── secure.ts                #   PIN (SecureStore)
    ├── hooks/
    │   ├── usePreferences.ts        # 🆕 Preferencias tipadas (MMKV)
    │   ├── useItems.ts              #   + caché offline con fallback
    │   ├── useOfflineCache.ts       # 🆕 Estado/borrado de la caché
    │   └── useSecureCode.ts         # 🆕 Guardar/verificar/borrar el PIN
    ├── screens/
    │   ├── HomeScreen.tsx           #   Aplica orden, compacto, paginación, banner
    │   ├── SettingsScreen.tsx       # 🆕 Ajustes: MMKV + caché + SecureStore
    │   ├── CreateScreen.tsx         #   (de la semana 06)
    │   └── EditScreen.tsx           #   (de la semana 06)
    ├── schemas/
    │   ├── itemSchema.ts            #   (de la semana 06)
    │   └── pinSchema.ts             # 🆕 Regla del PIN (4-6 dígitos) con Zod
    ├── components/FormField.tsx     #   (de la semana 06)
    ├── navigation/                  #   + pantalla Settings
    ├── services/api.ts              #   URL configurable por variable de entorno
    ├── types/index.ts
    └── theme/index.ts
```

**Regla de oro de esta semana (y penalización de la rúbrica):** la
lógica de almacenamiento NO va dispersa en las pantallas. Las pantallas
solo llaman a hooks (`usePreferences`, `useOfflineCache`,
`useSecureCode`) y esos hooks son los únicos que conocen `storage/`.

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. Tres almacenamientos, tres trabajos (la pregunta 1 de la rúbrica)

Imagina una app bancaria que debe guardar: (a) tema claro/oscuro,
(b) últimas transacciones para verlas sin red, (c) token de sesión.
- **(a) MMKV** — pequeño, se lee en cada pantalla, no es secreto.
- **(b) AsyncStorage** — más grande, se lee poco, tampoco es secreto.
- **(c) SecureStore** — secreto: se cifra. **Nunca** en AsyncStorage ni
  MMKV (la rúbrica descuenta −10 si se hace).

En este proyecto: preferencias → MMKV, lista de cursos → AsyncStorage,
PIN → SecureStore. Es exactamente esa decisión.

### 2. Por qué `useState` NO alcanza (pregunta 3)

`useState` vive en la **memoria RAM**: al cerrar la app se borra todo.
AsyncStorage/MMKV escriben en el **sistema de archivos** del
dispositivo, que sobrevive a cerrar y reabrir la app. Por eso las
preferencias usan MMKV y no un `useState`.

### 3. Hooks reactivos de MMKV: cambia en Ajustes, se actualiza Home

```ts
const [sortByRaw, setSortByRaw] = useMMKVString('pref_sortBy');
```
Funciona como un `useState`, pero el valor se guarda en disco **y** todos
los componentes que usan esa misma clave se actualizan solos. Por eso
cambias "Ordenar por instructor" en Ajustes y, al volver, Home ya está
reordenada — sin pasar props ni recargar nada. Como MMKV es síncrono, no
hay `await` ni botón "Guardar".

`usePreferences` además **valida** lo leído (`toSortBy`, `toItemsPerPage`):
MMKV solo devuelve string/número/booleano "crudo"; si por algún motivo
hubiera un valor raro, se usa el valor por defecto en vez de romper.

### 4. Caché offline: el `try/catch` dentro de `queryFn`

```ts
try {
  const { data } = await apiClient.get(...);
  await saveItemsCache(items);          // red OK → guardo copia
  return { items, source: 'network' };
} catch (networkError) {
  const cached = await readItemsCache();
  if (cached) return { items: cached.items, source: 'cache' };
  throw networkError;                    // ni red ni copia → error
}
```
Tres caminos: **con red** (datos frescos + copia nueva), **sin red pero
con copia** (banner "⚠️ Mostrando datos sin red"), **sin red y sin
copia** (pantalla de error de la semana 05). Como en el segundo camino
la función *devuelve* datos en vez de lanzar error, TanStack Query lo ve
como éxito y no hace reintentos inútiles.

### 4. SecureStore: la pantalla nunca ve el PIN guardado

`secure.ts` expone `hasSecretPin()` (sí/no) y `verifySecretPin(candidato)`
(true/false) — **no** una función que devuelva el PIN. Así, aunque
alguien quisiera, la pantalla no tiene cómo mostrarlo en texto plano
(requisito de la especificación). El campo de texto usa
`secureTextEntry` y se limpia tras guardar.

### 5. MMKV y Expo Go (la pregunta 2 de la rúbrica)

MMKV está escrito en **C++** y se conecta a JavaScript con **JSI** (una
interfaz que deja a JS llamar código nativo *directamente*, sin el
"puente" asíncrono antiguo de React Native); la versión 4 usa además
**Nitro Modules**. Ese código C++ hay que **compilarlo** dentro de la
app. Expo Go es una app ya compilada que solo trae ciertos módulos
nativos — el de MMKV no está — por eso MMKV requiere un *development
build* (`npx expo run:android` / `run:ios`, que ejecuta `expo prebuild`
para generar las carpetas nativas y luego compila).

---

## ⚠️ MMKV real vs. respaldo (importante — léelo)

Como pruebo en **Expo Go** (que no puede correr MMKV), `src/storage/mmkv.ts`
elige el almacenamiento **una sola vez al arrancar**:

| Dónde corre | Qué usa | Cómo se nota |
|---|---|---|
| App compilada (dev build / EAS) y **web** | **MMKV real** (en web, sobre `localStorage`) | — |
| **Expo Go** | Respaldo: valores en memoria copiados a AsyncStorage | Ajustes muestra un aviso naranja |

El respaldo expone **exactamente la misma forma** de hooks
(`useMMKVString/Boolean/Number`), así el resto del código (y
`usePreferences`) es idéntico en ambos casos.

**Qué verifiqué y qué no** (para ser honesto con quien lo revise):
- ✅ `tsc --noEmit` sin errores.
- ✅ **MMKV real probado en web** (que usa la implementación web de la
  librería): las preferencias se guardan, se aplican en Home y
  **sobreviven a recargar la página**.
- ✅ Caché offline, SecureStore (vista web en memoria) y validación del PIN.
- ⏳ **MMKV nativo compilado** (`expo run:android`) y **SecureStore
  cifrado real** no los pude probar en un dispositivo/emulador: eso
  queda para cuando compiles la app (pasos abajo).

---

## 🚀 Cómo ejecutarlo (paso a paso)

### A) Rápido, en Expo Go (usa el respaldo de MMKV)
```bash
cd week-07-persistencia_local/3-proyecto/starter
npm install
npx expo start
```
Escanea el QR con Expo Go. > ⚠️ Siempre `npm`, nunca `pnpm` (falla en
Windows con `EINVAL: readlink`).

Si al arrancar aparece `TypeError: fetch failed`, es una consulta
interna de Expo a internet que falló; arranca en modo offline de Expo
(no afecta a la app, que sí usa internet):
```bash
EXPO_OFFLINE=1 npx expo start
```

### B) Con MMKV real (app compilada, requiere Android Studio/SDK + emulador o celular por USB)
```bash
npx expo run:android
```

### C) En el navegador
Presiona `w` en la terminal de `expo start` (usa MMKV real sobre `localStorage`).

### Probar cada cosa
1. **Preferencias:** ⚙️ (arriba a la izquierda) → cambia "Ordenar por",
   "Dirección", "Cursos por página" y "Modo compacto" → vuelve: la lista
   ya cambió. Cierra y abre la app: se mantienen.
2. **Sin red con copia:** abre la lista con internet una vez; luego
   activa modo avión y vuelve a abrir la app → banner
   "⚠️ Mostrando datos sin red" con la hora de la última copia.
3. **Sin red y sin copia:** Ajustes → "Borrar copia guardada", con modo
   avión reinicia la app → pantalla de error con "Reintentar".
4. **PIN:** Ajustes → Seguridad → escribe `12` (error de validación) →
   `4821` → "Guardar PIN" → "Verificar" con `0000` (no coincide) y con
   `4821` (coincide). El PIN nunca se muestra.

Para simular "sin red" en web sin apagar el WiFi, apunta la API a una
dirección que no responde (mismo puerto para conservar la caché):
```bash
EXPO_OFFLINE=1 EXPO_PUBLIC_API_URL=http://127.0.0.1:9 npx expo start --web --port 8086
```

---

## 🐛 Notas técnicas de esta semana

1. **El starter del profe usa la API de MMKV v3 con la librería v4.**
   Su `mmkv.ts` hace `new MMKV({ id })`, pero en `react-native-mmkv@4`
   `MMKV` es solo un *tipo* — la instancia se crea con
   `createMMKV({ id })`. Lo corregí. (Se ve en `src/storage/mmkv.ts`.)
2. **Expo SDK 57, no 54.** En las semanas 2-6 fijé el proyecto en SDK 54
   porque el starter traía 57 y en ese momento mi Expo Go (Play Store)
   todavía no lo soportaba. Esta semana pasó lo contrario: Expo Go se
   **actualizó sola** y dejó de soportar SDK 54, así que esta vez sí se
   usa SDK 57 — la misma versión que ya traía el starter del profe
   originalmente. `expo install` resolvió: `react 19.2.3`,
   `react-native 0.86.3`, `react-native-screens ~4.26.0`,
   `react-native-safe-area-context ~5.7.0`, `async-storage 2.2.0`,
   `expo-secure-store ~57.0.4`, `expo-constants ~57.0.19`.
   **Moraleja:** la versión correcta de Expo SDK es "la que soporte tu
   Expo Go en ese momento", no un número fijo — puede cambiar de una
   semana a otra porque Google Play actualiza Expo Go solo.
3. **`main` del `package.json`** = `node_modules/expo/AppEntry.js`
   (no `App.tsx`), igual que en semanas anteriores.
4. **En una pestaña de navegador oculta**, TanStack Query pausa los
   reintentos (no hay "foco"): no es un error de la app, solo se nota al
   probar el estado de error en una ventana en segundo plano.

---

## 🎨 Decisiones de diseño

1. **`storage/` como única puerta al disco:** ninguna pantalla importa
   `AsyncStorage`, `SecureStore` ni MMKV directamente.
2. **El PIN nunca sale de `secure.ts`:** solo salen un sí/no.
3. **Respaldo para Expo Go** en vez de obligar a compilar para probar:
   mismo código, mismo comportamiento.
4. **Caché con fecha** (`savedAt`): el banner dice cuándo se guardó la
   copia que estás viendo.
5. **Paginación simple** ("Ver más") para que "Cursos por página" tenga
   efecto visible con solo 15 cursos.
6. **Zod también para el PIN** (`pinSchema`), igual que en la semana 06.

---

## 📱 Capturas de pantalla

_(Agregar aquí 4 capturas: 1) lista con banner "sin red", 2) Ajustes con
preferencias, 3) Ajustes → Seguridad con PIN guardado, 4) lista en modo
compacto)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| **MMKV**: Ajustes guarda ≥2 preferencias que persisten sin `async/await` (tiene 4) | 8 | ✅ |
| **AsyncStorage**: cursos cacheados y visibles sin red, con banner offline | 8 | ✅ |
| **SecureStore**: dato sensible con `setItemAsync` / `getItemAsync` | 6 | ✅ (probado en web; cifrado real solo en celular) |
| **Custom hook** `usePreferences()` que encapsula MMKV y exporta helpers tipados | 5 | ✅ |
| App funcional en simulador, TypeScript sin errores | 3 | ✅ TS · ⏳ probar en el celular |

Penalizaciones evitadas: ningún token/PIN en AsyncStorage o MMKV · no se
usa `useState` para persistir · el proyecto es compilable con build
nativo (MMKV) · la lógica de storage está en hooks, no en pantallas.

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-07` (creada desde `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 07 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
