import { useParams } from 'react-router-dom'
import { Shirt } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { useVestuarioEvento } from '../../hooks/useVestuarioEvento'
import { formatMoneda, infoEstadoPago } from '../../utils/format'

const COLOR_POR_ESTADO = { pendiente: 'gray', pago_en_revision: 'yellow', pagado: 'green' }

export default function VestuarioEvento() {
  const { id } = useParams()
  const { items, cargando, pagarVestuario, marcarComoPagado } = useVestuarioEvento(id)

  if (cargando) return <Spinner className="mt-20" />

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Vestuario</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Sin vestuario cargado"
          description="Todavía no hay ítems de vestuario para este evento."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const { label } = infoEstadoPago(item.estado)
            const pagoDeshabilitado = item.estado !== 'pendiente'
            return (
              <li key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.descripcion}</p>
                  </div>
                  <Badge color={COLOR_POR_ESTADO[item.estado] ?? 'gray'}>{label}</Badge>
                </div>
                <p className="text-sm font-semibold text-gray-800">{formatMoneda(item.precio)}</p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  disabled={pagoDeshabilitado}
                  onClick={() => pagarVestuario(item.id)}
                >
                  Pagar
                </Button>

                {/* TEMPORAL — sacar cuando exista backend real (webhook de Mercado Pago) */}
                {item.estado === 'pago_en_revision' && (
                  <Button variant="secondary" size="sm" onClick={() => marcarComoPagado(item.id)}>
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
