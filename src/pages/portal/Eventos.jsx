import { Link } from 'react-router-dom'
import Skeleton from '../../components/ui/Skeleton'
import { useEventos } from '../../hooks/useEventos'
import { formatFecha } from '../../utils/format'

export default function Eventos() {
  const { eventos, cargando } = useEventos()

  if (cargando) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Eventos</h1>
      <ul className="space-y-3">
        {eventos.map((evento) => (
          <li key={evento.id}>
            <Link
              to={`/portal/eventos/${evento.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-card p-4 hover:shadow-card-md transition-shadow"
            >
              <p className="text-sm font-semibold text-gray-800">{evento.titulo}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatFecha(evento.fecha)} · {evento.hora} hs · {evento.lugar}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
