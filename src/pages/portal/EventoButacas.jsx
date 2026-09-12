import { useParams, Navigate } from 'react-router-dom'
import Spinner from '../../components/ui/Spinner'
import MapaButacas from '../../components/portal/MapaButacas'
import { useEvento } from '../../hooks/useEvento'

export default function EventoButacas() {
  const { id } = useParams()
  const { evento, butacasOcupadas, cargando } = useEvento(id)

  if (cargando) return <Spinner className="mt-20" />
  // Sin mapa de asientos no hay nada que elegir acá (ej. entrada libre) —
  // se vuelve al detalle en vez de mostrar una grilla vacía.
  if (!evento || !evento.mapaAsientos) return <Navigate to={`/portal/eventos/${id}`} replace />

  return <MapaButacas evento={evento} butacasOcupadas={butacasOcupadas} />
}
