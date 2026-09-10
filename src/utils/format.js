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
  parcial: { label: 'Parcial', classes: 'bg-primary-light text-primary ring-1 ring-purple-200' },
  pendiente: { label: 'Pendiente', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
}

export function badgeEstadoCargo(estado) {
  return ESTADOS_CARGO[estado] ?? ESTADOS_CARGO.pendiente
}

export function obtenerBadgeCargo(cargo) {
  if (esCargoVencido(cargo)) return { label: 'Vencido', classes: 'bg-red-50 text-red-700' }
  return badgeEstadoCargo(cargo.estado) // pendiente / pagado / parcial
}

export function calcularPorcentajeAsistencia(asistencias) {
  if (!asistencias || asistencias.length === 0) return 0
  const presentes = asistencias.filter((a) => a.presente).length
  return Math.round((presentes / asistencias.length) * 100)
}
