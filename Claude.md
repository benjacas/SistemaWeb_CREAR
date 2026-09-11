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
  `Spinner`, `Table`, `EmptyState`, `ConfirmModal`, `RadialProgress` [nuevo],
  `Avatar` [nuevo]) y **`context/ToastContext.jsx`**
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
directo nunca ve la opción de "cambiar de alumno". Esto es sobre un
selector forzado (algo tipo `SeleccionarAlumno.jsx` en el flujo de login, o
un switcher en el header) — la sección "Mis alumnas" dentro de `Perfil.jsx`
es otra cosa: una lista informativa dentro de una pantalla a la que el
usuario entra por su cuenta, así que ahí se muestra siempre, tenga 1 o más
alumnos vinculados (con 1 solo, no hay nada para cambiar, pero tampoco
hace daño mostrarla).

## Estructura de carpetas (portal)

```
src/
├── components/
│   └── layout/
│       └── portal/
│           ├── PortalShell.jsx     # layout general (header + <Outlet/> + nav)
│           ├── PortalHeader.jsx    # Avatar (→ Perfil) + campanita notif.
│           └── BottomNav.jsx       # Inicio/Pagos/Asistencia/Clases/Evaluaciones
├── context/
│   └── AlumnoActivoContext.jsx     # NUEVO — ver arriba
├── pages/
│   └── portal/
│       ├── Home.jsx
│       ├── Pagos.jsx
│       ├── Asistencia.jsx
│       ├── Clases.jsx
│       ├── Horarios.jsx            # calendario mensual + "Próximos" (antes vivía en Clases.jsx)
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

## Convenciones de código

- **Cualquier cálculo de "hoy" usa `hoyLocalISO()` (`utils/format.js`),
  nunca `new Date().toISOString()` directo** — este bug ya apareció 3
  veces en el proyecto (`esCargoVencido` en Pagos, `estadoAptoFisico` en
  Perfil, `proximosItems` en el calendario de Clases/Horarios).
  `toISOString()` da la fecha en UTC, que en Argentina (UTC-3) queda
  adelantada durante la noche — cualquier comparación de "¿es hoy o ya
  pasó?" hecha contra eso corre el resultado casi un día en el peor caso.

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
    de asientos/entradas en el modelo que se venía usando. La tarjeta
    "Próx. evento" de Home sí queda (usa `proximoEventoDemo`, dato simple
    sin tabla de entradas/butacas) — lo pausado es el flujo de compra con
    mapa de butacas y QR, no la tarjeta informativa.
  - "Vestuario" y "Fotos recientes / Galería" — features sin tabla propia.
    **Se sacaron del todo de Home** (ni siquiera en estado "Próximamente")
    — decisión revisada en la fase de pulido, ver "Decisiones de producto"
    abajo. El criterio de "Próximamente" (deshabilitado, visible pero no
    funcional) sigue vigente para otras features pendientes de modelo de
    datos que si se agreguen a futuro — acá se decidió directamente no
    mostrar el placeholder porque no aportaba nada sin fecha de entrega
    prevista.

## Decisiones de producto

- **Las tarjetas de Home son accesos directos a sus páginas.** Cuando una
  tarjeta del grid tiene una página real detrás, es clickeable y navega
  ahí (ej. "Cuotas pendientes" → `/portal/pagos`). Si todavía no tiene
  página propia (ej. "Clases por semana"), la tarjeta queda visualmente
  igual pero sin `onClick` ni cursor de puntero — no se simula
  interactividad que no lleva a ningún lado.
- **Eventos se accede desde una tarjeta de Home, no desde el nav inferior.**
  El `BottomNav` tiene 5 slots fijos (Inicio/Pagos/Asistencia/Clases/Evaluaciones)
  y no hay lugar para un sexto ítem "Eventos". La tarjeta "Próx. evento"
  (ancho completo, segunda fila del grid) es la puerta de entrada — hoy es
  informativa nomás (no clickeable todavía, no hay página de Eventos), pero
  el lugar ya está reservado para cuando exista.

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
- ✅ **Fase 3 — Pulido de Home** (completada): se sacaron del todo la
  tarjeta "Vestuario" y la sección "Fotos recientes" (ver arriba); grid
  reacomodado a 3 tarjetas (`grid-cols-2`, Cuotas + Horarios en la primera
  fila, Próx. evento con `col-span-2` en la segunda); tarjeta "Cuotas
  pendientes" ahora es clickeable (`useNavigate` → `/portal/pagos`, con
  `hover:shadow-card-md`); Horarios y Próx. evento quedan sin `onClick` a
  propósito. Verificado con Playwright: sin Vestuario/Fotos recientes en el
  DOM, click en Horarios/Próx. evento no navega, click en Cuotas navega a
  Pagos, sin errores de consola.
- ✅ **Fase 4 — Pulido de Pagos** (completada): `cargosDemo` (cargos
  pagados) suma `metodo` y `comprobante`; `utils/format.js` agrega
  `infoMetodoPago(metodo)` y el color de `parcial` en `badgeEstadoCargo` se
  separó del de `pendiente`; `components/portal/ComprobanteModal.jsx`
  (nuevo) sobre el `Modal` de `components/ui/`, con ícono de check verde,
  número de comprobante, alumno, concepto, método (con ícono), fecha, total
  y botón "Compartir" (`navigator.share()` con fallback a
  `navigator.clipboard`); las filas pagadas del historial de
  `pages/portal/Pagos.jsx` abren el modal al tocarlas; la tarjeta de
  "próximo cargo pendiente" se reemplaza por el `EmptyState` de
  `components/ui/` cuando el total pendiente (pendiente + parcial) da $0.
  Verificado con Playwright: los 3 comprobantes muestran los datos
  correctos de cada cargo, el badge de "Parcial" es visualmente distinto de
  "Pendiente"/"Vencido", y se probó vaciando `cargosDemo` de pendientes
  (viendo el `EmptyState`) y revirtiendo el mock después — confirmado con
  `git diff` que quedó igual que antes salvo los campos nuevos del paso 1.
- ✅ **Fase 5 — Página de Asistencia** (completada): `mock/fixtures.js`
  suma `grupoAsistenciaDemo` (`{ nombre, mesLabel }`), `umbralAsistenciaDemo`
  (75, mapea a `configuracion_sistema.umbral_asistencia_alerta` del modelo
  real) y `asistenciasDemo` pasa a tener `diaLabel` en vez de `grupo` por
  fila (un solo grupo por vista, no hace falta repetirlo en cada registro);
  `utils/format.js` suma `evaluarAsistencia(porcentaje, umbral)`;
  `pages/portal/Asistencia.jsx` (nueva) con resumen del mes (fondo verde
  claro), detalle por clase con `Badge` (✓ Presente / Ausente) y footer con
  el umbral + mensaje de `evaluarAsistencia`. La tarjeta de asistencia en
  Home ahora es clickeable (mismo criterio que "Cuotas") y usa
  `grupoAsistenciaDemo` en vez de leer `grupo` de la primera asistencia
  (ese campo ya no existe en el mock). Ruta `path="asistencia"` agregada;
  `BottomNav` ya apuntaba ahí, no hizo falta tocarlo. Verificado con
  Playwright: el % coincide entre Home (83%) y Asistencia (83%, mismo hook
  y mismo cálculo), Home → Asistencia navega bien, y se probó subiendo
  `umbralAsistenciaDemo` a 90 (por encima del 83% del mock) para ver el
  mensaje "por debajo de ese mínimo" — revertido después, confirmado con
  `git diff`.
- ✅ **Fase 6 — Pulido de Asistencia: color por umbral + selector de mes**
  (completada): `asistenciasDemo` ahora cubre Septiembre (por encima del
  umbral) y Agosto (por debajo, para probar el caso ámbar); se sacó
  `diaLabel` (era temporal, anotado como tal en la Fase 5) — el día de
  clase se calcula de verdad con `formatDiaClase(fecha)`, que además
  corrigió un error que tenía el mock viejo (`diaLabel: 'Miércoles 03/09'`
  para el 2026-09-03, que en realidad es jueves). `grupoAsistenciaDemo`
  también pierde `mesLabel` (quedó solo `{ nombre }`) — con pestañas de mes
  reales, un mes fijo en el subtítulo del header quedaba desactualizado en
  cuanto se cambiaba de pestaña. `utils/format.js` suma
  `agruparAsistenciasPorMes()`, `formatMesLabel()` (portada del duplicado
  que ya existía sin exportar en `Pagos.jsx` — `Pagos.jsx` ahora usa la
  versión compartida) y `evaluarAsistencia()` gana un campo `classes`
  (verde/ámbar según `alCorriente`). `pages/portal/Asistencia.jsx` suma
  pestañas de mes (más antiguo a más reciente, mes más reciente
  seleccionado por defecto) y todo el bloque de resumen + footer + el
  número grande reacciona al mismo criterio de color. Home también pasa a
  mostrar el mes más reciente (antes promediaba todas las asistencias del
  mock, que ahora abarcan dos meses) y le pasa `umbral={umbralAsistenciaDemo}`
  explícito a `RadialProgress` en vez de confiar en su default interno, para
  que Home y Asistencia no puedan desincronizarse aunque cambie el umbral.
  `RadialProgress.jsx` no necesitó cambios de código — ya recibía `umbral`
  como prop con default 75 desde la Fase 1, exactamente como pedía esta
  fase. Verificado con Playwright: Septiembre se ve verde (83%, por encima
  del 75%), Agosto se ve ámbar (40%, por debajo), mismo criterio de color
  en ambos sin tocar nada a mano; Home sigue mostrando 83% (coincide con la
  pestaña de Septiembre); Pagos se probó de nuevo tras el cambio de
  `formatPeriodo`→`formatMesLabel` y sigue sin errores.
- 💡 **Decisiones pendientes:** justificar inasistencias
  (`asistencia.justificada` / `asistencia.motivo`, campo nuevo) — a
  proponerle a la compañera, no se construye todavía.
- ✅ **Fase 7 — Clases (ex "Grupos") + inscripción a clases nuevas**
  (completada): `pages/portal/Clases.jsx` (nueva, no un renombre — ver nota
  abajo) con dos secciones, "Mis clases" (click abre
  `components/portal/ClaseDetalleModal.jsx`, nuevo, sobre el `Modal` de
  `components/ui/`) y "Clases disponibles" (cada una con `estadoCupo()` y
  botón según su estado: "Inscribirme" / "Anotarme en lista de espera" /
  estado ya solicitado, sin volver a permitir solicitar). `hooks/useClases.js`
  (nuevo) sigue el patrón de los demás hooks y suma
  `solicitarInscripcion(claseId, tipo)`, que por ahora solo actualiza estado
  local. Los toasts van con `useToast()` de `context/ToastContext.jsx` (de
  mi compañera, reusado tal cual). Ruta `path="clases"` en vez de
  `path="grupos"`; `BottomNav` actualizado (label "Grupos"→"Clases", mismo
  ícono `Users`). Verificado con Playwright: las 3 clases del mock muestran
  los 3 casos de `estadoCupo()` (normal, cupo lleno, últimos lugares —
  ajuste de mock, ver nota abajo), "Inscribirme" en Jazz dispara el toast y
  cambia su tarjeta a "Pendiente de confirmación", "Anotarme en lista de
  espera" en Danza Contemporánea hace lo mismo con "En lista de espera" y
  reactiva la opacidad de la tarjeta (ya no está "deshabilitada", tiene un
  estado real), sin errores de consola.
- ✅ **Fase 8 — Evaluaciones (ex "Notas")** (completada): mismo caso que
  Clases — no había nada que renombrar, `pages/portal/Notas.jsx` nunca
  existió (ver nota abajo). `evaluacionesDemo` en `mock/fixtures.js` (2
  exámenes de Profesorado, "Danza Clásica"); `utils/format.js` suma
  `promedioNotas`, `promedioExamen`, `promedioGeneral`; `hooks/useEvaluaciones.js`
  (nuevo, mismo patrón que los demás — no estaba en los pasos numerados de
  esta tarea pero se agregó para seguir la regla ya documentada de "un hook
  por recurso, ninguna página importa el mock directo"). `pages/portal/Evaluaciones.jsx`
  filtra siempre por `esProfesorado === true` (aunque hoy el mock no tenga
  ningún examen recreativo), agrupa por `grupoNombre` sin asumir uno solo
  (una "sección" completa por grupo: subtítulo + tarjeta de promedio general
  + lista de exámenes), cada examen con su promedio y chips de criterio+nota
  vía `Badge`, mostrando `observaciones` solo donde el mock las tiene
  cargadas. `BottomNav`: label "Notas"→"Evaluaciones" (la ruta
  `/portal/evaluaciones` ya apuntaba bien, no era un placeholder). Se
  revisó si "Evaluaciones" entraba en el ancho del tab a `text-[11px]`
  (mismo tamaño que los demás) — entra perfecto en una línea, no hizo falta
  achicarla a `text-[10px]` como sugería el enunciado. Verificado con
  Playwright: promedio de "Examen Final 2026" = 8.7 (9+8+9)/3, "Examen
  Parcial 2026" = 8 (8+8+8)/3, promedio general del grupo = 8.3
  ((9+8+9+8+8+8)/6) — los tres coinciden con el cálculo manual; la
  observación "Mejoró mucho el timing" aparece solo bajo el chip de
  "Ritmo" del Examen Final, en ningún otro chip; sin errores de consola.
- ✅ **Fase 9 — Header consolidado (avatar → Perfil) + página de Perfil**
  (completada): `familiaDemo` suma `dni`; `alumnoActivoDemo` se elimina —
  `AlumnoActivoContext` ahora inicializa `alumnosVinculados` desde
  `alumnosVinculadosDemo` (nuevo, con `grupoPrincipal`/`activo` por alumno)
  y `alumnoActivo` toma el que tenga `activo: true` (fallback al primero).
  `utils/format.js` suma `iniciales()`. `components/ui/Avatar.jsx` (nuevo,
  compartido — ver nota abajo). `PortalHeader.jsx` pierde el círculo "C",
  el ícono de perfil y el botón "Salir" — queda `<Avatar>` (click → `/portal/perfil`)
  a la izquierda y la campanita sola a la derecha. `pages/portal/Perfil.jsx`
  (nueva): avatar grande + nombre + DNI, sección "Mis alumnas" (fila
  clickeable que llama `setAlumnoActivo`, con check en la activa — la
  estructura soporta N alumnos aunque el mock tenga 1 solo), lista de
  accesos sin destino real (placeholders a propósito, ver nota abajo) y
  botón "Cerrar sesión" que redirige a `/login` sin lógica de sesión real
  todavía. Ruta `path="perfil"` agregada. Verificado con Playwright: el
  header de las 6 páginas del portal (Home, Pagos, Asistencia, Clases,
  Evaluaciones, Perfil) muestra solo avatar + campanita, en ningún lado
  aparece ya "Salir" salvo dentro de Perfil; tocar el avatar desde
  cualquier página navega a `/portal/perfil`; tocar la fila de Sofía y
  después "Cerrar sesión" no rompe nada y termina en `/login`; sin errores
  de consola.
- ✅ **Fase 10 — Pulido de Perfil** (completada): `alumnosVinculadosDemo`
  suma `telefono`/`email`/`domicilio`/`aptoFisicoPresentado`/`aptoFisicoFecha`;
  nuevo `configInstitucionalDemo.plazoDiasAptoFisico`. `utils/format.js`
  suma `estadoAptoFisico()` (con el mismo cuidado de fecha local que
  `esCargoVencido` — ver nota abajo). `AlumnoActivoContext` gana
  `actualizarAlumnoActivo(cambios)`, que actualiza tanto `alumnoActivo`
  como su entrada en `alumnosVinculados` (en memoria, sin backend). Fila
  "Mis alumnas" ahora muestra el estado del apto físico en verde/ámbar
  bajo el grupo principal. Nueva fila "Editar datos de contacto" (no
  existía ninguna fila de contacto antes — se agregó, no se modificó una
  existente) que abre `components/portal/EditarContactoModal.jsx` (nuevo,
  con `Input` de `components/ui/`) precargado con los datos del alumno
  activo; "Guardar" llama `actualizarAlumnoActivo` y dispara un toast.
  "Métodos de pago guardados" y "Ayuda y soporte" pasan a mostrar un
  `Badge` "Próximamente" en vez de la flecha, sin cursor de puntero.
  "Cambiar clave de acceso" y "Notificaciones" quedan como estaban — no
  entraban en el alcance de esta fase (ver nota abajo). "Cerrar sesión"
  ahora abre un `ConfirmModal` de `components/ui/` antes de redirigir.
  Verificado con Playwright: modal de contacto precargado con los valores
  del mock, "Guardar" actualiza el estado (confirmado reabriendo el modal
  y viendo el valor nuevo) y dispara el toast; 2 badges "Próximamente"
  presentes, `cursor: auto` en esas filas vs. `cursor: pointer` en
  "Editar datos de contacto"; "Cerrar sesión" abre el modal de
  confirmación, "Cancelar" no navega, "Confirmar" sí lleva a `/login`; se
  probó cambiando `aptoFisicoFecha` a `2024-01-01` para ver el caso
  "vencido" (ámbar, "vencido desde el 31 de dic de 2024 — hay que
  renovarlo") y se revirtió después — confirmado con `git diff`; sin
  errores de consola.
- ✅ **Fase 11 — Página de Notificaciones + badge en la campanita**
  (completada): `notificacionesDemo` (5 notificaciones, incluye el tipo
  nuevo `'horario'` — ver nota abajo); `utils/format.js` suma
  `infoTipoNotificacion()` (íconos SVG en vez de emoji, mismo criterio que
  `infoMetodoPago` — ver nota abajo) y `formatFechaRelativa()`;
  `hooks/useNotificaciones.js` (nuevo) con `marcarLeida(id)` y
  `marcarTodasLeidas()`. **Cambio de arquitectura no pedido explícitamente
  pero necesario:** `PortalShell.jsx` ahora llama `useNotificaciones()` una
  sola vez y comparte ese estado con `PortalHeader` (prop `noLeidas`) y con
  la página de Notificaciones vía `<Outlet context={...}>` /
  `useOutletContext()` de React Router — ver nota abajo, el enunciado decía
  "mismo patrón que los demás" (hook con estado local propio), pero dos
  instancias independientes del hook nunca se hubieran sincronizado entre
  el header y la página. `pages/portal/Notificaciones.jsx` (nueva): no
  leídas primero (ordenadas, no solo destacadas) con fondo `primary-light`
  + punto; tocar una la marca leída y abre el `Modal` de `components/ui/`
  con el detalle + CTA según `infoTipoNotificacion`/`CTA_POR_TIPO` (este
  último definido en la página, no en `format.js` — es ruteo, no
  formato); "evento" sin CTA a propósito (Eventos sigue pausado). Ruta
  `path="notificaciones"` agregada; el bell ahora navega ahí (no estaba
  pedido explícitamente, pero sin eso la página quedaba inalcanzable, ya
  que no tiene slot en `BottomNav`). Verificado con Playwright, navegando
  siempre dentro de la SPA (nunca con recarga completa, que resetea el
  estado en memoria — ver nota abajo): las 5 notificaciones muestran su
  tipo/color/ícono correcto; badge inicial en "2"; tocar "Tu cuota vence en
  3 días" abre el modal con CTA "Ver mis pagos" y navega a `/portal/pagos`;
  volviendo a Home vía `BottomNav`, el badge baja a "1"; tocar "Cambio de
  horario" y su CTA "Ver mis clases" navega a `/portal/clases` y el badge
  desaparece del todo; "Recordatorio" (evento) no tiene botón de acción en
  el modal; "Marcar todas" desaparece cuando no queda nada sin leer; sin
  errores de consola.
- ✅ **Fase 12 — Calendario dentro de Clases** (completada):
  `misClasesDemo` suma `horarios` (array estructurado por `diaSemana`,
  sin acentos) sin sacar el campo `horario` de texto libre (lo sigue
  usando "Mis clases"); nuevo `eventosCalendarioDemo`. `utils/format.js`
  suma `ocurrenciasDeClaseEnMes()` y `proximosItems()` (con el mismo fix
  de fecha local que ya se aplicó varias veces — ver nota abajo);
  `hoyLocalISO()` pasa a exportarse para reusarla ahí en vez de duplicar
  la lógica. `components/portal/CalendarioMensual.jsx` (nuevo, no va a
  `components/ui/` compartido a propósito — ver nota abajo): grilla
  L-D, punto violeta (clase) / rosa (evento) por día, hoy resaltado con
  anillo, ‹ › para cambiar de mes. `pages/portal/Clases.jsx` suma el
  calendario y "Próximos" arriba de "Mis clases"; la tarjeta "Horarios" de
  Home ahora navega a `/portal/clases` (mismo criterio que Cuotas y
  Asistencia). Verificado con Playwright: Septiembre 2026 muestra puntos
  violeta en los 9 lunes/miércoles de Danza Clásica y el 30/09 muestra
  ambos puntos superpuestos (coincide con la Gala); "Próximos" lista 5
  ítems en orden cronológico (14, 16, 21, 23, 28/09, todos "Danza
  Clásica" — ver nota abajo sobre por qué la Gala no entra en el top 5
  hoy); cambiar a Octubre recalcula los puntos correctamente (mismos
  días de semana, sin punto rosa) y volver a Septiembre los recupera
  intactos; "Próximos" no cambia al mover el calendario (es independiente,
  ver nota abajo); el modal de detalle de "Mis clases" sigue funcionando
  igual después del cambio de forma del mock; sin errores de consola.
- ✅ **Fase 13 — Horarios como página propia + 2 arreglos** (completada):
  `proximosItems()` sube su corte default de 5 a 8. `pages/portal/Horarios.jsx`
  (nueva) — todo lo que la Fase 12 había puesto arriba de "Mis clases" en
  `Clases.jsx` (el `<CalendarioMensual/>`, "Próximos" y el `useState` del
  mes que los controla) se trasladó tal cual a este archivo nuevo.
  `Clases.jsx` queda solo con "Mis clases"/"Clases disponibles" más una
  tarjeta "Ver calendario de horarios →" arriba de todo que navega a
  `/portal/horarios`. La tarjeta "Horarios" de Home apunta directo ahí en
  vez de a `/portal/clases`. Ruta `path="horarios"` agregada. Se sumó
  además la sección "Convenciones de código" a este documento con la regla
  de `hoyLocalISO()` (ya había aparecido 3 veces sin ella). Verificado con
  Playwright: `/portal/horarios` muestra el calendario funcionando igual
  que en la Fase 12; con el corte en 8, la Gala Anual CREAR (30/09) ahora
  sí aparece en "Próximos" (séptimo ítem, después de las 6 ocurrencias de
  Danza Clásica hasta esa fecha — el 30/09 es miércoles, así que ese día
  cuenta doble: clase y evento); `Clases.jsx` quedó liviana, sin rastro del
  calendario, con la tarjeta de acceso funcionando en los dos sentidos
  (Clases → Horarios y Home → Horarios); sin errores de consola.
- ⏳ Pendiente: `SeleccionarAlumno.jsx`, guard de rol (`RequireRole`),
  login real.

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
- **`infoMetodoPago()` devuelve un `icono` como string, no un componente.**
  El spec sugería emojis (💵🏦💳) salvo que ya hubiera un sistema de íconos
  SVG propio — no hay un componente de íconos dedicado en `components/ui/`,
  pero **todo el repo** (admin y portal, cada página) ya usa `lucide-react`
  de forma consistente y no hay un solo emoji en ningún lado. Meter emojis
  al lado de eso rompía esa consistencia, así que se usó `lucide-react`
  igual. Para que `utils/format.js` siga siendo puro (sin React),
  `infoMetodoPago` devuelve una clave (`'banknote' | 'landmark' |
  'credit-card'`) en vez del componente — el mapeo clave→ícono vive en
  `components/portal/ComprobanteModal.jsx` (`IconoMetodoPago`, export
  nombrado que también usa `Pagos.jsx` para no duplicarlo).
- **El color de `parcial` en `badgeEstadoCargo` (`bg-blue-50 text-blue-700`)
  no es el que se ve en pantalla.** `Pagos.jsx` renderiza los badges con el
  componente `Badge` de `components/ui/` (no con las clases crudas de
  `badgeEstadoCargo`), mapeando la etiqueta a uno de los 5 colores fijos de
  `Badge` (`Parcial` → `color="blue"`, que en `Badge.jsx` es
  `bg-primary-light`/violeta, no el azul literal de Tailwind). Las clases
  que devuelve `format.js` quedan como dato puro disponible para quien
  renderice sin pasar por `Badge`; visualmente "Parcial" ya se distingue
  bien de "Pendiente" (ámbar) y "Vencido" (rojo) por el color de `Badge`.
  No se tocó `Badge.jsx` para agregar un color azul literal — es de mi
  compañera, y el criterio de "reusar tal cual" pesó más que igualar el
  hex exacto que sugería el spec.
- **`components/portal/` es una carpeta nueva**, distinta de
  `components/layout/portal/`. La convención que quedó: layout/shell del
  portal (`PortalShell`, `PortalHeader`, `BottomNav`) va en
  `components/layout/portal/`; componentes de una página específica del
  portal (como `ComprobanteModal`, propio de Pagos) van en
  `components/portal/`, sin `layout/`.
- **Badge "Ausente" usa `color="red"`, no un rosa literal.** El spec de
  Asistencia pedía "Ausente rosa" — `Badge.jsx` no tiene un color rosa en
  su paleta fija (green/red/yellow/blue/gray), y su `red`
  (`bg-red-50 text-red-600`) ya es un tono rosado/suave, no un rojo fuerte.
  Mismo criterio que con "Vencido" en Pagos: no se tocó `Badge.jsx` para
  agregar una variante nueva, se usó la más parecida de las que ya existen.
- **"Renombrar Grupos.jsx → Clases.jsx" no era un renombre real.** El spec
  de esta fase asumía un `pages/portal/Grupos.jsx` con una sección "Mis
  clases" y un modal de detalle ya construidos en una fase anterior — nunca
  se construyeron (las fases previas fueron Home, Pagos, Asistencia
  nomás). Lo único que existía con el nombre "Grupos" es
  `src/pages/Grupos.jsx`, el CRUD de administración de grupos de mi
  compañera — totalmente distinto (gestiona altas/bajas de grupos con
  cupo/profesor, no una vista de alumno), y fuera de mi territorio, no se
  tocó. Se construyó `pages/portal/Clases.jsx` y
  `components/portal/ClaseDetalleModal.jsx` de cero en vez de renombrar
  nada. La ruta admin `path="grupos"` (`src/pages/Grupos.jsx`) sigue
  intacta — coexiste sin conflicto con `path="clases"` del portal.
- **`cupoDisponible` de Jazz (`g2`) es 2 en el mock, no 3 como en el
  enunciado original.** Con 3, `estadoCupo()` lo clasificaba como
  "3 lugares disponibles" (caso normal) — igual que Folklore — y el caso
  "¡Últimos N lugares!" nunca aparecía en la demo, aunque el pedido de
  confirmación final pedía ver los 3 casos (normal/lleno/últimos lugares)
  en las 3 clases del mock. Se bajó a 2 para que los 3 casos se vean de
  verdad, sin tocar el umbral (`<= 2`) de `estadoCupo()` — ese vino dado
  literal en el spec.
- **El toast de `ToastContext` se superpone un poco al `BottomNav` en el
  layout mobile del portal.** El contenedor de toasts es
  `fixed bottom-6 right-6`, pensado originalmente para el shell de
  escritorio del admin. Es un componente de mi compañera, reusado tal cual
  sin tocarlo — el toast se ve y se lee bien igual, pero queda anotado acá
  por si en algún momento se quiere ajustar su posición para mobile (eso
  sería tocar `context/ToastContext.jsx`, fuera de mi territorio sin
  avisar primero).
- **"Renombrar Notas → Evaluaciones" tampoco era un renombre real** —
  mismo caso que Clases/Grupos. No había ningún `pages/portal/Notas.jsx`
  (ni con ningún otro nombre): la única pieza que ya existía con "Notas"
  era el label del `BottomNav`, que sí apuntaba a la ruta correcta
  (`/portal/evaluaciones`) desde que se creó — así que ese link nunca fue
  un placeholder roto, solo tenía el label viejo. Se construyó
  `pages/portal/Evaluaciones.jsx` de cero.

## Decisiones de producto (cont.)

- **Cupo por clase (`cupoDisponible`/`capacidad`) está mockeado y sin
  confirmar contra el schema real.** No hay certeza todavía de que el
  backend nuevo (FastAPI) vaya a modelar el cupo de un grupo exactamente
  así (dos números sueltos) — podría terminar siendo calculado
  (`capacidad - inscriptos.count()`) en vez de un campo propio. No bloquea
  construir la UI del portal ahora, pero hay que confirmar la forma real
  antes de conectar `useClases` a la API.
- **Flujo de inscripción / lista de espera — decisión de producto ya
  tomada, no volver a discutirla al conectar el backend:** el alumno/tutor
  nunca queda inscripto de forma directa al tocar un botón — siempre
  genera una *solicitud* (`'inscripcion'` o `'lista_espera'`) que la
  academia confirma después. Por eso el botón nunca dice "Inscribirse"
  sin más, y el estado post-click es "Pendiente de confirmación" /
  "En lista de espera", nunca "Inscripto". Una vez que hay una solicitud
  activa para una clase, no se puede volver a solicitar (ni cambiar de
  "lista de espera" a "inscripción" ni viceversa) hasta que la academia
  resuelva esa solicitud — hoy eso solo se resetea si se recarga la
  página (es local al hook), el reset real va a venir del backend cuando
  la solicitud cambie de estado.
- **`Avatar` quedó en `components/ui/`, compartido — no específico del
  portal.** Es una pieza de UI genérica (círculo con iniciales) igual que
  `RadialProgress`. Si el sistema de administración quiere mostrar
  avatares de usuarios (admin/profesor/etc.) en vez de sus círculos con
  iniciales hardcodeados a mano (`Header.jsx`, `Dashboard.jsx` admin ya
  arman ese mismo círculo con `style={{ background: 'linear-gradient(...)' }}`
  inline en cada lugar que lo necesitan), este componente lo resuelve una
  sola vez.
- **Las filas de "Cambiar clave de acceso", "Métodos de pago guardados",
  "Ayuda y soporte" y "Notificaciones" en `Perfil.jsx` son placeholders
  visuales a propósito, no funcionalidad pendiente de esta tarea puntual.**
  No hay páginas de destino para ninguna todavía. Desde la Fase 10,
  "Métodos de pago guardados" y "Ayuda y soporte" tienen un `Badge`
  "Próximamente" (sin cursor de puntero) — visualmente distinguibles de las
  filas que sí funcionan. "Cambiar clave de acceso" y "Notificaciones"
  siguen con el tratamiento viejo (ícono + flecha, sin `onClick`) porque no
  entraban en el alcance de la Fase 10 — no se tocaron por decisión
  explícita del spec de esa fase, no por descuido; si en algún momento se
  quiere el mismo badge ahí, es un cambio de una línea cada una. No
  confundir con deuda técnica: son UI intencionalmente inerte, cada una se
  activa cuando exista la pantalla real detrás.
- **`estadoAptoFisico()` se adaptó para parsear la fecha en horario local
  (`${fecha}T00:00:00`), no como vino literal en el spec
  (`new Date(alumno.aptoFisicoFecha)`).** Mismo bug de fondo que ya se
  encontró y corrigió en `esCargoVencido` (Fase 2): un `new Date()` sobre
  un string `'YYYY-MM-DD'` sin hora se interpreta en UTC, y
  `getDate()`/`setDate()` operan en hora local — mezclar los dos corre la
  fecha de vencimiento calculada hasta casi un día en Argentina (UTC-3).
  Se aplicó la misma disciplina que ya usa el resto de `format.js`.
- **El mensaje de `estadoAptoFisico()` en "Mis alumnas" no lleva
  `truncate`.** Se probó primero con `truncate` (como las otras líneas de
  esa fila) y el caso "vencido" cortaba el mensaje justo antes de
  "— hay que renovarlo", la parte más importante. Se cambió a
  `leading-snug` para que haga wrap en 2 líneas en vez de cortarse.
- **`useNotificaciones()` no puede vivir como estado local independiente en
  dos componentes a la vez** (el header y la página de Notificaciones) —
  cada llamada a `useState` es su propia copia, así que marcar una
  notificación leída en la página nunca iba a mover el contador de la
  campanita si cada uno tenía su propia instancia del hook. Se resolvió
  levantando la única llamada al hook a `PortalShell.jsx` (el ancestro común
  de header y `<Outlet/>`) y repartiendo ese mismo objeto de estado hacia
  abajo: como prop (`noLeidas`) a `PortalHeader`, y como
  `<Outlet context={notificacionesApi}>` hacia la página, que lo lee con
  `useOutletContext()` de React Router (ya era una dependencia, no se sumó
  nada nuevo). El hook en sí (`useNotificaciones.js`) sigue teniendo la
  misma forma que los demás — la diferencia es *dónde* se lo llama, una
  sola vez arriba en vez de una vez por componente.
- **`infoTipoNotificacion()` devuelve claves de ícono, no emojis** — mismo
  criterio y misma razón que `infoMetodoPago()` en la Fase 2 (Pagos): el
  spec sugería emojis (💳📅⭐🎭✅), pero todo el repo usa `lucide-react` de
  forma consistente y no hay un solo emoji en ningún lado. El mapeo
  clave→ícono vive en `Notificaciones.jsx` (único consumidor por ahora),
  no en un archivo compartido — a diferencia de `IconoMetodoPago`, que sí
  se exporta porque lo usan dos páginas (`Pagos.jsx` y `ComprobanteModal.jsx`).
- **Verificar esta fase requirió navegar siempre por client-side routing
  (clicks dentro de la app), nunca con `page.goto()` a mitad de la prueba.**
  Como el estado de notificaciones vive en memoria (en `PortalShell`, sin
  backend), una recarga completa de la página lo resetea a los datos
  originales del mock — cualquier verificación que use `page.goto()` para
  "volver a Home" en medio de una prueba va a mostrar el badge sin
  actualizar y hace parecer que "marcar leída" no funciona, cuando en
  realidad el bug está en la prueba, no en la app.
- **`CalendarioMensual` es un componente controlado, no dueño de su propio
  mes.** El spec decía "Botones ‹ › para cambiar de mes (estado local del
  componente, no hace falta persistirlo)", que se podía leer como "el mes
  vive adentro de `CalendarioMensual.jsx`". Pero el componente recibe
  `ocurrencias` ya filtradas para un mes específico por props — si el mes
  mostrado viviera como estado interno del componente, al tocar ‹ › no
  habría forma de pedirle a `Clases.jsx` que recalcule `ocurrencias` para
  el nuevo mes (los datos de `misClases`/`eventosCalendarioDemo` ni están
  disponibles ahí adentro). Se implementó como componente controlado:
  `mesVisto` vive en `Clases.jsx` (con `useState`, sigue siendo "estado
  local" en el sentido de "no global, no persistido" — solo que el
  componente dueño es la página, no `CalendarioMensual` en sí), y
  `CalendarioMensual` solo expone `onMesAnterior`/`onMesSiguiente` para
  pedir el cambio.
- **"Próximos" no se recalcula al mover el calendario, a propósito.**
  `proximosItems()` recibe `anio`/`mes` y filtra por `fecha >= hoy` — si se
  le pasara el mes que se está navegando (`mesVisto`) en vez del mes real,
  navegar a un mes pasado vaciaría la lista (todo queda antes de "hoy") y
  navegar a uno futuro perdería los ítems intermedios entre hoy y ese mes.
  Se llama siempre con el mes real (`hoy.getFullYear()`/`hoy.getMonth()`),
  independiente de qué mes esté mirando el calendario arriba.
- **La Gala Anual CREAR (30/09) no aparece en "Próximos" al día de hoy** —
  no es un bug. `proximosItems()` corta en `cantidad = 5` (default), y hoy
  (11/09/2026) hay exactamente 5 ocurrencias de Danza Clásica antes del
  30/09 (14, 16, 21, 23, 28), así que la Gala queda 6ª en la lista
  cronológica y no entra. Es una consecuencia esperable de combinar una
  clase que se repite 2 veces por semana con un `cantidad` fijo chico —
  no se lo tocó porque no estaba pedido, pero si se quiere garantizar que
  los eventos (más esporádicos que las clases) siempre aparezcan, hay que
  subir `cantidad` o tratar eventos aparte de clases en el corte.
- **`ocurrenciasDeClaseEnMes()`/`proximosItems()` usan `hoyLocalISO()`
  (exportada ahora) en vez de `new Date().toISOString().split('T')[0]`
  como venía en el snippet del spec** — mismo bug de UTC-vs-local ya
  corregido dos veces antes (`esCargoVencido` en Pagos, `estadoAptoFisico`
  en Perfil): de noche en Argentina (UTC-3) el "hoy" en UTC ya es mañana,
  y sin el fix eso excluía el día de hoy de "Próximos" unas horas antes de
  tiempo. Se prefirió exportar la función ya existente en vez de duplicar
  la lógica por tercera vez.

## Flujo de trabajo

La planificación se define en una conversación aparte con Claude en
claude.ai — las tareas llegan ya especificadas. Si algo del spec no cierra
con el código real del repo (un componente que no existe, una convención
distinta a la documentada acá), avisar y frenar en vez de asumir — esto ya
costó tiempo real una vez en el proyecto anterior.