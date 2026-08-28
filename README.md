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
| **02** | _(próximamente)_ | `week-02` | ⏳ Pendiente |
| **03** | _(próximamente)_ | `week-03` | ⏳ Pendiente |
| **04** | _(próximamente)_ | `week-04` | ⏳ Pendiente |

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