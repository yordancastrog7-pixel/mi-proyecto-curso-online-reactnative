# EduOnline — Proyecto Semana 01 (React Native)

> **Bootcamp:** bc-reactnative — Ficha 3228970
> **Aprendiz:** Yordan Castro Guerrero
> **Dominio asignado:** Plataforma de cursos online
> **Entidades del dominio:** `courses`, `students`, `enrollments`, `lessons`
> **Entidad usada en esta semana:** `Course` (curso)

---

## 🎯 Qué es este proyecto

App de pantalla única construida con **React Native + Expo + TypeScript**,
que muestra una lista de **tarjetas de cursos** usando Core Components y
Flexbox. Es la entrega de la **Semana 01** del bootcamp, adaptada al
dominio de una plataforma de cursos online.

---

## 📁 Estructura del proyecto

```
starter/                          ← raíz del proyecto (aquí está package.json)
├── App.tsx                       # Punto de entrada, renderiza HomeScreen
├── app.json                      # Configuración de Expo (nombre, sdkVersion, etc.)
├── package.json                  # Dependencias del proyecto
├── tsconfig.json                 # Configuración de TypeScript
└── src/
    ├── types/
    │   └── index.ts              # Interfaz `Course`: forma de un curso
    ├── data/
    │   └── mockData.ts           # 4 cursos de ejemplo (datos falsos)
    ├── components/
    │   └── ItemCard.tsx          # Tarjeta reutilizable de un curso
    └── screens/
        └── HomeScreen.tsx        # Pantalla principal: header + lista
```

**Qué hace cada archivo:**

| Archivo | Función |
|---|---|
| `App.tsx` | Arranca la app, solo renderiza `HomeScreen`. |
| `app.json` | Nombre visible, ícono, splash, y **sdkVersion** de Expo. |
| `src/types/index.ts` | Define los campos que tiene un `Course` (id, nombre, precio, etc). |
| `src/data/mockData.ts` | 4 cursos de prueba para no depender de un backend. |
| `src/components/ItemCard.tsx` | Tarjeta visual: imagen + info + botón `Pressable`. |
| `src/screens/HomeScreen.tsx` | Header "EduOnline" + `ScrollView` con todas las tarjetas. |

---

## 🚀 Cómo ejecutar el proyecto (paso a paso)

### 1. Requisitos previos
- Node.js instalado
- App **Expo Go** instalada en tu celular (Play Store / App Store)
- Celular y computador conectados a la **misma red WiFi**

### 2. Instalar dependencias
Abre una terminal **dentro de la carpeta `starter`** (donde está `package.json`) y ejecuta:

```bash
npm install
```

> ⚠️ Usamos `npm`, **no** `pnpm`. `pnpm` genera symlinks que fallan en
> Windows con el error `EINVAL: readlink`. Si por error corres `pnpm
> install`, borra `node_modules` y vuelve a instalar con `npm install`.

### 3. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Esto abre el Metro Bundler y genera un código QR en la terminal.

### 4. Ver la app

**Opción A — En tu celular (recomendado, cumple el requisito de "simulador"):**
1. Asegúrate de que el celular esté en la **misma WiFi** que el PC.
2. Abre Expo Go y escanea el QR de la terminal.
3. Si el QR no conecta, en Expo Go toca "Enter URL manually" y escribe la URL `exp://` que aparece en la terminal (ej: `exp://192.168.1.140:8081`).

**Opción B — En el navegador (rápido para revisar el código):**
En la terminal donde corre Expo, presiona la tecla `w`. Si no abre solo,
ve manualmente a `http://localhost:8081`.

---

## 🧠 Explicación de código relevante

Notas para repasar en un mes, cuando ya no recuerde el detalle de por qué
se escribió así.

### `src/types/index.ts` — la interfaz `Course`

```typescript
export interface Course {
  id: string;
  name: string;
  imageUri: string;
  subtitle: string;
  instructor: string;
  price: number;
  category: string;
}
```
Esto es un **contrato**: le dice a TypeScript "todo objeto `Course` debe
tener exactamente estos campos, con estos tipos". Gracias a esto, si en
`mockData.ts` me olvido de poner el `price` de un curso, TypeScript me
marca error ANTES de correr la app, no después.

---

### `src/components/ItemCard.tsx` — feedback visual con `Pressable`

```typescript
<Pressable
  style={({ pressed }) => [
    styles.card,
    pressed && styles.cardPressed,
  ]}
  onPress={() => onPress(item)}
>
```
`Pressable` recibe una **función** en `style` (no un objeto fijo). React
Native le pasa el estado actual (`{ pressed }`) y con eso decidimos qué
estilos aplicar. Si `pressed` es `true` (el dedo está tocando la
tarjeta), se le suma `styles.cardPressed` (que baja la opacidad) al
array de estilos — así el usuario ve que su toque fue detectado. Eso es
lo que pide el requisito "acción con feedback visual".

```typescript
<Image
  source={{ uri: item.imageUri }}
  style={styles.cardImage}
  resizeMode="cover"
/>
```
`source={{ uri: ... }}` carga una imagen **remota** (una URL de
internet), a diferencia de `require('./local.png')` que sería para
imágenes guardadas dentro del proyecto. `resizeMode="cover"` hace que la
imagen llene todo el espacio disponible sin deformarse, recortando lo
que sobre (como el `object-fit: cover` de CSS en web).

```typescript
<View style={styles.cardHeaderRow}>
  <Text style={styles.cardName}>{item.name}</Text>
  <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
</View>
```
`cardHeaderRow` usa `flexDirection: 'row'` + `justifyContent:
'space-between'` (ver estilos abajo) para poner el nombre a la
izquierda y el precio a la derecha, con espacio automático entre ambos.
`item.price.toLocaleString()` convierte `149000` en `"149.000"` — separa
los miles automáticamente para que se lea como plata real.

```typescript
const styles = StyleSheet.create({
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ...
});
```
`StyleSheet.create` no es obligatorio técnicamente (podríamos usar un
objeto normal), pero React Native lo optimiza internamente y es el
estándar del proyecto — además el enunciado prohíbe estilos inline
(`style={{...}}` directo en el JSX), así que todo estilo vive aquí,
referenciado por nombre (`styles.card`, `styles.cardImage`, etc).

---

### `src/screens/HomeScreen.tsx` — renderizar la lista

```typescript
<ScrollView
  style={styles.listContainer}
  contentContainerStyle={styles.listContent}
  showsVerticalScrollIndicator={false}
>
  {MOCK_ITEMS.map((item) => (
    <ItemCard
      key={item.id}
      item={item}
      onPress={handleItemPress}
    />
  ))}
</ScrollView>
```
Dos props distintas en `ScrollView` que se confunden fácil:
- `style` → afecta el **contenedor** (el "marco" del scroll, ocupa `flex: 1`).
- `contentContainerStyle` → afecta el **contenido interno** que se
  desplaza (ahí va el `padding: 16`, por ejemplo).

`MOCK_ITEMS.map(...)` recorre el array de cursos y por cada uno devuelve
un `<ItemCard />`. El `key={item.id}` es obligatorio en React: le ayuda
a identificar qué tarjeta es cuál si la lista cambia (se agrega, se
quita, se reordena), para no tener que re-dibujar todo desde cero.

```typescript
function handleItemPress(item: Course): void {
  console.log('Curso seleccionado:', item.name);
}
```
Esta función se pasa como prop `onPress` a cada `ItemCard`. Cuando el
usuario toca una tarjeta, `ItemCard` llama a `onPress(item)`, que en
realidad ejecuta esta función aquí en `HomeScreen` — es el patrón típico
de React: el hijo (`ItemCard`) no decide qué pasa al presionar, solo
avisa al padre ("me tocaron, aquí está el item"), y el padre decide qué
hacer (por ahora, solo un `console.log`; en semanas futuras aquí iría
navegación a una pantalla de detalle).

---

## 🐛 Problemas que tuvimos y cómo se resolvieron

Dejo esto documentado por si en un mes vuelvo a abrir el proyecto y algo
similar pasa de nuevo:

1. **Error `EINVAL: invalid argument, readlink` al correr `pnpm start`**
   Causa: `pnpm` usa symlinks en `node_modules/.pnpm`, y Windows (sobre
   todo dentro de carpetas de OneDrive) no los maneja bien.
   Solución: cambiar a `npm install` / `npm run` en vez de `pnpm`.

2. **`Something went wrong` / `Failed to download remote update` en el celular**
   Causa: el celular no lograba conectarse al Metro Bundler del PC —
   típicamente por estar en redes WiFi distintas, o por aislamiento de
   clientes en el router.
   Solución: verificar que celular y PC estén en la **misma red WiFi**.
   (El modo `--tunnel` es una alternativa si no se puede compartir red,
   pero requiere configurar una cuenta y authtoken de ngrok.)

3. **`This project is incompatible with this version of Expo Go` /
   `Property 'MessageQueue' doesn't exist`**
   Causa: el proyecto usaba **Expo SDK 57**, pero la versión de Expo Go
   instalada en el celular solo soporta hasta **SDK 54**.
   Solución: bajar el proyecto al SDK compatible:
   ```bash
   npx expo install expo@~54.0.36
   npx expo install --fix
   ```
   Y actualizar manualmente `"sdkVersion"` en `app.json` a `"54.0.0"`.

4. **Estructura de carpetas anidada**
   Nota: en este repo particular, el `starter` quedó anidado dentro de
   `week-01-core_components_y_flexbox/3-proyecto/starter/` (replicando
   la ruta del repo del bootcamp) en vez de estar en la raíz del repo de
   entrega. Se mantuvo así intencionalmente. Recordar que todos los
   comandos (`npm install`, `npx expo start`) deben correrse **dentro**
   de esa carpeta `starter`, no en la raíz del repositorio.

---

## ✅ Checklist de requisitos (según rúbrica del profesor Erick)

- [x] Pantalla principal con `ScrollView` con tarjetas
- [x] Mínimo 3 tarjetas con datos coherentes al dominio (tenemos 4 cursos)
- [x] Cada tarjeta muestra: imagen, mínimo 2 textos con estilos distintos, acción `Pressable` con feedback visual
- [x] Header con el nombre del dominio ("EduOnline")
- [x] Estilos con `StyleSheet.create` (sin estilos inline)
- [x] TypeScript con interfaz `Course` definida
- [x] Sin `position: 'absolute'` (solo Flexbox)
- [x] Sin librerías de UI externas (solo componentes nativos de RN)
- [x] `app.json` actualizado con el nombre del dominio


