# Schema real — SistemaWeb CREAR (backend)

Este documento compila el modelo de datos completo que se venía usando como
referencia en la conversación de planificación (nunca se había volcado por
escrito en el repo hasta la Fase 2 del backend). Es la fuente de verdad para
`app/models/` — cualquier cambio de schema debería actualizar esto también.

Desde la Fase B6 existe además `schema_original_supabase.sql` (adjuntado a
la conversación, no un archivo del repo) como fuente primaria real — ver la
última sección de este documento.

Convenciones generales:
- Todas las PK son `UUID`, `server_default=gen_random_uuid()` (extensión
  `pgcrypto`, activada en la primera migración).
- Cualquier columna con un default real usa `server_default=`, nunca
  `default=` de Python (ver sección dedicada abajo).
- Cualquier `CHECK (...)` del original tiene su `CheckConstraint` en el
  modelo (ver sección dedicada abajo).
- Los enums de Postgres reales se mapean a `sqlalchemy.Enum(PythonEnum,
  name="snake_case")` — el `name=` es necesario para que el tipo en
  Postgres se llame como corresponde (sin él, SQLAlchemy usa el nombre de
  la clase Python en minúsculas).

## `default=` vs `server_default=`

**Por qué importa:** en SQLAlchemy, `default=` es un valor que la
*librería* rellena antes de mandar el INSERT — solo existe mientras se
inserta a través del `Session`/ORM de SQLAlchemy. `server_default=text(...)`,
en cambio, es una cláusula `DEFAULT` real en la columna de Postgres —
existe a nivel de base, así que aplica sin importar quién escriba la fila
(el ORM, un `INSERT` de `psql`, otra app, una migración de datos, etc.).
Usar `default=` en una columna que el schema real espera con default
rompe cualquier INSERT que no pase por este ORM específico.

Mismo patrón para cualquier tipo de columna:

```python
# booleano
autorizacion_imagen = Column(Boolean, nullable=False, server_default=text("false"))

# numérico — con la escala exacta del original (ver nota de precisión abajo)
arancel_cuota_base = Column(Numeric, nullable=False, server_default=text("40000.00"))

# fecha
fecha_inscripcion = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))

# timestamp — clock_timestamp() para "última modificación" real, now()/
# CURRENT_TIMESTAMP para "creado en" (now() devuelve la hora de inicio de
# la transacción, congelada; clock_timestamp() la hora real del reloj)
fecha_hora = Column(DateTime(timezone=True), nullable=False, server_default=text("clock_timestamp()"))

# enum
estado = Column(Enum(EstadoAlumno, name="estado_alumno"), nullable=False, server_default=text("'activo'"))
```

Ningún literal necesita cast explícito (`::estado_alumno`, etc.) —
Postgres lo castea solo al tipo de la columna en una cláusula `DEFAULT`.

**Nota de precisión numérica:** una columna `numeric` sin precisión/escala
declarada (como todas las de este schema) conserva la escala del literal
del `DEFAULT` tal cual se escribió — `DEFAULT 40000` y `DEFAULT 40000.00`
generan valores que se muestran distinto (`40000` vs `40000.00`) aunque
sean numéricamente iguales. Para fidelidad exacta con el original, los
literales numéricos de `server_default=text(...)` reproducen la escala
tal cual está en `schema_original_supabase.sql` (con decimales donde el
original los tiene).

**Gotcha de Alembic al generar la migración — dos, no uno:**
1. `alembic revision --autogenerate` **no compara `server_default` por
   defecto** — hay que pasar `compare_server_default=True` a
   `context.configure(...)` en `alembic/env.py` (los dos lugares:
   `run_migrations_offline` y `run_migrations_online`). Sin esto,
   autogenerate no detecta el cambio y genera una migración vacía. Ya
   está configurado así en este repo.
2. Aun con `compare_server_default=True`, autogenerate **normaliza
   literales numéricos al comparar** y no marca diff entre `"40000"` y
   `"40000.00"` — un cambio de precisión así hay que agregarlo a mano a
   la migración (`op.alter_column(..., server_default=text("40000.00"))`),
   autogenerate no lo va a generar solo.

## `CHECK (...)` constraints

**Por qué importa:** son la otra mitad de la integridad de datos del
schema original, además de los defaults — límites de rango
(`nota >= 1 AND nota <= 10`), signos (`monto > 0`), fechas relativas a hoy
(`fecha <= CURRENT_DATE`), etc. Sin ellos, el modelo de Python permite
guardar datos que el schema real nunca permitió.

**Gotcha de Alembic, el más importante de los tres:** `alembic revision
--autogenerate` **no detecta constraints `CHECK` agregados o sacados del
modelo, ni con `compare_server_default=True` ni con ninguna otra opción
simple de `context.configure(...)`** — es una limitación conocida del
soporte de Alembic para Postgres. Cualquier `CHECK` nuevo hay que
agregarlo a mano a la migración con `op.create_check_constraint(nombre,
tabla, condición)`, y sacarlo a mano en el `downgrade()` con
`op.drop_constraint(nombre, tabla, type_='check')`. Confirmado en la
Fase B6: se agregaron 15 `CheckConstraint` a los modelos y autogenerate no
detectó ninguno.

En SQLAlchemy, van en `__table_args__` de la clase:

```python
__table_args__ = (
    CheckConstraint("monto > 0", name="pago_monto_check"),
)
```

Nombrar cada constraint (`name=`) es necesario para poder hacer
`drop_constraint` por nombre después (en un `downgrade`, o al modificarla).

## Decisión de auth: `password_hash` por tabla, sin `auth_user_id`

`usuario` y `padre_tutor` tienen su propio `password_hash` (nullable, se
completa en la Fase 3) en vez del `auth_user_id` que sí tiene
`schema_original_supabase.sql` (`usuario.auth_user_id uuid NOT NULL
UNIQUE`, `padre_tutor.auth_user_id uuid UNIQUE`, ambas con FK a
`auth.users`). **Esto es intencional, no un olvido** — `auth.users` es
Supabase Auth, y reemplazar Supabase es justo el motivo por el que existe
este backend (ver Claude.md raíz, "Contexto"). Confirmado explícitamente
contra el archivo original en la Fase B6: la columna existe ahí, se decide
no portarla. El login real se construye con `password_hash` + JWT cuando
llegue la Fase 3 (`passlib`/`python-jose`, todavía no instalados).

## Tablas — estado final confirmado contra `schema_original_supabase.sql`

Todas las tablas de acá abajo están confirmadas columna por columna,
default por default y `CHECK` por `CHECK` contra el archivo original,
**excepto** lo marcado `NUEVO`/`PROPUESTO`, que sale de haber construido
el portal (Alumno/Tutor) mockeado antes que el backend — ver Claude.md
del repo raíz para el detalle de cada decisión de producto que las
motivó. Ninguna columna/tabla `NUEVO` está confirmada con la compañera
todavía. `auth_user_id` no aparece en ninguna tabla a propósito (ver
"Decisión de auth" arriba).

### Núcleo: personas y grupos familiares

- **`usuario`**: `nombre`, `apellido` NOT NULL. `email` NOT NULL UNIQUE.
  `rol` (enum `rol_usuario`, NOT NULL, sin default — **confirmados los 5
  valores contra la base real en la Fase 3a** (`SELECT unnest(enum_range(
  NULL::rol_usuario))`): `administrador/secretaria/profesor/alumno/tutor`.
  ⚠️ **`alumno` y `tutor` son valores de más, sin uso**: el rol de una
  identidad se determina por en qué tabla se la encontró al loguearse
  (`usuario` → el valor real de `usuario.rol`, que en la práctica solo
  es `administrador/secretaria/profesor`; `padre_tutor` → siempre
  `"tutor"` fijo, no sale de ninguna columna) — ver `app/routers/auth.py`.
  No se migró el enum para sacarlos todavía, revisar si conviene
  limpiarlos en una migración futura una vez que el login esté asentado.
  `estado`
  (enum `estado_usuario`, NOT NULL, default `'activo'` — ⚠️ solo el
  default está confirmado, el resto de los valores no). `fecha_alta`
  (date, NOT NULL, default `CURRENT_DATE`). `password_hash` (NULLABLE,
  Fase 3 — ver "Decisión de auth").
- **`padre_tutor`**: `nombre`, `apellido` NOT NULL. `email`, `telefono`
  nullable, sin default. `parentesco` (enum `parentesco`, nullable, sin
  default — ⚠️ valores propuestos, no confirmados:
  `madre/padre/tutor/abuelo_abuela/otro`). `password_hash` (NULLABLE,
  Fase 3 — ver "Decisión de auth").
- **`grupo_familiar`**: `observaciones` (nullable, sin default). Sin
  `CHECK`.
- **`alumno`**: `nombre`, `apellido` NOT NULL. `fecha_nacimiento` (date,
  NOT NULL, **`CHECK (fecha_nacimiento < CURRENT_DATE)`**). `dni` NOT
  NULL UNIQUE. `datos_medicos` (nullable — ⚠️ dato sensible, nunca
  loguear ni exponer sin necesidad explícita). `telefono_contacto`
  (nullable). `autorizacion_imagen` (bool, NOT NULL, default `false`).
  `apto_fisico_presentado` (bool, NOT NULL, default `false`).
  `apto_fisico_fecha` (nullable). `grupo_familiar_id` (FK, nullable).
  `estado` (enum `estado_alumno`, NOT NULL, default `'activo'` — ⚠️
  valores `activo/inactivo/baja`, solo el default confirmado). Sin
  `password_hash` todavía — pendiente de confirmar con la compañera si el
  alumno logueado directo (sin tutor) usa esta misma tabla para login o
  una distinta.
- **`alumno_tutor`**: tabla puente, `alumno_id`/`padre_tutor_id` FK NOT
  NULL. Sin default, sin `CHECK`.

### Disciplinas, grupos de clase, horarios

- **`disciplina`**: `nombre` NOT NULL UNIQUE. `tiene_profesorado` (bool,
  NOT NULL, default `false`). `arancel_base` (numeric, nullable, sin
  default). `activo` (bool, NOT NULL, default `true`). Sin `CHECK`.
- **`grupo_clase`**: `disciplina_id` (FK, NOT NULL). `es_profesorado`
  (bool, NOT NULL, default `false`). `nivel` (**NOT NULL**, sin default).
  `orden` (nullable). `nombre_display` (nullable). `profesora_id` (FK →
  `usuario`, NOT NULL). `estado` (enum `estado_grupo`, NOT NULL, default
  `'activo'` — ⚠️ solo el default confirmado). `arancel_mensual`
  (numeric, nullable). Sin `CHECK`.
  - ⚠️ **`NUEVO`/propuesto, sin confirmar, sin agregar todavía**: no
    tiene columna de cupo/capacidad por clase. La pantalla "Clases
    disponibles" del portal (`clasesDisponiblesDemo`) muestra
    `cupoDisponible`/`capacidad` por clase, pero eso sigue siendo mock —
    no hay endpoint real para esa sección (ver Claude.md, Fase B11).
    Agregar `cupo_maximo` (o similar) acá si se decide construir esa
    parte con datos reales.
- **`grupo_clase_horario`**: `grupo_clase_id` (FK, NOT NULL). `dia_semana`
  (enum `dia_semana`, NOT NULL, sin default — **valores confirmados**:
  `lunes/martes/miercoles/jueves/viernes/sabado`, sin domingo a
  propósito). `hora_inicio`/`hora_fin` (time, NOT NULL). Sin `CHECK`.

### Inscripciones y asistencia

- **`inscripcion`**: `alumno_id`/`grupo_clase_id` (FK, NOT NULL).
  `fecha_inscripcion` (date, NOT NULL, default `CURRENT_DATE`). `estado`
  (enum `estado_inscripcion`, NOT NULL, default `'activa'` — ⚠️ valores
  `activa/baja/suspendida`, solo el default confirmado). `fecha_baja`
  (nullable). Sin `CHECK`.
- **`lista_espera`**: `alumno_id`/`grupo_clase_id` (FK, NOT NULL).
  `fecha_registro` (date, NOT NULL, default `CURRENT_DATE`). `estado`
  (enum `estado_lista_espera`, NOT NULL, default `'esperando'` — ⚠️
  valores `esperando/convocado/descartado`, solo el default confirmado).
  Sin `CHECK`.
- **`asistencia`**: `inscripcion_id` (FK, NOT NULL). `fecha` (date, NOT
  NULL, default `CURRENT_DATE`, **`CHECK (fecha <= CURRENT_DATE)`**).
  `presente` (bool, NOT NULL, sin default). `registrado_por` (FK →
  `usuario`, NOT NULL).

### Configuración institucional y cobros

- **`configuracion_sistema`** (fila única de config global):
  `nombre_institucion` (NOT NULL, default `'Escuela de Danzas CREAR'`).
  `direccion` (nullable, default `'Barrio Observatorio, Córdoba'`).
  `telefono_contacto`, `email_contacto`, `cbu_alias_transferencia`
  (nullable, sin default). `leyenda_comprobante` (nullable, default
  `'Comprobante administrativo interno - Escuela de Danzas CREAR'`).
  `arancel_cuota_base` (NOT NULL, default `40000.00`).
  `arancel_matricula_base` (NOT NULL, default `20000.00`).
  `dia_vencimiento_cuota` (int, NOT NULL, default `10`,
  **`CHECK (dia_vencimiento_cuota >= 1 AND dia_vencimiento_cuota <= 28)`**).
  `porcentaje_recargo_mora` (NOT NULL, default `5.00`,
  **`CHECK (porcentaje_recargo_mora >= 0)`**).
  `porcentaje_descuento_familiar` (NOT NULL, default `10.00`,
  **`CHECK (porcentaje_descuento_familiar >= 0)`**).
  `umbral_asistencia_alerta` (NOT NULL, default `75.00`,
  **`CHECK (umbral_asistencia_alerta >= 0 AND umbral_asistencia_alerta <= 100)`**).
  `plazo_dias_apto_fisico` (int, NOT NULL, default `30` — ⚠️ el mock del
  frontend usa 365, discrepancia a resolver con la compañera). `cupo_maximo_default`
  (int, NOT NULL, default `25`). `habilitar_mercadopago` (bool, NOT NULL,
  default `false`). `mp_public_key` (nullable, sin default).
  **`mp_access_token`** (nullable — ⚠️ dato sensible: nunca exponerlo en
  ninguna respuesta de API, ni siquiera a roles admin, solo lo lee el
  backend internamente para hablar con Mercado Pago). **`kapso_api_key`**
  (nullable — mismo criterio de dato sensible que `mp_access_token`).
  `actualizado_en` (timestamptz, NOT NULL, default `clock_timestamp()` —
  no `now()`, ver "`default=` vs `server_default=`" arriba).
  `actualizado_por` (FK → `usuario`, nullable).
- **`concepto_cobro`**: `nombre` NOT NULL UNIQUE. `descripcion`
  (nullable). `es_recurrente` (bool, NOT NULL, default `false`).
  `monto_sugerido` (nullable). `activo` (bool, NOT NULL, default `true`).
  Sin `CHECK`.
- **`comprobante`**: `numero` (int, NOT NULL, **`CHECK (numero > 0)`**).
  `anio` (int, NOT NULL, sin default). `fecha_emision` (date, NOT NULL,
  default `CURRENT_DATE`). `fecha_anulacion`, `motivo_anulacion`
  (nullable). `emitido_por` (FK → `usuario`, NOT NULL).
- **`cargo`**: `alumno_id`/`concepto_cobro_id` (FK, NOT NULL).
  `descripcion`, `periodo` (nullable). `monto_original` (NOT NULL,
  **`CHECK (monto_original > 0)`**). `descuento_aplicado` (**nullable**,
  default `0.00`, **`CHECK (descuento_aplicado IS NULL OR descuento_aplicado >= 0)`**).
  `recargo_aplicado` (**nullable**, default `0.00`,
  **`CHECK (recargo_aplicado IS NULL OR recargo_aplicado >= 0)`**).
  `monto_final` (NOT NULL, **`CHECK (monto_final >= 0)`**).
  `fecha_generacion` (date, NOT NULL, default `CURRENT_DATE`).
  `fecha_vencimiento` (nullable). `estado` (enum `estado_cargo` —
  **confirmados**: `pendiente/pagado/parcial`, default `'pendiente'`,
  más **`pago_en_revision` (NUEVO**, agregado para el flujo de Mercado
  Pago, ver más abajo)). `generado_por` (FK → `usuario`, nullable).
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
- **`pago`**: `cargo_id` (FK, NOT NULL). `fecha_pago` (date, NOT NULL,
  default `CURRENT_DATE`, **`CHECK (fecha_pago <= CURRENT_DATE)`**).
  `monto` (NOT NULL, **`CHECK (monto > 0)`**). `metodo` (enum
  `metodo_pago`, NOT NULL, sin default — ⚠️ valores
  `efectivo/transferencia/mercadopago`, tomados del mock del portal
  `infoMetodoPago`, no confirmados contra un enum real). `referencia_externa`
  (nullable). `comprobante_id` (FK, nullable). `registrado_por` (FK →
  `usuario`, NOT NULL).

### Sueldos y liquidaciones

- **`sueldo_usuario`**: `usuario_id` (FK, NOT NULL). `monto` (NOT NULL,
  **`CHECK (monto > 0)`**). `vigente_desde` (date, NOT NULL, default
  `CURRENT_DATE`). `vigente_hasta` (nullable).
- **`liquidacion`**: `usuario_id` (FK, NOT NULL). `periodo` (NOT NULL,
  sin default). `monto` (NOT NULL, **`CHECK (monto >= 0)`**). `estado`
  (enum `estado_liquidacion`, NOT NULL, default `'generada'` — ⚠️
  valores `generada/aprobada/pagada`, solo el default confirmado).
  `aprobada_por` (FK → `usuario`, nullable). `fecha_aprobacion`,
  `fecha_pago` (nullable).

### Evaluaciones

- **`examen`**: `grupo_clase_id` (FK, NOT NULL). `fecha` (date, NOT NULL,
  sin default). `descripcion` (nullable). Sin `CHECK`.
- **`criterio_evaluacion`**: `nombre` NOT NULL UNIQUE. `descripcion`
  (nullable). `activo` (bool, NOT NULL, default `true`). Sin `CHECK`.
- **`examen_criterio`**: `examen_id`/`criterio_id` (FK, NOT NULL).
  `orden` (nullable). Sin default, sin `CHECK`.
- **`calificacion`**: `examen_criterio_id`/`alumno_id`/`profesora_id`
  (FK, NOT NULL). `nota` (numeric, NOT NULL,
  **`CHECK (nota >= 1.00 AND nota <= 10.00)`**). `observaciones`
  (nullable). `fecha_carga` (date, NOT NULL, default `CURRENT_DATE`).
  `corregida_por` (FK → `usuario`, nullable). `fecha_correccion`
  (nullable).

### Eventos institucionales (módulo retomado en la Fase 17 del portal)

- **`evento_institucional`**: `titulo` (NOT NULL). `tipo` (enum
  `tipo_evento`, NOT NULL, default `'otro'` — ⚠️ valores `gala/otro`
  tomados del mock del portal, no confirmados). `fecha_evento` (date,
  NOT NULL, sin default). `hora_evento`, `lugar`, `descripcion`,
  `fecha_limite_pago` (nullable). `creado_por` (FK → `usuario`, NOT
  NULL). Sin `CHECK`.
  - **`mapa_asientos` (NUEVO, propuesto)**: JSONB, nullable. Forma:
    `{ sectores: [{ nombre, filas, columnas, precio }] }`, igual que
    `eventosDemo` en `mock/fixtures.js` del portal. `null` = evento sin
    butacas (entrada libre). Se eligió JSONB en vez de tablas normalizadas
    de sectores/asientos porque el mapa es fijo por evento y no se
    reutiliza entre eventos — revisar si en algún momento hace falta
    reportar ocupación agregada por sector con SQL, ahí sí convendría
    normalizar.
- **`vestuario_evento` (TABLA NUEVA, propuesta)**: `evento_institucional_id`
  (FK, NOT NULL), `nombre` (NOT NULL), `descripcion` (nullable), `precio`
  (NOT NULL). El frontend ya construyó un módulo de vestuario en paralelo
  (`mock/fixtures.js` → `vestuarioPorEventoDemo`) — revisar que el shape
  de acá termine alineado con lo que ese mock asume antes de conectarlos.

### Notificaciones (tablas nuevas, propuestas — no están en `schema_original_supabase.sql`)

Sin fuente primaria para confirmar defaults/CHECKs — son 100% propuesta,
a diferencia del resto de las tablas de este documento.

- **`notificaciones`**: `alumno_id` (FK, nullable). `titulo`, `mensaje`
  (NOT NULL). `tipo` (string libre, no enum — el portal ya usa más tipos
  de los que el proyecto viejo tenía:
  `vencimiento/horario/evaluacion/evento/pago`, ver `utils/format.js` →
  `infoTipoNotificacion`; más fácil sumar un valor nuevo a un string que
  migrar un enum cada vez). `fecha_creacion` (timestamptz, NOT NULL,
  default `now()`). `referencia_id` (uuid, nullable).
- **`notificaciones_leidas`**: PK compuesta (`notificacion_id`,
  `alumno_id`) — un alumno lee una notificación una sola vez —, más
  `fecha_lectura` (timestamptz, NOT NULL, default `now()`).

### Auditoría

- **`registro_auditoria`**: `usuario_id` (FK, NOT NULL). `accion`,
  `entidad_afectada` (NOT NULL). `entidad_id` (uuid, NOT NULL).
  `fecha_hora` (timestamptz, NOT NULL, default `clock_timestamp()` — no
  `now()`, confirmado contra el original). `detalle` (nullable). Sin
  `CHECK`.

## Resumen de lo NUEVO/PROPUESTO (sin confirmar con la compañera)

| Tabla/columna | Motivo |
|---|---|
| `cargo.estado = 'pago_en_revision'` | Flujo de Mercado Pago — pago generado, webhook todavía no confirmó |
| `cargo.evento_institucional_id` / `fila` / `columna` / `vestuario_evento_id` | Reusar `cargo` para entradas de evento y vestuario, en vez de tabla `entrada` aparte |
| `evento_institucional.mapa_asientos` (JSONB) | Guardar el mapa de butacas sin normalizar sectores/asientos |
| `vestuario_evento` (tabla completa) | Módulo de vestuario por evento, construido primero en el frontend |
| `notificaciones` / `notificaciones_leidas` (tablas completas) | Bandeja de notificaciones del portal, no existía en el modelo viejo |

---

**Este documento se valida contra `schema_original_supabase.sql`, no de
memoria — ante cualquier duda futura, comparar contra ese archivo, no
contra una descripción de él.**
