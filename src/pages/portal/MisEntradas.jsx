import { useOutletContext } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { formatFecha, formatMoneda, formatButacaCorta, infoEstadoPago } from '../../utils/format'

const COLOR_POR_ESTADO = { pendiente: 'gray', pago_en_revision: 'yellow', pagado: 'green' }

export default function MisEntradas() {
  const { misEntradasApi } = useOutletContext()
  const { entradas, cargando, marcarComoPagada } = misEntradasApi

  if (cargando) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Mis entradas</h1>

      {entradas.length === 0 ? (
        <EmptyState icon={Ticket} title="Todavía no tenés entradas" description="Las compras que hagas van a aparecer acá." />
      ) : (
        <ul className="space-y-3">
          {entradas.map((entrada) => {
            const { label } = infoEstadoPago(entrada.estado)
            return (
              <li key={entrada.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{entrada.eventoTitulo}</p>
                    <p className="text-xs text-gray-400">
                      {formatFecha(entrada.fecha)} · {entrada.lugar}
                    </p>
                  </div>
                  <Badge color={COLOR_POR_ESTADO[entrada.estado] ?? 'gray'}>{label}</Badge>
                </div>

                <p className="text-xs text-gray-500">
                  {entrada.butacas.map((b) => formatButacaCorta(b)).join(', ')}
                </p>
                <p className="text-sm font-semibold text-gray-800">{formatMoneda(entrada.montoTotal)}</p>

                {entrada.estado === 'pagado' && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Código de entrada</p>
                    <p className="font-mono text-lg font-bold text-gray-800 tracking-widest">
                      {entrada.id.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* TEMPORAL — sacar cuando exista backend real (webhook de Mercado Pago) */}
                {entrada.estado === 'pago_en_revision' && (
                  <Button variant="secondary" size="sm" onClick={() => marcarComoPagada(entrada.id)}>
                    [DEV] Simular confirmación de secretaría
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
