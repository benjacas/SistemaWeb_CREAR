// Funciones puras de formateo — sin JSX, sin dependencias de React.

export function formatMoneda(monto) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(monto)
}

export function formatFecha(fechaISO, options = {}) {
  const { conAnio = true } = options
  const fecha = new Date(`${fechaISO}T00:00:00`)
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: conAnio ? 'numeric' : undefined,
  }).format(fecha)
}

// Fecha de hoy en horario local como 'YYYY-MM-DD'. `toISOString()` da la
// fecha en UTC, que en Argentina (UTC-3) queda un día adelantada durante la
// noche — comparar contra eso marcaba cargos como vencidos antes de tiempo.
export function hoyLocalISO() {
  const ahora = new Date()
  const offsetMs = ahora.getTimezoneOffset() * 60000
  return new Date(ahora.getTime() - offsetMs).toISOString().slice(0, 10)
}

// Solo un cargo 'pendiente' puede estar vencido: 'pagado' y 'parcial' son
// estados propios que todavía no tienen definida su propia regla de mora
// (ver Claude.md) — se tratan como no vencidos hasta que se defina.
export function esCargoVencido(cargo) {
  if (cargo.estado !== 'pendiente') return false
  return cargo.fecha_vencimiento < hoyLocalISO()
}

const ESTADOS_CARGO = {
  pagado: { label: 'Pagado', classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  parcial: { label: 'Parcial', classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  pendiente: { label: 'Pendiente', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
}

export function badgeEstadoCargo(estado) {
  return ESTADOS_CARGO[estado] ?? ESTADOS_CARGO.pendiente
}

export function obtenerBadgeCargo(cargo) {
  if (esCargoVencido(cargo)) return { label: 'Vencido', classes: 'bg-red-50 text-red-700' }
  return badgeEstadoCargo(cargo.estado) // pendiente / pagado / parcial
}

// `icono` es una clave, no un componente — este módulo es puro (sin React).
// Quien renderiza (Pagos.jsx, ComprobanteModal.jsx) mapea la clave a un
// ícono real. Se usan íconos SVG en vez de emojis para no mezclar dos
// sistemas de íconos: todo el resto del repo (admin y portal) ya usa
// lucide-react para esto, no hay un set de íconos propios en components/ui/.
const METODOS_PAGO = {
  efectivo: { label: 'Efectivo', icono: 'banknote' },
  transferencia: { label: 'Transferencia', icono: 'landmark' },
  mercadopago: { label: 'Mercado Pago', icono: 'credit-card' },
}

export function infoMetodoPago(metodo) {
  return METODOS_PAGO[metodo] ?? { label: metodo ?? '—', icono: 'banknote' }
}

export function calcularPorcentajeAsistencia(asistencias) {
  if (!asistencias || asistencias.length === 0) return 0
  const presentes = asistencias.filter((a) => a.presente).length
  return Math.round((presentes / asistencias.length) * 100)
}

export function evaluarAsistencia(porcentaje, umbral) {
  const alCorriente = porcentaje >= umbral
  return {
    alCorriente,
    mensaje: alCorriente ? 'Hoy está por encima de ese mínimo.' : 'Hoy está por debajo de ese mínimo.',
    classes: alCorriente ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
  }
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function formatDiaClase(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00')
  const dia = DIAS[fecha.getDay()]
  const [, mes, diaNum] = fechaISO.split('-')
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${diaNum}/${mes}`
}

export function agruparAsistenciasPorMes(asistencias) {
  const porMes = {}
  for (const a of asistencias) {
    const clave = a.fecha.slice(0, 7) // '2026-09'
    if (!porMes[clave]) porMes[clave] = []
    porMes[clave].push(a)
  }
  return porMes // { '2026-09': [...], '2026-08': [...] }
}

export function formatMesLabel(periodo) {
  const texto = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(
    new Date(`${periodo}-01T00:00:00`)
  )
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function estadoCupo(clase) {
  if (clase.cupoDisponible === 0) return { lleno: true, label: 'Cupo lleno' }
  if (clase.cupoDisponible <= 2) return { lleno: false, label: `¡Últimos ${clase.cupoDisponible} lugares!` }
  return { lleno: false, label: `${clase.cupoDisponible} lugares disponibles` }
}

export function promedioNotas(notas) {
  if (!notas?.length) return null
  const suma = notas.reduce((acc, n) => acc + n, 0)
  return Math.round((suma / notas.length) * 10) / 10
}

export function promedioExamen(examen) {
  return promedioNotas(examen.detalle.map((d) => d.nota))
}

export function promedioGeneral(evaluaciones) {
  return promedioNotas(evaluaciones.flatMap((e) => e.detalle.map((d) => d.nota)))
}

export function iniciales(nombreCompleto) {
  return nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
}

// `icono` es una clave, no un emoji — mismo criterio que `infoMetodoPago`:
// todo el repo usa lucide-react para íconos, así que se mapea a un ícono
// SVG real en la página que renderiza (Notificaciones.jsx), no acá.
const TIPOS_NOTIFICACION = {
  vencimiento: { label: 'Pagos', classes: 'bg-amber-50 text-amber-600', icono: 'credit-card' },
  horario: { label: 'Horarios', classes: 'bg-blue-50 text-blue-600', icono: 'calendar-clock' },
  evaluacion: { label: 'Evaluaciones', classes: 'bg-purple-50 text-purple-600', icono: 'star' },
  evento: { label: 'Eventos', classes: 'bg-pink-50 text-pink-600', icono: 'party-popper' },
  pago: { label: 'Pagos', classes: 'bg-emerald-50 text-emerald-600', icono: 'check-circle' },
}

export function infoTipoNotificacion(tipo) {
  return TIPOS_NOTIFICACION[tipo] ?? { label: 'Aviso', classes: 'bg-gray-100 text-gray-500', icono: 'bell' }
}

export function formatFechaRelativa(fechaISO) {
  const dias = Math.floor((Date.now() - new Date(fechaISO)) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  return formatFecha(fechaISO.split('T')[0])
}

export function estadoAptoFisico(alumno, plazoDias) {
  if (!alumno.aptoFisicoPresentado || !alumno.aptoFisicoFecha) {
    return { vigente: false, mensaje: 'No presentó apto físico todavía.' }
  }
  // Parseado con T00:00:00 (hora local), como el resto de las fechas de este
  // archivo — un `new Date('2026-04-15')` sin hora se interpreta en UTC, y
  // ya nos mordió antes con vencimientos corridos casi un día en Argentina.
  const vencimiento = new Date(`${alumno.aptoFisicoFecha}T00:00:00`)
  vencimiento.setDate(vencimiento.getDate() + plazoDias)
  const vigente = vencimiento >= new Date()
  const vencimientoISO = vencimiento.toISOString().split('T')[0]
  return {
    vigente,
    mensaje: vigente
      ? `Apto físico vigente hasta el ${formatFecha(vencimientoISO)}.`
      : `Apto físico vencido desde el ${formatFecha(vencimientoISO)} — hay que renovarlo.`,
  }
}

const DIA_SEMANA_INDICE = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 }

export function ocurrenciasDeClaseEnMes(clases, anio, mes) {
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const ocurrencias = []
  for (const clase of clases) {
    for (const h of clase.horarios ?? []) {
      for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anio, mes, dia)
        if (fecha.getDay() === DIA_SEMANA_INDICE[h.diaSemana]) {
          ocurrencias.push({
            tipo: 'clase', fecha: fecha.toISOString().split('T')[0],
            titulo: clase.nombre, hora: h.horaInicio,
          })
        }
      }
    }
  }
  return ocurrencias
}

export function proximosItems(clases, eventos, anio, mes, cantidad = 8) {
  // `hoyLocalISO()` en vez de `new Date().toISOString().split('T')[0]` como
  // en el snippet original — mismo bug de UTC-vs-local que ya se corrigió
  // en `esCargoVencido` y `estadoAptoFisico`: de noche en Argentina (UTC-3)
  // "hoy" en UTC ya es mañana, y esto excluía el día de hoy de "Próximos"
  // unas horas antes de tiempo.
  const hoy = hoyLocalISO()
  const clasesDelMes = ocurrenciasDeClaseEnMes(clases, anio, mes)
  const eventosFormateados = eventos
    .filter((e) => e.fecha.startsWith(`${anio}-${String(mes + 1).padStart(2, '0')}`))
    .map((e) => ({ tipo: 'evento', fecha: e.fecha, titulo: e.titulo, hora: e.hora }))

  return [...clasesDelMes, ...eventosFormateados]
    .filter((item) => item.fecha >= hoy)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
    .slice(0, cantidad)
}

export function calcularAlertas({ cargos, asistenciasDelMes, umbral }) {
  const alertas = []

  for (const cargo of cargos) {
    if (esCargoVencido(cargo)) {
      alertas.push({
        id: `venc-${cargo.id}`, urgencia: 'alta',
        mensaje: `Tenés una cuota vencida: ${cargo.concepto}.`,
        ctaLabel: 'Ver pagos', ctaRuta: '/portal/pagos',
      })
    }
  }

  const porcentaje = calcularPorcentajeAsistencia(asistenciasDelMes)
  if (porcentaje < umbral) {
    alertas.push({
      id: 'asistencia-baja', urgencia: 'media',
      mensaje: `Tu asistencia este mes está en ${porcentaje}%, por debajo del mínimo de ${umbral}%.`,
      ctaLabel: 'Ver asistencia', ctaRuta: '/portal/asistencia',
    })
  }

  // Cuarta vez que aparece este bug (ver "Convenciones de código" en
  // Claude.md) — el snippet original usaba en3Dias.toISOString(), que es
  // UTC: de noche en Argentina eso corre la fecha un día, ampliando la
  // ventana de "vence en 3 días" a un cargo que en realidad vence en 4.
  // Se arma el string directo desde los campos locales, sin pasar por UTC.
  const hoy = hoyLocalISO()
  const en3Dias = new Date()
  en3Dias.setDate(en3Dias.getDate() + 3)
  const en3DiasISO = `${en3Dias.getFullYear()}-${String(en3Dias.getMonth() + 1).padStart(2, '0')}-${String(en3Dias.getDate()).padStart(2, '0')}`
  for (const cargo of cargos) {
    if (cargo.estado === 'pendiente' && cargo.fecha_vencimiento >= hoy && cargo.fecha_vencimiento <= en3DiasISO) {
      alertas.push({
        id: `prox-${cargo.id}`, urgencia: 'media',
        mensaje: `${cargo.concepto} vence el ${formatFecha(cargo.fecha_vencimiento)}.`,
        ctaLabel: 'Ver pagos', ctaRuta: '/portal/pagos',
      })
    }
  }

  return alertas
    .sort((a, b) => (a.urgencia === 'alta' ? -1 : 1) - (b.urgencia === 'alta' ? -1 : 1))
    .slice(0, 2)
}

export function itemsDelDia(clases, eventos, anio, mes, fechaISO) {
  const ocurrenciasDelMes = ocurrenciasDeClaseEnMes(clases, anio, mes)
  const clasesDelDia = ocurrenciasDelMes.filter((o) => o.fecha === fechaISO)
  const eventosDelDia = eventos
    .filter((e) => e.fecha === fechaISO)
    .map((e) => ({ tipo: 'evento', fecha: e.fecha, titulo: e.titulo, hora: e.hora }))

  return [...clasesDelDia, ...eventosDelDia].sort((a, b) => a.hora.localeCompare(b.hora))
}

export function generarAsientos(mapaAsientos) {
  const { precio } = mapaAsientos

  const asiento = (fila, numero) => ({
    fila,
    numero,
    clave: `${fila}-${numero}`,
    precio,
  })

  return mapaAsientos.filas.map((filaData) => {
    if (filaData.corrida) {
      return {
        fila: filaData.fila,
        corrida: filaData.corrida.map((numero) => asiento(filaData.fila, numero)),
      }
    }
    return {
      fila: filaData.fila,
      bloques: filaData.bloques.map((bloque) =>
        bloque.map((numero) => asiento(filaData.fila, numero))
      ),
    }
  })
}

export function infoEstadoEntrada(estado) {
  const map = {
    pendiente: { label: 'Pendiente de pago', classes: 'bg-gray-100 text-gray-600' },
    pago_en_revision: { label: 'Pago en proceso', classes: 'bg-amber-50 text-amber-700' },
    pagado: { label: 'Entrada confirmada', classes: 'bg-emerald-50 text-emerald-700' },
  }
  return map[estado] ?? map.pendiente
}
