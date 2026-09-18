# Schema real — SistemaWeb CREAR (backend)

Este documento compila el modelo de datos completo que se venía usando como
referencia en la conversación de planificación (nunca se había volcado por
escrito en el repo hasta la Fase 2 del backend). Es la fuente de verdad para
`app/models/` — cualquier cambio de schema debería actualizar esto también.

Convenciones generales:
- Todas las PK son `UUID`, `server_default=gen_random_uuid()` (extensión
  `pgcrypto`, activada en la primera migración).
- **Cualquier columna con un default real usa `server_default=`, nunca
  `default=` de Python** — auditado en las 27 tablas, no solo en los
  enums. Ver la sección dedicada más abajo, es la clase de error fácil de
  repetir en una tabla nueva si no se entiende por qué pasa.
- Los enums de Postgres reales se mapean a `sqlalchemy.Enum(PythonEnum,
  name="snake_case")` — el `name=` es necesario para que el tipo en
  Postgres se llame como corresponde (sin él, SQLAlchemy usa el nombre de
  la clase Python en minúsculas).

## `default=` vs `server_default` — auditado en las 27 tablas

**Encontrado con los enums en la Fase B3, auditado en todas las columnas
(no solo enums) en la Fase B4.** Documentado acá aparte porque es la
clase de error fácil de repetir en una tabla nueva si no se entiende por
qué pasa.

**El problema:** en SQLAlchemy, `default=` es un valor que la *librería*
rellena antes de mandar el INSERT — solo existe mientras se inserta a
través del `Session`/ORM de SQLAlchemy. `server_default=text(...)`, en
cambio, es una cláusula `DEFAULT` real en la columna de Postgres — existe
a nivel de base, así que aplica sin importar quién escriba la fila (el
ORM, un `INSERT` de `psql`, otra app, una migración de datos, etc.).

**La corrección**, mismo patrón para cualquier tipo de columna:

```python
# booleano
autorizacion_imagen = Column(Boolean, nullable=False, server_default=text("false"))

# numérico
arancel_cuota_base = Column(Numeric, nullable=False, server_default=text("40000"))

# fecha
fecha_inscripcion = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))

# timestamp
fecha_hora = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

# enum
estado = Column(Enum(EstadoAlumno, name="estado_alumno"), nullable=False, server_default=text("'activo'"))
```

Ningún literal necesita cast explícito (`::estado_alumno`, etc.) —
Postgres lo castea solo al tipo de la columna en una cláusula `DEFAULT`.

**Gotcha de Alembic al generar la migración:** `alembic revision
--autogenerate` **no compara `server_default` por defecto** — hay que
pasar `compare_server_default=True` a `context.configure(...)` en
`alembic/env.py` (los dos lugares: `run_migrations_offline` y
`run_migrations_online`), si no, autogenerate no detecta el cambio y
genera una migración vacía. Ya está configurado así en este repo desde la
Fase B3 — si en algún momento se regenera `alembic/env.py` desde cero
(por ejemplo con `alembic init` de nuevo), no te olvides de esto.

### Lista completa de columnas corregidas

**Fase B3 (8 columnas `Enum`)** — `default=EstadoX.valor` →
`server_default=text("'valor'")`:
`usuario.estado`, `alumno.estado`, `grupo_clase.estado`,
`inscripcion.estado`, `lista_espera.estado`, `cargo.estado`,
`liquidacion.estado`, `evento_institucional.tipo`.

**Fase B4 (auditoría del resto de las columnas)** — se recorrieron las 27
tablas contra este documento. Resultado: todas las columnas con
`server_default=` que ya venían de la Fase B2 (fechas `CURRENT_DATE`,
timestamps `now()`, numéricos y booleanos de `configuracion_sistema`,
`concepto_cobro`, `comprobante`, `cargo`, `pago`, `sueldo_usuario`,
`criterio_evaluacion`, `disciplina.activo`, etc.) ya estaban bien desde
que se escribieron — la Fase B2 solo se equivocó con los enums. Se
encontraron y corrigieron 2 columnas más, ambas `Boolean`:

- `alumno.autorizacion_imagen`: `default=False` → `server_default=text("false")`.
- `alumno.apto_fisico_presentado`: `default=False` → `server_default=text("false")`.

Además, la auditoría encontró **2 columnas con un default de más que no
estaba en el schema original** — no es el mismo bug (no eran `default=`
que había que convertir, eran defaults que no debían existir):

- `disciplina.tiene_profesorado`: tenía `default=False` en el modelo,
  pero el schema original la lista como `tiene_profesorado bool` sin la
  palabra `default` (a diferencia de `activo bool default true`, en la
  misma tabla, que sí la tiene). Se sacó el default por completo — ahora
  es obligatorio pasarla en cada INSERT, como en el original.
- `grupo_clase.es_profesorado`: mismo caso — `es_profesorado bool` en el
  original, sin `default`. Se sacó el default por completo.

**Caso revisado y dejado como está, a confirmar con la compañera:**
`configuracion_sistema.actualizado_en` tiene `server_default=text("now()")`
en el modelo, pero el schema original la lista como
`actualizado_en timestamptz` sin la palabra `default` — a diferencia de
los otros 3 campos `timestamptz` del schema (`registro_auditoria.fecha_hora`,
`notificaciones.fecha_creacion`, `notificaciones_leidas.fecha_lectura`),
que sí dicen `default ahora` explícito. No se tocó porque no es un caso
de `default=` mal usado (ya es `server_default=`, el mecanismo correcto)
y porque hay una lectura razonable de por qué el original la dejaría sin
default: `actualizado_en` va de la mano de `actualizado_por` — probablemente
se espera que la aplicación actualice los dos juntos en cada UPDATE, no
que uno se autocomplete solo mientras el otro queda desactualizado. Queda
como pendiente de confirmar, no como bug.

### Verificado (Fase B4)

Insert por `psql` (sin pasar por el ORM) en cada tabla con al menos una
columna `server_default=`, sin especificar esas columnas: `alumno`
(`autorizacion_imagen`/`apto_fisico_presentado`/`estado`, los 3 correctos),
`disciplina` y `grupo_clase` (confirmado que `tiene_profesorado`/
`es_profesorado` ahora **fallan** sin valor explícito — es el
comportamiento correcto, no tienen default), `configuracion_sistema`
(`INSERT ... DEFAULT VALUES`, los 10 campos con default salieron bien),
`concepto_cobro`, `comprobante`, `criterio_evaluacion`,
`registro_auditoria`, `notificaciones`, `notificaciones_leidas`,
`sueldo_usuario`. Los 8 enums de la Fase B3 y el resto de las columnas
`CURRENT_DATE` (`inscripcion`, `lista_espera`, `cargo`, `pago`, `usuario`,
`asistencia`) ya habían quedado confirmados en fases anteriores — no se
repitió esa parte, solo lo nuevo/no probado todavía. Todas las filas de
prueba se borraron después.

**Regla para cualquier tabla/columna nueva de acá en adelante:** si una
columna necesita un valor por defecto — de cualquier tipo, no solo
`Enum` — usar siempre `server_default=text(...)`, nunca `default=`. Y al
revés: si el schema no le da un default explícito a una columna, no
agregarle uno "por las dudas" en el modelo — las columnas sin default en
el original (`padre_tutor.parentesco`, `usuario.rol`,
`grupo_clase_horario.dia_semana`, `pago.metodo`,
`disciplina.tiene_profesorado`, `grupo_clase.es_profesorado`) se quedan
sin ningún default a propósito.

## Decisión de auth: `password_hash` por tabla, sin `auth_user_id`

`usuario` y `padre_tutor` tienen su propio `password_hash` (nullable,
se completa en la Fase 3) en vez de un `auth_user_id` que apunte a un
proveedor externo (tipo Supabase Auth, que es justamente lo que este
proyecto reemplaza — ver Claude.md raíz, "Contexto"). El login real se
construye con este mismo mecanismo cuando llegue la Fase 3 (JWT +
`passlib`/`python-jose`, todavía no instalados).

## Tablas — estado confirmado vs. propuesto

Todas las tablas de acá abajo estaban confirmadas contra la base real que
se venía usando **excepto** las marcadas `NUEVO`/`PROPUESTO`, que salen de
haber construido el portal (Alumno/Tutor) mockeado antes que el backend —
ver Claude.md del repo raíz para el detalle de cada decisión de producto
que las motivó. Ninguna de las columnas/tablas `NUEVO` está confirmada con
la compañera todavía.

### Núcleo: personas y grupos familiares

- **`usuario`**: `id`, `nombre`, `apellido`, `email` (UNIQUE), `rol` (enum
  `rol_usuario` — ⚠️ valores `administrador/secretaria/profesor/alumno/tutor`
  tomados del Claude.md del portal, no confirmados contra un enum real),
  `estado` (enum `estado_usuario`, default `activo` — ⚠️ solo el default
  está confirmado), `fecha_alta` (date, default hoy), `password_hash`
  (NULLABLE, Fase 3).
- **`padre_tutor`**: `id`, `nombre`, `apellido`, `email`, `telefono`,
  `parentesco` (enum `parentesco` — ⚠️ valores propuestos, no confirmados:
  `madre/padre/tutor/abuelo_abuela/otro`), `password_hash` (NULLABLE,
  Fase 3). Mismo motivo que `usuario`: sin `auth_user_id`.
- **`grupo_familiar`**: `id`, `observaciones`.
- **`alumno`**: `id`, `nombre`, `apellido`, `fecha_nacimiento`, `dni`
  (UNIQUE), `datos_medicos` (⚠️ dato sensible — nunca loguear, nunca
  exponer sin necesidad explícita), `telefono_contacto`,
  `autorizacion_imagen` (bool, default false), `apto_fisico_presentado`
  (bool, default false), `apto_fisico_fecha`, `grupo_familiar_id` (FK,
  nullable), `estado` (enum `estado_alumno`, default `activo` — ⚠️ valores
  `activo/inactivo/baja`, solo el default confirmado). Sin
  `password_hash` todavía — pendiente de confirmar con la compañera si el
  alumno logueado directo (sin tutor) usa esta misma tabla para login o
  una distinta.
- **`alumno_tutor`**: tabla puente `alumno_id` ↔ `padre_tutor_id`.

### Disciplinas, grupos de clase, horarios

- **`disciplina`**: `id`, `nombre` (UNIQUE), `tiene_profesorado` (bool),
  `arancel_base` (numeric, nullable), `activo` (bool, default true).
- **`grupo_clase`**: `id`, `disciplina_id` (FK), `es_profesorado` (bool),
  `nivel`, `orden` (nullable), `nombre_display` (nullable), `profesora_id`
  (FK → `usuario`, **no nullable**), `estado` (enum `estado_grupo`,
  default `activo` — ⚠️ solo el default confirmado), `arancel_mensual`
  (numeric, nullable).
- **`grupo_clase_horario`**: `id`, `grupo_clase_id` (FK), `dia_semana`
  (enum `dia_semana` — **valores confirmados**:
  `lunes/martes/miercoles/jueves/viernes/sabado`, sin domingo a
  propósito), `hora_inicio`, `hora_fin`.

### Inscripciones y asistencia

- **`inscripcion`**: `id`, `alumno_id` (FK), `grupo_clase_id` (FK),
  `fecha_inscripcion` (date, default hoy), `estado` (enum
  `estado_inscripcion`, default `activa` — ⚠️ valores
  `activa/baja/suspendida`, solo el default confirmado), `fecha_baja`
  (nullable).
- **`lista_espera`**: `id`, `alumno_id` (FK), `grupo_clase_id` (FK),
  `fecha_registro` (date, default hoy), `estado` (enum
  `estado_lista_espera`, default `esperando` — ⚠️ valores
  `esperando/convocado/descartado`, solo el default confirmado).
- **`asistencia`**: `id`, `inscripcion_id` (FK), `fecha` (date, default
  hoy), `presente` (bool), `registrado_por` (FK → `usuario`).

### Configuración institucional y cobros

- **`configuracion_sistema`**: fila única de config global —
  `nombre_institucion` (default `'Escuela de Danzas CREAR'`),
  `direccion`, `telefono_contacto`, `email_contacto`,
  `cbu_alias_transferencia`, `leyenda_comprobante`, `arancel_cuota_base`
  (default 40000), `arancel_matricula_base` (default 20000),
  `dia_vencimiento_cuota` (default 10), `porcentaje_recargo_mora`
  (default 5), `porcentaje_descuento_familiar` (default 10),
  `umbral_asistencia_alerta` (default 75), `plazo_dias_apto_fisico`
  (default 30 — ⚠️ el mock del frontend usa 365, discrepancia a
  resolver), `cupo_maximo_default` (default 25), `habilitar_mercadopago`
  (bool, default false), `mp_public_key` (nullable),
  **`mp_access_token`** (⚠️ dato sensible — nunca exponerlo en ninguna
  respuesta de API, ni siquiera a roles admin; solo lo lee el backend
  internamente para hablar con Mercado Pago), `actualizado_en`
  (timestamptz, default ahora), `actualizado_por` (FK → `usuario`,
  nullable).
- **`concepto_cobro`**: `id`, `nombre` (UNIQUE), `descripcion`,
  `es_recurrente` (bool, default false), `monto_sugerido` (nullable),
  `activo` (bool, default true).
- **`comprobante`**: `id`, `numero`, `anio`, `fecha_emision` (date,
  default hoy), `fecha_anulacion` (nullable), `motivo_anulacion`
  (nullable), `emitido_por` (FK → `usuario`).
- **`cargo`**: `id`, `alumno_id` (FK), `concepto_cobro_id` (FK),
  `descripcion` (nullable), `periodo` (nullable), `monto_original`,
  `descuento_aplicado` (default 0), `recargo_aplicado` (default 0),
  `monto_final`, `fecha_generacion` (date, default hoy),
  `fecha_vencimiento` (nullable), `estado` (enum `estado_cargo` —
  **confirmados**: `pendiente/pagado/parcial`, más
  **`pago_en_revision` (NUEVO**, agregado para el flujo de Mercado Pago,
  ver más abajo)), `generado_por` (FK → `usuario`, nullable),
  `grupo_clase_id` (FK, nullable).
  - **Columnas NUEVAS, propuestas, sin confirmar**:
    `evento_institucional_id` (FK → `evento_institucional`, nullable),
    `fila` (string, nullable), `columna` (int, nullable),
    `vestuario_evento_id` (FK → `vestuario_evento`, nullable). La idea es
    reusar `cargo` para entradas de evento (butacas) y vestuario en vez de
    crear tablas aparte — **a validar con la compañera** si `cargo` ya
    tiene demasiada lógica atada a "cuota mensual" que no aplica acá; la
    alternativa sería una tabla `entrada` separada con su propia relación
    a `pago`.
  - **Índice único anti-sobreventa** (parcial, solo aplica a estados donde
    la butaca sigue "tomada"):
    ```sql
    CREATE UNIQUE INDEX cargo_butaca_activa_unica
      ON cargo (evento_institucional_id, fila, columna)
      WHERE estado IN ('pendiente', 'pago_en_revision', 'pagado');
    ```
    Sin este índice, dos personas confirmando la misma butaca casi al
    mismo tiempo generarían dos cargos "válidos" para el mismo asiento.
- **`pago`**: `id`, `cargo_id` (FK), `fecha_pago` (date, default hoy),
  `monto`, `metodo` (enum `metodo_pago` — ⚠️ valores
  `efectivo/transferencia/mercadopago`, tomados del mock del portor
  `infoMetodoPago`, no confirmados contra un enum real), `referencia_externa`
  (nullable), `comprobante_id` (FK, nullable), `registrado_por` (FK →
  `usuario`).

### Sueldos y liquidaciones

- **`sueldo_usuario`**: `id`, `usuario_id` (FK), `monto`, `vigente_desde`
  (date, default hoy), `vigente_hasta` (nullable).
- **`liquidacion`**: `id`, `usuario_id` (FK), `periodo`, `monto`, `estado`
  (enum `estado_liquidacion`, default `generada` — ⚠️ valores
  `generada/aprobada/pagada`, solo el default confirmado), `aprobada_por`
  (FK → `usuario`, nullable), `fecha_aprobacion` (nullable), `fecha_pago`
  (nullable).

### Evaluaciones

- **`examen`**: `id`, `grupo_clase_id` (FK), `fecha`, `descripcion`
  (nullable).
- **`criterio_evaluacion`**: `id`, `nombre` (UNIQUE), `descripcion`
  (nullable), `activo` (bool, default true).
- **`examen_criterio`**: `id`, `examen_id` (FK), `criterio_id` (FK →
  `criterio_evaluacion`), `orden` (nullable).
- **`calificacion`**: `id`, `examen_criterio_id` (FK), `alumno_id` (FK),
  `profesora_id` (FK → `usuario`), `nota` (numeric, **CHECK 1 a 10** —
  agregado en el modelo aunque el spec original solo lo mencionaba en un
  comentario, no como constraint explícito), `observaciones` (nullable),
  `fecha_carga` (date, default hoy), `corregida_por` (FK → `usuario`,
  nullable), `fecha_correccion` (nullable).

### Eventos institucionales (módulo retomado en la Fase 17 del portal)

- **`evento_institucional`**: `id`, `titulo`, `tipo` (enum `tipo_evento`,
  default `otro` — ⚠️ valores `gala/otro` tomados del mock del portal, no
  confirmados), `fecha_evento`, `hora_evento` (nullable), `lugar`
  (nullable), `descripcion` (nullable), `fecha_limite_pago` (nullable),
  `creado_por` (FK → `usuario`).
  - **`mapa_asientos` (NUEVO, propuesto)**: JSONB, nullable. Forma:
    `{ sectores: [{ nombre, filas, columnas, precio }] }`, igual que
    `eventosDemo` en `mock/fixtures.js` del portal. `null` = evento sin
    butacas (entrada libre). Se eligió JSONB en vez de tablas normalizadas
    de sectores/asientos porque el mapa es fijo por evento y no se
    reutiliza entre eventos — revisar si en algún momento hace falta
    reportar ocupación agregada por sector con SQL, ahí sí convendría
    normalizar.
- **`vestuario_evento` (TABLA NUEVA, propuesta)**: `id`,
  `evento_institucional_id` (FK), `nombre`, `descripcion` (nullable),
  `precio`. El frontend ya construyó un módulo de vestuario en paralelo
  (`mock/fixtures.js` → `vestuarioPorEventoDemo`) — revisar que el shape
  de acá termine alineado con lo que ese mock asume antes de conectarlos.

### Notificaciones (tablas nuevas, propuestas)

- **`notificaciones`**: `id`, `alumno_id` (FK, nullable), `titulo`,
  `mensaje`, `tipo` (string libre, no enum — el portal ya usa más tipos de
  los que el proyecto viejo tenía: `vencimiento/horario/evaluacion/evento/pago`,
  ver `utils/format.js` → `infoTipoNotificacion`; más fácil sumar un valor
  nuevo a un string que migrar un enum cada vez), `fecha_creacion`
  (timestamptz, default ahora), `referencia_id` (uuid, nullable).
- **`notificaciones_leidas`**: PK compuesta (`notificacion_id`,
  `alumno_id`) — un alumno lee una notificación una sola vez —, más
  `fecha_lectura` (timestamptz, default ahora).

### Auditoría

- **`registro_auditoria`**: `id`, `usuario_id` (FK), `accion`,
  `entidad_afectada`, `entidad_id` (uuid), `fecha_hora` (timestamptz,
  default ahora), `detalle` (nullable).

## Resumen de lo NUEVO/PROPUESTO (sin confirmar con la compañera)

| Tabla/columna | Motivo |
|---|---|
| `cargo.estado = 'pago_en_revision'` | Flujo de Mercado Pago — pago generado, webhook todavía no confirmó |
| `cargo.evento_institucional_id` / `fila` / `columna` / `vestuario_evento_id` | Reusar `cargo` para entradas de evento y vestuario, en vez de tabla `entrada` aparte |
| `evento_institucional.mapa_asientos` (JSONB) | Guardar el mapa de butacas sin normalizar sectores/asientos |
| `vestuario_evento` (tabla completa) | Módulo de vestuario por evento, construido primero en el frontend |
| `notificaciones` / `notificaciones_leidas` (tablas completas) | Bandeja de notificaciones del portal, no existía en el modelo viejo |
