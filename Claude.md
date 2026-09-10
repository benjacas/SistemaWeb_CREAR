# SistemaWeb_CREAR — Portal Alumno/Tutor dentro del sistema único

Este repo es el **sistema de gestión de la Escuela de Danzas CREAR**, construido
por mi compañera (React + Tailwind), al que ahora se le suma el **portal de
autogestión de Alumno/Tutor** (lo mío) como parte del mismo proyecto — un
solo login, un solo repo de React, rutas separadas por rol.

**Este es un repo distinto al proyecto viejo de la PWA** (Vite vanilla +
Supabase). Ese proyecto quedó descontinuado por decisión de la cátedra
("no usar Supabase" + pasar a stack compartido). El conocimiento del modelo
de datos real que se descubrió ahí (tablas `usuario`, `padre_tutor`, `alumno`,
`grupo_clase`, `cargo`, `calificacion`, etc.) sigue siendo válido como
referencia para diseñar el backend nuevo — se retoma cuando llegue esa etapa,
no antes.

## Contexto: por qué existe este repo así

- **Trabajo sobre un FORK** de este repo, no tengo push directo al original
  todavía (pedí acceso de colaboradora, en trámite). Cualquier cambio se hace
  acá; en algún momento se sincroniza con el repo original de mi compañera
  (PR o merge manual) — no asumir que eso ya pasó.
- **Backend: todavía no existe.** Se va a construir en **FastAPI + Python +
  PostgreSQL + Docker** (decisión de la cátedra, no negociable, reemplaza a
  Supabase). Hasta que exista, **todo el portal trabaja con datos mockeados**
  (ver sección de datos abajo) — no hay ningún backend real al que apuntar.
- **Login único con roles**: un solo login para todo el sistema. El token
  (cuando exista el backend) va a traer el rol del usuario logueado
  (`administrador`, `secretaria`, `profesor`, `alumno`, `tutor`), y cada rol
  ve sus propias rutas. Hoy el login todavía no está conectado a nada real.

## Regla crítica: este repo es COMPARTIDO con el sistema de administración

- **`components/ui/`** (`Button`, `Input`, `Modal`, `Badge`, `Select`,
  `Spinner`, `Table`, `EmptyState`, `ConfirmModal`) y **`context/ToastContext.jsx`**
  son de mi compañera — **reusar tal cual, nunca modificar su comportamiento
  existente**. Si un componente nuevo de UI genérica hace falta (ej. un
  indicador circular de porcentaje), se agrega ahí también, como pieza nueva,
  no se duplica en otro lado.
- **`components/layout/admin/`** (`Header`, `Sidebar`, `Layout`) es el shell
  de escritorio del sistema de administración — **no tocar, no reusar para
  el portal**. El portal es mobile-first con nav inferior, shell propio en
  `components/layout/portal/`.
- **`pages/administrador/`** (o el nombre de carpeta que corresponda una vez
  reorganizado) son las páginas de mi compañera — no tocar.
- **`pages/portal/`** es la carpeta nueva, compartida entre Alumno y Tutor
  (ver sección de roles abajo) — es mi territorio.
- Antes de modificar cualquier archivo fuera de `pages/portal/`,
  `components/layout/portal/`, `context/AlumnoActivoContext.jsx`, `hooks/`,
  `mock/`, `utils/format.js` — parar y avisar, no asumir que es seguro.

## Roles: Alumno y Tutor comparten las mismas páginas

La única diferencia real entre un Alumno logueado directamente y un Tutor es
que el Tutor puede tener más de un alumno vinculado y necesita poder
cambiar entre ellos. Por eso **no hay carpetas separadas `Alumno/` y `Tutor/`**
— una sola `pages/portal/`, con un contexto (`AlumnoActivoContext`) que
expone cuál es el "alumno activo" en cada momento:

```jsx
const { alumnoActivo, setAlumnoActivo, alumnosVinculados } = useContext(AlumnoActivoContext)
```

Si `alumnosVinculados.length <= 1`, ningún selector se muestra — el alumno
directo nunca ve la opción de "cambiar de alumno".

## Estructura de carpetas (portal)

```
src/
├── components/
│   └── layout/
│       └── portal/
│           ├── PortalShell.jsx     # layout general (header + <Outlet/> + nav)
│           ├── PortalHeader.jsx    # logo, campanita notif., ícono perfil, salir
│           └── BottomNav.jsx       # Inicio/Pagos/Asistencia/Grupos/Notas
├── context/
│   └── AlumnoActivoContext.jsx     # NUEVO — ver arriba
├── pages/
│   └── portal/
│       ├── Home.jsx
│       ├── Pagos.jsx
│       ├── Asistencia.jsx
│       ├── Grupos.jsx
│       ├── Evaluaciones.jsx
│       ├── Perfil.jsx
│       ├── Notificaciones.jsx
│       └── SeleccionarAlumno.jsx   # solo si hay +1 alumno vinculado
├── hooks/
│   └── useCargos.js, useAsistencias.js, etc.  # un hook por recurso, ver patrón abajo
├── mock/
│   └── fixtures.js                 # datos de ejemplo, misma forma que va a tener el futuro backend
├── utils/
│   └── format.js                   # funciones puras: formatMoneda, formatFecha,
│                                      badgeEstadoCargo, esCargoVencido, calcularAlertas, etc.
└── routes/
    └── (se integra a las rutas existentes de mi compañera — ver abajo)
```

## Patrón de datos: hooks custom en vez de `conFallback`

Sin backend, cada hook devuelve directo el mock. El día que exista la API de
FastAPI, se cambia el cuerpo del hook (no cada página que lo usa):

```js
// hooks/useCargos.js
import { useState, useEffect } from 'react'
import { cargosDemo } from '../mock/fixtures'

export function useCargos(alumnoId) {
  const [cargos, setCargos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // más adelante: const data = await api.getCargos(alumnoId)
        setCargos(cargosDemo)
      } catch (error) {
        console.warn('[modo demo] cargos falló, usando mock', error)
        setCargos(cargosDemo)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId])

  return { cargos, cargando }
}
```

Un hook por recurso (`useCargos`, `useAsistencias`, `useInscripciones`,
`useEvaluaciones`, `useNotificaciones`, `usePerfilAlumno`). Ninguna página
llama a `fetch` directo.

## Ruteo: React Router, ya en uso por mi compañera

**No sumar una segunda librería de ruteo.** Revisar `AppRoutes.jsx` (o donde
esté definido) existente antes de tocarlo, y agregar las rutas del portal
ahí, envueltas en un guard de rol (`RequireRole`, equivalente al viejo
`guard.js` pero chequeando rol además de sesión). Hoy, sin backend, el login
real no existe — no bloquear la navegación al portal por login hasta que
se arme esa parte; se documenta como pendiente, no se inventa un login falso
nuevo.

## Diseño

- Paleta ya compatible con la del proyecto viejo: `primary: '#6D5AE6'`,
  `primary-dark: '#5647c8'`, `primary-light: '#EEE9FF'` (ya están en el
  `tailwind.config.js` de mi compañera, no se tocan). Falta agregar
  `primary-subtle` (fondo general cálido/crema de los mockups de Figma) —
  se agrega como color nuevo, sin modificar los existentes.
- `sidebar` / `sidebar-end` son del shell de admin — el portal no los usa.
- Mobile-first: pensar cada página del portal para una pantalla de celular
  primero, el shell de admin (sidebar de escritorio) no aplica acá.
- Mockups de referencia: Figma, capturas ya compartidas en la conversación
  de planificación (login, home, calendario, notas, cuotas, asistencia,
  comprobante, notificaciones, perfil). Dos grupos de pantallas de esos
  mockups **no tienen respaldo en el modelo de datos todavía** y quedan
  pausadas hasta coordinar con la otra parte del equipo:
  - Sistema de entradas con mapa de butacas y QR (Eventos) — no hay tablas
    de asientos/entradas en el modelo que se venía usando.
  - "Vestuario" y "Fotos recientes / Galería" — features sin tabla propia.
  Al construir Home, estos dos widgets van con un estado tipo "Próximamente"
  (deshabilitado, visible pero no funcional) en vez de omitirse del todo o
  inventarse datos falsos — mismo criterio que se usó con el botón "Pagar"
  deshabilitado en el proyecto viejo mientras no había integración de pago.

## Estado de avance

- ✅ **Fase 1 — Estructura del portal + Home mockeado** (completada): paleta
  `primary-subtle`, `context/AlumnoActivoContext.jsx`, `mock/fixtures.js`,
  `utils/format.js`, `hooks/useCargos.js` + `hooks/useAsistencias.js`,
  `components/layout/portal/` (`PortalShell`, `PortalHeader`, `BottomNav`),
  `components/ui/RadialProgress.jsx` y `pages/portal/Home.jsx`. Verificado
  con `npm run dev` (ver notas abajo) — Home renderiza sin errores de
  consola dentro de `PortalShell`, y las rutas del sistema de administración
  (`/dashboard`, `/login`) siguen funcionando igual que antes.
- ✅ **Fase 2 — Página de Pagos** (completada): `cargosDemo` extendido con
  casos vencido (`c5`) y parcial (`c6`) para poder ver los cuatro estados de
  badge; `utils/format.js` ahora expone `obtenerBadgeCargo(cargo)` como
  único punto que decide "vencido" (`badgeEstadoCargo` pasó a recibir el
  `estado` en vez del cargo completo — ver nota abajo); `pages/portal/Pagos.jsx`
  con resumen (Pendiente / Al día desde), tarjeta del próximo cargo pendiente
  con botón "Pagar" deshabilitado, e historial con `Badge` de `components/ui/`.
  Ruta `path="pagos"` agregada como hija de `/portal`. Verificado con
  `npm run dev` + Playwright headless: los 6 cargos del mock muestran su
  badge correcto (Pendiente/Pagado×3/Parcial/Vencido), el botón Pagar está
  deshabilitado con tooltip "Integración de pago pendiente", y la navegación
  Home → Pagos → Home por `BottomNav` no rompe nada.
- ⏳ Pendiente: resto de páginas del portal (`Asistencia`, `Grupos`,
  `Evaluaciones`, `Perfil`, `Notificaciones`, `SeleccionarAlumno`), guard de
  rol (`RequireRole`), login real.

### Notas de implementación / ajustes al spec por convenciones reales del repo

- **`components/layout/admin/` no existe como subcarpeta.** `Header.jsx`,
  `Sidebar.jsx` y `Layout.jsx` (el shell de mi compañera) están sueltos
  directo en `components/layout/`, no reorganizados bajo `admin/` como
  sugiere este doc más arriba. No afectó nada de lo construido (el portal
  vive en su propia subcarpeta `components/layout/portal/`, separada), pero
  si en algún momento se reorganiza a `admin/` de verdad, avisar antes.
- **`pages/administrador/` tampoco existe.** Las páginas de mi compañera
  (`Dashboard.jsx`, `Alumnos.jsx`, etc.) están sueltas en `pages/`, sin
  reorganizar. `pages/portal/` se creó igual, como carpeta nueva y separada
  — no hubo conflicto, pero la reorganización que este doc da por hecha
  todavía no pasó.
- **Ruteo del portal: montado en `App.jsx`, fuera del guard de sesión de
  Supabase.** Se agregó `<Route path="/portal">` (con
  `AlumnoActivoProvider` envolviendo `PortalShell`) como rama hermana de
  `/login` y `/`, **no anidada** dentro de la ruta `/` que chequea
  `session`. Es intencional: como no existe login del portal todavía, si se
  anidaba bajo el guard de admin, `/portal` quedaba bloqueado por una
  sesión de Supabase que no tiene nada que ver con Alumno/Tutor. Cuando
  exista `RequireRole`, ahí se decide cómo se guardan ambas ramas.
- **Verificación local requiere `.env` con credenciales de Supabase.** El
  repo no trae `.env`/`.env.local` (están en `.gitignore`) y
  `lib/supabase.js` hace `createClient(undefined, undefined)` si faltan
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, lo cual tira
  `supabaseUrl is required` y rompe el render de **toda** la app (no solo
  admin) porque `App.jsx` importa `supabase` de forma incondicional. Esto
  es preexistente, no algo que introdujo el portal — pero cualquiera que
  clone el repo sin `.env` real se va a encontrar con pantalla en blanco en
  cualquier ruta, incluida `/portal`. Para probar localmente sin backend
  real alcanza con un `.env.local` con valores placeholder (no hace falta
  que apunten a un proyecto Supabase real, `createClient` no valida
  conectividad al construirse).
- **`badgeEstadoCargo` cambió de firma en la Fase 2.** Antes recibía el
  cargo completo y decidía "vencido" internamente; ahora recibe solo
  `estado` (`'pagado' | 'pendiente' | 'parcial'`) y no sabe nada de fechas.
  `esCargoVencido`/`obtenerBadgeCargo` son los únicos que deciden "vencido"
  — un solo lugar, como pedía el spec. No había otros llamadores todavía
  (Home no la usa), así que no rompió nada, pero si alguien busca la firma
  vieja en un commit previo, ya no existe.
- **`esCargoVencido` solo aplica a cargos `'pendiente'`.** El mock de
  prueba (`c6`, estado `'parcial'`) tiene `fecha_vencimiento` en el pasado
  a propósito, para poder ver el badge "Parcial" — si `esCargoVencido`
  hubiera evaluado cualquier estado no pagado, ese caso se veía como
  "Vencido" y nunca se probaba el badge parcial. Se restringió a
  `estado === 'pendiente'`; queda como decisión temporal hasta que se
  defina la regla real de mora para cargos parciales.
- **Bug de zona horaria encontrado y corregido en `esCargoVencido`:**
  comparaba contra `new Date().toISOString().slice(0,10)`, que es la fecha
  en UTC. En Argentina (UTC-3) eso hace que "hoy" salte al día siguiente
  ya pasadas las 21hs locales, marcando cargos como vencidos casi un día
  antes de tiempo. Se cambió a un cálculo de fecha local
  (`hoyLocalISO()` en `utils/format.js`). No estaba en el spec de esta
  tarea, pero se corrigió al detectarlo durante la verificación con
  Playwright porque afectaba directamente el criterio que esta fase pedía
  centralizar.

## Flujo de trabajo

La planificación se define en una conversación aparte con Claude en
claude.ai — las tareas llegan ya especificadas. Si algo del spec no cierra
con el código real del repo (un componente que no existe, una convención
distinta a la documentada acá), avisar y frenar en vez de asumir — esto ya
costó tiempo real una vez en el proyecto anterior.