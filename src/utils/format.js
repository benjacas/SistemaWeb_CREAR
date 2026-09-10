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
function hoyLocalISO() {
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
