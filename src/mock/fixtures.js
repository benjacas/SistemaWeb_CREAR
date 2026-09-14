// Datos de ejemplo para el caso "Tutor con un solo alumno vinculado".
// Misma forma que va a tener el futuro backend (FastAPI) — ver Claude.md.

export const familiaDemo = {
  nombre: 'Familia Ramírez',
  dni: '30.456.789', // del tutor, o del propio alumno si se logueó directo
}

export const alumnosVinculadosDemo = [
  {
    id: 'a1', nombre: 'Sofía', apellido: 'Ramírez', grupoPrincipal: 'Danza Clásica', activo: true,
    telefono: '351-555-0000', email: 'familia.ramirez@example.com', domicilio: 'Barrio Observatorio, Córdoba',
    aptoFisicoPresentado: true, aptoFisicoFecha: '2026-04-15',
  },
  // si mañana se quiere probar el caso multi-hijo, alcanza con agregar un segundo objeto acá
]

export const configInstitucionalDemo = { plazoDiasAptoFisico: 365 }

export const cargosDemo = [
  { id: 'c1', concepto: 'Cuota Septiembre 2026', periodo: '2026-09', monto_final: 32000, estado: 'pendiente', fecha_vencimiento: '2026-09-10' },
  { id: 'c2', concepto: 'Cuota Agosto 2026', periodo: '2026-08', monto_final: 32000, estado: 'pagado', fecha_pago: '2026-08-08', metodo: 'mercadopago', comprobante: '2026-00047' },
  { id: 'c3', concepto: 'Cuota Julio 2026', periodo: '2026-07', monto_final: 28000, estado: 'pagado', fecha_pago: '2026-07-09', metodo: 'transferencia', comprobante: '2026-00031' },
  { id: 'c4', concepto: 'Matrícula Anual 2026', periodo: '2026-03', monto_final: 15000, estado: 'pagado', fecha_pago: '2026-03-01', metodo: 'efectivo', comprobante: '2026-00003' },
  // casos para probar badges que el mockup no muestra — no pertenecen al relato de "Sofía", son solo de prueba visual
  { id: 'c5', concepto: 'Cuota Junio 2026 (demo vencida)', periodo: '2026-06', monto_final: 28000, estado: 'pendiente', fecha_vencimiento: '2026-06-10' },
  { id: 'c6', concepto: 'Cuota Mayo 2026 (demo parcial)', periodo: '2026-05', monto_final: 28000, estado: 'parcial', fecha_vencimiento: '2026-05-10' },
]

export const grupoAsistenciaDemo = { nombre: 'Danza Clásica' }

export const asistenciasDemo = [
  // Septiembre 2026 — por encima del umbral
  { id: 'as1', fecha: '2026-09-03', presente: true },
  { id: 'as2', fecha: '2026-09-08', presente: true },
  { id: 'as3', fecha: '2026-09-10', presente: true },
  { id: 'as4', fecha: '2026-09-15', presente: false },
  { id: 'as5', fecha: '2026-09-17', presente: true },
  { id: 'as6', fecha: '2026-09-22', presente: true },
  // Agosto 2026 — por debajo del umbral, para probar el caso ámbar
  { id: 'as7', fecha: '2026-08-04', presente: true },
  { id: 'as8', fecha: '2026-08-06', presente: true },
  { id: 'as9', fecha: '2026-08-11', presente: false },
  { id: 'as10', fecha: '2026-08-13', presente: false },
  { id: 'as11', fecha: '2026-08-18', presente: false },
]

// % — mismo campo que configuracion_sistema.umbral_asistencia_alerta en el modelo real
export const umbralAsistenciaDemo = 75

// 'horario' es un tipo nuevo que no existía en el proyecto viejo (ahí solo
// teníamos institucional/vencimiento/inasistencia/evento) — lo sumo porque
// el mockup lo muestra explícitamente ("Cambio de horario"). La tabla real
// de notificaciones sigue sin existir en la base, así que esto no rompe
// nada — es la misma propuesta de schema de siempre, con un tipo más.
export const notificacionesDemo = [
  {
    id: 'n1', tipo: 'vencimiento', titulo: 'Tu cuota vence en 3 días',
    mensaje: 'Cuota Septiembre 2026 · $32.000', fecha: '2026-09-07T10:00:00', leida: false,
  },
  {
    id: 'n2', tipo: 'horario', titulo: 'Cambio de horario',
    mensaje: 'Danza Clásica pasó a las 18:30 desde el lunes', fecha: '2026-09-06T09:00:00', leida: false,
  },
  {
    id: 'n3', tipo: 'evaluacion', titulo: 'Nueva nota cargada',
    mensaje: 'Examen Final 2026 · Promedio 8.7', fecha: '2026-09-04T15:00:00', leida: true,
  },
  {
    id: 'n4', tipo: 'evento', titulo: 'Recordatorio',
    mensaje: 'Gala Anual CREAR en 12 días', fecha: '2026-09-01T12:00:00', leida: true,
  },
  {
    id: 'n5', tipo: 'pago', titulo: 'Pago confirmado',
    mensaje: 'Cuota Agosto 2026 · $32.000', fecha: '2026-08-08T14:00:00', leida: true,
  },
]

export const proximoEventoDemo = {
  id: 'ev1', titulo: 'Gala Anual CREAR', fecha: '2026-09-30', diasRestantes: 13,
}

export const horariosResumenDemo = { cantidadPorSemana: 3 }

export const misClasesDemo = [
  {
    id: 'g1', nombre: 'Danza Clásica', nivel: 'Intermedio', profesora: 'Lorena Cosanelli',
    horario: 'Lunes y Miércoles 18:00–19:30', // se mantiene, la sigue usando la tarjeta de "Mis clases"
    horarios: [
      { diaSemana: 'lunes', horaInicio: '18:00', horaFin: '19:30' },
      { diaSemana: 'miercoles', horaInicio: '18:00', horaFin: '19:30' },
    ],
  },
]

// diaSemana sin acentos (miercoles, no miércoles) — mismo criterio que
// confirmamos contra el enum real en el proyecto viejo, para no tener que
// normalizar texto acentuado en ningún lado.
export const eventosCalendarioDemo = [
  { id: 'ev1', titulo: 'Gala Anual CREAR', fecha: '2026-09-30', hora: '20:00' },
]

// cupoDisponible de Jazz en 2 (no 3, como en el enunciado original) para que
// las 3 clases del mock efectivamente muestren los 3 casos de estadoCupo()
// (normal / lleno / últimos lugares) — con 3 caía en "normal" igual que
// Folklore y el caso "últimos lugares" nunca se veía en la demo.
export const clasesDisponiblesDemo = [
  { id: 'g2', nombre: 'Jazz', nivel: 'Inicial', horario: 'Martes 17:00–18:00', profesora: 'Martina Bordon', cupoDisponible: 2, capacidad: 15 },
  { id: 'g3', nombre: 'Danza Contemporánea', nivel: 'Intermedio', horario: 'Jueves 18:30–19:30', profesora: 'Lorena Cosanelli', cupoDisponible: 0, capacidad: 12 },
  { id: 'g4', nombre: 'Folklore', nivel: 'Inicial', horario: 'Viernes 17:30–18:30', profesora: 'Ainara Sosa', cupoDisponible: 5, capacidad: 20 },
]

// Estado de inscripción en curso, separado del mock de arriba porque
// cambia con la interacción del usuario, no es un dato "fijo" de ejemplo
export const solicitudesInscripcionDemo = {} // { [claseId]: 'pendiente' | 'lista_espera' }

// titulo sale de examen.descripcion en el modelo real (texto libre que
// carga la profesora, no un enum "Final/Parcial")
export const evaluacionesDemo = [
  {
    id: 'ex1',
    grupoNombre: 'Danza Clásica',
    esProfesorado: true,
    fecha: '2026-09-01',
    titulo: 'Examen Final 2026',
    detalle: [
      { criterioNombre: 'Expresión', nota: 9, observaciones: null },
      { criterioNombre: 'Ritmo', nota: 8, observaciones: 'Mejoró mucho el timing' },
      { criterioNombre: 'Técnica', nota: 9, observaciones: null },
    ],
  },
  {
    id: 'ex2',
    grupoNombre: 'Danza Clásica',
    esProfesorado: true,
    fecha: '2026-05-11',
    titulo: 'Examen Parcial 2026',
    detalle: [
      { criterioNombre: 'Expresión', nota: 8, observaciones: null },
      { criterioNombre: 'Ritmo', nota: 8, observaciones: null },
      { criterioNombre: 'Técnica', nota: 8, observaciones: null },
    ],
  },
]

// Módulo de Eventos (mock completo) — retoma el flujo de entradas con mapa
// de butacas que había quedado pausado por falta de modelo de datos (ver
// Claude.md). Se construye mockeado primero, documentando acá el schema
// propuesto, para coordinar con la compañera antes de tocar el backend.
export const eventosDemo = [
  {
    id: 'ev1', titulo: 'Gala Anual CREAR', tipo: 'gala',
    fecha: '2026-09-30', hora: '20:00', lugar: 'Auditorio Municipal',
    descripcion: 'Nuestra muestra de fin de año con la participación de todas las comisiones. Sofía baila en la Tanda 3 (Cierre).',
    fechaLimitePago: '2026-09-25',
    mapaAsientos: {
      precio: 5000, // precio único para todo el auditorio
      sillasRuedas: { cupo: 2 },
      filas: [
        { fila: 'A', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'B', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'C', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'D', bloques: [[18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'E', bloques: [[18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'F', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17, 19]] },
        { fila: 'G', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17]] },
        { fila: 'H', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17]] },
        { fila: 'I', bloques: [[20, 18, 16], [14, 12, 10, 8, 6, 4, 2], [1, 3, 5, 7, 9, 11, 13], [15, 17]] },
        { fila: 'J', bloques: [[18, 16], [], [], [15, 17]] },
        { fila: 'K', corrida: [18, 16, 14, 12, 10, 8, 6, 4, 2] },
      ],
    },
  },
  {
    id: 'ev2', titulo: 'Clase abierta a familias', tipo: 'otro',
    fecha: '2026-10-15', hora: '18:00', lugar: 'Sede CREAR',
    descripcion: 'Vení a ver una clase de Danza Clásica en vivo. Entrada libre y gratuita.',
    fechaLimitePago: null,
    mapaAsientos: null,
  },
]

export const butacasOcupadasDemo = {
  ev1: ['A-3', 'B-7', 'C-2', 'C-3', 'D-5', 'E-8', 'E-9', 'F-1'],
}

export const misEntradasDemo = [
  {
    id: 'ent1', eventoId: 'ev1', eventoTitulo: 'Gala Anual CREAR',
    fecha: '2026-09-30', lugar: 'Auditorio Municipal',
    butacas: [{ sector: 'Platea', fila: 'D', columna: 6 }],
    estado: 'pago_en_revision', montoTotal: 5000,
  },
]

// Vestuario por evento — mismos 3 estados que un pago cualquiera
// (pendiente/pago_en_revision/pagado), ver infoEstadoPago() en format.js.
// Solo `ev1` tiene ítems cargados; `ev2` (entrada libre) no tiene vestuario.
export const vestuarioPorEventoDemo = {
  ev1: [
    { id: 'vt1', nombre: 'Malla Gala Anual', descripcion: 'Malla violeta con detalles en tul, uso obligatorio para la Tanda 3.', precio: 18000, estado: 'pendiente' },
    { id: 'vt2', nombre: 'Zapatillas de punta (alquiler)', descripcion: 'Alquiler por el evento, se devuelven al finalizar.', precio: 8000, estado: 'pendiente' },
  ],
}
