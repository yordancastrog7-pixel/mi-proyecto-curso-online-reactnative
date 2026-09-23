# EduOnline — Proyecto Semana 08 (Autenticación)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidades usadas esta semana:** `students` (el usuario que inicia sesión), `courses` y `enrollments` (sus cursos inscritos)

---

## 🎯 Qué es este proyecto

Una app con **inicio de sesión completo**: login y registro con
formularios validados (React Hook Form + Zod), sesión guardada con
**JWT** (access token + refresh token) en almacenamiento **cifrado**
(SecureStore), estado de sesión con **Zustand + persist**, navegación
que cambia sola según haya sesión o no, y **renovación automática del
token** cuando vence (interceptor de Axios).

| Pantalla | Cuándo se ve | Qué hace |
|---|---|---|
| **Login** | Sin sesión | Formulario usuario/contraseña, errores claros, botón "cuenta de práctica" |
| **Registro** | Sin sesión | Usuario, correo, contraseña y confirmación (simulado, ver abajo) |
| **Cursos** (Home) | Con sesión | Saludo + catálogo; marca "✓ Inscrito" en los cursos del estudiante |
| **Mi perfil** | Con sesión | Datos del estudiante, universidad (de la API), cursos inscritos, estado de la sesión, cerrar sesión |

**Cuenta de práctica** (la da la especificación): usuario `emilys` /
contraseña `emilyspass`. También hay un botón "Usar cuenta de práctica"
en el Login que la escribe por ti.

---

## 🌐 Sobre la API que usé

[dummyjson.com](https://dummyjson.com/docs/auth), como pide la
especificación. Verifiqué **contra la API real** (no de memoria) qué
responde cada caso:

| Situación | Respuesta real |
|---|---|
| `POST /auth/login` correcto | `200` con `accessToken`, `refreshToken` y los datos del usuario |
| `POST /auth/login` con contraseña mala | `400` "Invalid credentials" |
| `GET /auth/me` con token válido | `200` |
| `GET /auth/me` con token **vencido** | **`401`** "Token Expired!" ← el caso que renueva el interceptor |
| `GET /auth/me` con token basura | `500` "invalid token" (no 401) |
| `POST /auth/refresh` correcto | `200` con tokens nuevos |
| `POST /auth/refresh` con refresh inválido | `403` |

Dos cosas que descubrí al probarla y que cambian el diseño:
1. **El JWT trae `id`, `iat` y `exp` — no `sub`.** El tipo `JwtPayload`
   del starter decía `sub`; lo corregí.
2. **`/auth/me` devuelve datos sensibles de más** (`password`, `ssn`,
   `bank`…). Por eso `profileService.ts` copia **solo** los campos que la
   app necesita en vez de hacer `...data`, y la interfaz no declara los demás.

**Limitaciones de la API de práctica (no son bugs de mi código):**
- **El registro es simulado.** dummyjson no guarda usuarios nuevos:
  `POST /users/add` responde `201` pero el usuario no existe después, así
  que no puede iniciar sesión. La app hace la petición real, avisa en el
  Login con un banner y te invita a usar la cuenta de práctica.
- **Las matrículas (cursos inscritos) son simuladas.** dummyjson no sabe
  de cursos: `data/enrollments.ts` calcula 3 cursos a partir del id del
  usuario (cada usuario ve siempre los mismos). En una app real vendrían
  de un endpoint.
- **La "universidad" del perfil sí es real** (viene de `/auth/me`).

---

## 🗂️ Estructura del proyecto, archivo por archivo

```
starter/
├── App.tsx                          # QueryClientProvider + RootNavigator
├── app.json                         # scheme "eduonline", plugin expo-secure-store
├── package.json                     # zustand, jwt-decode, secure-store…
└── src/
    ├── services/
    │   ├── tokenService.ts          # 🔐 ÚNICO archivo que toca los tokens (SecureStore)
    │   ├── authService.ts           #   login / register / refresh (axios directo)
    │   ├── api.ts                   #   instancia Axios + interceptores (401 → refresh)
    │   ├── profileService.ts        #   GET /auth/me (usa la instancia con interceptor)
    │   └── queryClient.ts           #   QueryClient compartido (el store lo vacía al salir)
    ├── stores/
    │   └── authStore.ts             # 🧠 Zustand + persist: user, accessToken, login/logout…
    ├── hooks/
    │   ├── useAuthHydration.ts      #   espera a que persist lea la sesión guardada
    │   └── useProfile.ts            #   useQuery del perfil
    ├── navigation/
    │   ├── RootNavigator.tsx        # ⚡ elige Auth o App según isAuthenticated
    │   ├── AuthNavigator.tsx        #   Login / Registro
    │   ├── AppNavigator.tsx         #   Tabs Cursos / Perfil + botón "Salir"
    │   └── types.ts
    ├── screens/                     # Login, Register, Home, Profile
    ├── schemas/authSchema.ts        #   reglas Zod (login y registro)
    ├── components/FormField.tsx     #   campo reutilizable (de la semana 06)
    ├── data/                        #   courses.ts (12 cursos) y enrollments.ts (simulado)
    ├── types/index.ts
    └── theme/index.ts
```

### Dónde vive cada dato (la regla más importante de la semana)

| Dato | Dónde | ¿Cifrado? |
|---|---|---|
| `accessToken` y `refreshToken` | **SecureStore** (`tokenService.ts`) | ✅ Sí |
| `user` e `isAuthenticated` | AsyncStorage, vía `persist` | ❌ No — pero no son secretos (nombre, correo) |
| `accessToken` dentro del store | Solo **memoria** (`partialize` lo excluye de `persist`) | — |

Los tokens **nunca** van a AsyncStorage ni a MMKV (la rúbrica descuenta
−10 por cada uno) ni se muestran en pantalla (−8). Comprobado: en
`localStorage` (donde AsyncStorage guarda en web) solo aparece
`auth-storage` con `user` e `isAuthenticated`, sin ningún JWT.

---

## 🧠 Explicación de código relevante (para repasar en el futuro)

### 1. Qué es un JWT (criterio 1 de la rúbrica)

Un JWT son **3 partes** separadas por puntos: `header.payload.signature`.
- **header**: qué algoritmo firma el token.
- **payload**: los datos ("claims"): `id`, `username`, `iat` (emitido en),
  `exp` (vence en)… en segundos desde 1970.
- **signature**: la firma que prueba que el servidor lo emitió y que
  nadie lo alteró.

**Ojo:** el JWT está **firmado, NO cifrado**. El payload es solo
base64: cualquiera lo puede leer (yo lo hice en la terminal para ver el
`exp`). Por eso nunca se pone un secreto dentro. En la pantalla de
Perfil uso `jwt-decode` para leer el `exp` y mostrar "el acceso vence a
las 09:50" — leo el token, pero **jamás lo muestro**.

### 2. Access token vs refresh token (criterio 2)

- **Access token**: se manda en cada petición (`Authorization: Bearer …`).
  Dura **poco** (30 min aquí; 1 min cuando probé): si alguien lo roba,
  solo le sirve un rato.
- **Refresh token**: solo sirve para pedir un access token nuevo. Dura
  **mucho** (30 días) para que el usuario no tenga que loguearse a cada
  rato, y por eso se guarda en SecureStore (cifrado).

El ciclo de renovación, que probé de punta a punta contra la API real:
```
GET /auth/me   → 401 (token vencido)
POST /auth/refresh → 200 (tokens nuevos)
GET /auth/me   → 200 (la llamada original, repetida sola)
```

### 3. El interceptor de respuesta (`services/api.ts`)

```ts
if (error.response?.status === 401 && !original._retry) {
  original._retry = true;                       // no reintentar dos veces
  const newToken = await refreshAccessToken();  // renueva
  original.headers.Authorization = `Bearer ${newToken}`;
  return api(original);                         // repite la llamada
}
```
Detalles que evitan bugs:
- **`_retry`**: si el reintento vuelve a dar 401, no lo intentamos otra
  vez (sería un bucle infinito).
- **Una sola renovación a la vez** (`refreshPromise`): si 3 pantallas
  reciben 401 al mismo tiempo, las 3 esperan la **misma** renovación en
  vez de lanzar 3.
- **`authService` usa `axios` directo y no `api`**: si el refresh usara
  la instancia con interceptor y fallara con 401, dispararía otro
  refresh… otro bucle.
- **Sin import circular**: `api.ts` no puede importar el store (el store
  importa servicios). Por eso el store se registra a sí mismo con
  `setAuthCallbacks(...)` para enterarse de "token renovado" y "sesión
  vencida".

### 4. Navegación condicional sin `navigate()` (`RootNavigator.tsx`)

```tsx
{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
```
Al iniciar sesión, **nadie llama a `navigation.navigate('Home')`**: el
store cambia `isAuthenticated` y React dibuja el otro navegador. Igual al
cerrar sesión — desde el botón "Salir" del encabezado (está en las
opciones del Tab, así que aparece en **todas** las pantallas) o desde el
Perfil. Un beneficio de seguridad: con sesión cerrada, las pantallas
de la app **no existen** en el árbol, no basta con "esconderlas".

### 5. Por qué hay que esperar la hidratación (`useAuthHydration`)

`persist` lee la sesión guardada de AsyncStorage, y eso es **asíncrono**.
Sin esperar, durante un instante `isAuthenticated` vale `false` y el
usuario con sesión vería un parpadeo del Login antes de pasar a Cursos.
Por eso `RootNavigator` muestra un spinner hasta que (1) `persist`
terminó y (2) `restoreSession()` verificó que los tokens existen.

### 6. `restoreSession`: no creerle a `isAuthenticated`

`isAuthenticated: true` quedó escrito en disco, pero los tokens viven en
otro lugar (SecureStore). Si por algo los tokens ya no están
(reinstalación, borrado…), la app **no debe** mostrarse como logueada.
`restoreSession()` comprueba que el refresh token exista y, si no, cierra
la sesión. Lo probé recargando la página web (donde los tokens solo viven
en memoria): vuelve al Login y limpia el estado guardado.

### 7. `partialize`: qué se escribe a disco

```ts
partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
```
`persist` guardaría todo el estado por defecto. `partialize` elige solo
lo que corresponde: sin `accessToken` (secreto), sin `isLoading` ni
`error` (temporales).

### 8. Cerrar sesión de verdad (`logout`)

Borra los tokens de SecureStore, **vacía el caché de TanStack Query**
(si no, el perfil del usuario anterior seguiría en memoria y lo vería el
siguiente que inicie sesión) y limpia el estado.

### 9. Selectores específicos (recordatorio de la semana 04)

`useAuthStore((state) => state.isLoading)` y no `useAuthStore()` entero:
cada componente se re-renderiza solo cuando cambia **su** dato.

---

## ⚠️ Qué probé y qué no (para ser honesto con quien lo revise)

Probé en el **navegador** con la API real (no pude probar en un celular
desde aquí):
- ✅ `tsc --noEmit` sin errores, sin `any`.
- ✅ Validación de Login y Registro (campos vacíos, correo inválido, contraseñas que no coinciden).
- ✅ Credenciales incorrectas → mensaje claro; correctas → pasa solo a la app.
- ✅ **Renovación automática real**: con tokens de 1 minuto, esperé a que
  vencieran y abrí el Perfil → `401 → refresh 200 → reintento 200`.
- ✅ Cerrar sesión desde el encabezado; registro simulado (`201`) con banner.
- ✅ Ningún JWT en pantalla ni en `localStorage`.
- ⏳ **SecureStore cifrado real y "la sesión sobrevive a cerrar la app"**:
  en el navegador SecureStore no existe (los tokens viven en memoria y
  se pierden al recargar), así que **esto lo debes probar tú en el celular**
  — ver el paso 4 de "Probar cada cosa".

---

## 🚀 Cómo ejecutarlo (paso a paso)

```bash
cd week-08-autenticacion/3-proyecto/starter
npm install
npx expo start
```
Escanea el QR con Expo Go. > ⚠️ Siempre `npm`, nunca `pnpm` (falla en
Windows con `EINVAL: readlink`). Si al arrancar sale
`TypeError: fetch failed` (consulta interna de Expo a internet), usa
`EXPO_OFFLINE=1 npx expo start` — no afecta a la app.

### Probar cada cosa
1. **Validación:** en el Login pulsa "Ingresar" vacío → 2 errores. Escribe
   `emilys` y una contraseña mala → "Usuario o contraseña incorrectos".
2. **Login:** "Usar cuenta de práctica" → "Ingresar" → entra a Cursos y
   saluda a Emily. Ve a "Mi perfil".
3. **Registro:** Login → "¿No tienes cuenta?" → completa el formulario →
   vuelve al Login con un aviso (registro simulado).
4. **Persistencia (en el celular):** inicia sesión, **cierra Expo Go por
   completo** y vuelve a abrir la app → debe entrar directo a Cursos, sin
   pedir login. Luego "Salir" → cierra y reabre → debe pedir login.
5. **Renovación automática** (opcional, en web): arranca con
   `EXPO_PUBLIC_ACCESS_TOKEN_MINUTES=1 npx expo start --web`, inicia
   sesión, espera 1 minuto y abre "Mi perfil": carga igual, sin pedirte
   nada (la renovación pasó por detrás).

---

## 🐛 Notas técnicas de esta semana

1. **El starter usa `sub` en el JWT; el real usa `id`** (ver arriba).
2. **Versiones fijadas a Expo SDK 57**, como en la semana 07 (mi Expo Go
   ya solo soporta 57): `expo-secure-store ~57.0.4`,
   `react-native 0.86.3`, etc., resueltas con `expo install`.
3. **No usé `expo-auth-session` / `expo-crypto`** aunque el starter los
   incluye: son del ejercicio 02 (OAuth con PKCE), no del proyecto
   (que pide login con JWT). Menos dependencias = menos que instalar.
4. **`main` del `package.json`** = `node_modules/expo/AppEntry.js`, como
   en semanas anteriores.
5. **Web:** `SecureStore` no existe en navegador; `tokenService.ts` usa
   una variable en **memoria** (nunca `localStorage`) solo para poder
   probar. En el celular siempre es SecureStore.

---

## 🎨 Decisiones de diseño

1. **Un solo archivo toca los tokens** (`tokenService.ts`): ninguna
   pantalla ni el store leen/escriben SecureStore directo.
2. **`accessToken` también en el store, pero solo en memoria**: la rúbrica
   lo lista como parte del store; `partialize` garantiza que no se persiste.
3. **No copiar toda la respuesta de la API** (`profileService.ts`) por los
   campos sensibles que trae.
4. **Registro sin abrir sesión**: como la API no guarda usuarios, abrir
   sesión con un usuario falso rompería el Perfil (sus tokens no
   servirían). Es más honesto avisar y volver al Login.
5. **Botón "Usar cuenta de práctica"**: agiliza probar (y a quien revise).
6. **Mensajes de error en español** según el caso (credenciales, sin
   conexión, servidor caído) en vez de mostrar el texto crudo de la API.

---

## 📱 Capturas de pantalla

_(Agregar aquí 4 capturas: 1) Login con errores de validación,
2) Cursos con la etiqueta "Inscrito", 3) Mi perfil, 4) Registro)_

---

## ✅ Checklist de requisitos (Producto 📦 — 30 pts, según `rubrica-evaluacion.md`)

| Criterio | Pts | Cumplido |
|---|---|---|
| `useAuthStore` con `user`, `accessToken`, `isAuthenticated`, `login()`, `logout()`, `refreshTokens()` | 8 | ✅ |
| Login con RHF + Zod, llama `login()`, maneja errores de credenciales | 7 | ✅ |
| Navegación condicional (`AuthNavigator` ↔ `AppNavigator`) sin `navigate()` | 7 | ✅ |
| Persistencia al reiniciar: tokens en SecureStore, Perfil sin re-login | 5 | ✅ código · ⏳ probar en el celular |
| Compila sin errores TypeScript y funciona | 3 | ✅ TS · ⏳ probar en el celular |

Opcionales cumplidos: **interceptor 401 con renovación automática** y
**cerrar sesión desde cualquier pantalla**.

Penalizaciones evitadas: tokens fuera de AsyncStorage/MMKV · access token
nunca en pantalla · formularios con Zod · lógica de sesión encapsulada
(store + servicios, no en pantallas) · transición Auth ↔ App sin crash.

---

## 📤 Cómo entregar

1. Subir el código a mi repo de GitHub, rama `week-08` (creada desde `main`).
2. Enviar correo a `profeerickgranados@gmail.com`:
   - **Asunto:** `bc-reactnative semana 08 ficha 3228970`
   - **Cuerpo:** solo el link del repo.
3. Plazo: 2 días calendario antes de la próxima clase, 11:59pm.
