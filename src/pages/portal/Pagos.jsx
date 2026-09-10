import { useContext } from 'react'
import { Wallet, CalendarCheck2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useCargos } from '../../hooks/useCargos'
import { formatMoneda, formatFecha, obtenerBadgeCargo } from '../../utils/format'

const COLOR_BADGE_POR_LABEL = {
  Pagado: 'green',
  Pendiente: 'yellow',
  Parcial: 'blue',
  Vencido: 'red',
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatPeriodo(periodo) {
  return capitalizar(
    new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(`${periodo}-01T00:00:00`))
  )
}

function BadgeCargo({ cargo }) {
  const { label } = obtenerBadgeCargo(cargo)
  return <Badge color={COLOR_BADGE_POR_LABEL[label] ?? 'gray'}>{label}</Badge>
}

export default function Pagos() {
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { cargos, cargando } = useCargos(alumnoActivo?.id)

  if (cargando) return <Spinner className="mt-20" />

  const pendienteTotal = cargos
    .filter((c) => c.estado === 'pendiente' || c.estado === 'parcial')
    .reduce((acc, c) => acc + c.monto_final, 0)

  const pagados = cargos.filter((c) => c.estado === 'pagado')
  const alDiaDesde = pagados.length > 0
    ? pagados.reduce((mas, c) => (c.periodo < mas.periodo ? c : mas)).periodo
    : null

  const proximoPendiente = cargos
    .filter((c) => c.estado === 'pendiente')
    .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))[0]

  const historial = cargos
    .filter((c) => c.id !== proximoPendiente?.id)
    .sort((a, b) => b.periodo.localeCompare(a.periodo))

  return (
    <div className="p-4 space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <div className="p-2 rounded-xl bg-amber-50 w-fit mb-2">
            <Wallet size={18} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-800 leading-tight">{formatMoneda(pendienteTotal)}</p>
          <p className="text-xs text-gray-400">Pendiente</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <div className="p-2 rounded-xl bg-emerald-50 w-fit mb-2">
            <CalendarCheck2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-800 leading-tight">
            {alDiaDesde ? formatPeriodo(alDiaDesde) : '—'}
          </p>
          <p className="text-xs text-gray-400">Al día desde</p>
        </div>
      </div>

      {/* Próximo cargo pendiente */}
      {proximoPendiente ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{proximoPendiente.concepto}</p>
              <p className="text-xs text-gray-400 mt-0.5">Vence: {formatFecha(proximoPendiente.fecha_vencimiento)}</p>
            </div>
            <BadgeCargo cargo={proximoPendiente} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatMoneda(proximoPendiente.monto_final)}</p>
          <Button
            variant="primary"
            className="w-full justify-center"
            disabled
            title="Integración de pago pendiente"
          >
            Pagar
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center">
          <p className="text-sm font-semibold text-emerald-600">¡Estás al día!</p>
          <p className="text-xs text-gray-400 mt-1">No hay cuotas pendientes</p>
        </div>
      )}

      {/* Historial */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Historial</h3>
        <ul className="space-y-1">
          {historial.map((cargo) => (
            <li key={cargo.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-primary-subtle transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{cargo.concepto}</p>
                <p className="text-xs text-gray-400">
                  {cargo.estado === 'pagado' ? `Pagado el ${formatFecha(cargo.fecha_pago)}` : formatPeriodo(cargo.periodo)}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-sm font-semibold text-gray-800">{formatMoneda(cargo.monto_final)}</p>
                <BadgeCargo cargo={cargo} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
