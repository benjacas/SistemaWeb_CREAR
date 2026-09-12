import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { useEvento } from '../../hooks/useEvento'
import { formatFecha } from '../../utils/format'

export default function EventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { evento, cargando } = useEvento(id)

  if (cargando) return <Spinner className="mt-20" />
  if (!evento) return <p className="p-4 text-sm text-gray-400">Evento no encontrado.</p>

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{evento.titulo}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {formatFecha(evento.fecha)} · {evento.hora} hs
        </p>
        <p className="text-sm text-gray-400">{evento.lugar}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <p className="text-sm text-gray-700 leading-relaxed">{evento.descripcion}</p>
        {evento.fechaLimitePago && (
          <p className="text-xs text-amber-600 mt-3">
            Fecha límite de pago: {formatFecha(evento.fechaLimitePago)}
          </p>
        )}
      </div>

      {evento.mapaAsientos ? (
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={() => navigate(`/portal/eventos/${evento.id}/butacas`)}
        >
          Elegir mis butacas
        </Button>
      ) : (
        <p className="text-xs text-gray-400 text-center">Entrada libre y gratuita — no requiere reserva.</p>
      )}
    </div>
  )
}
