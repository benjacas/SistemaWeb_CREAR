import { useContext, useState } from 'react'
import { Users, PartyPopper } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import CalendarioMensual from '../../components/portal/CalendarioMensual'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useClases } from '../../hooks/useClases'
import { eventosCalendarioDemo } from '../../mock/fixtures'
import { ocurrenciasDeClaseEnMes, proximosItems, formatDiaClase, formatFecha } from '../../utils/format'

const hoy = new Date()

export default function Horarios() {
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { misClases, cargando } = useClases(alumnoActivo?.id)
  const [mesVisto, setMesVisto] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() })

  if (cargando) return <Spinner className="mt-20" />

  function cambiarMes(delta) {
    setMesVisto(({ anio, mes }) => {
      const fecha = new Date(anio, mes + delta, 1)
      return { anio: fecha.getFullYear(), mes: fecha.getMonth() }
    })
  }

  // El calendario muestra el mes que se esté navegando (mesVisto, estado
  // local de esta página); "Próximos" en cambio siempre mira a partir de
  // hoy en el mes real — no se recalcula al mover el calendario, es una
  // lista de "qué viene" independiente de qué mes estés mirando arriba.
  const ocurrenciasClasesMes = ocurrenciasDeClaseEnMes(misClases, mesVisto.anio, mesVisto.mes)
  const ocurrenciasEventosMes = eventosCalendarioDemo
    .filter((e) => e.fecha.startsWith(`${mesVisto.anio}-${String(mesVisto.mes + 1).padStart(2, '0')}`))
    .map((e) => ({ tipo: 'evento', fecha: e.fecha, titulo: e.titulo, hora: e.hora }))
  const ocurrenciasMes = [...ocurrenciasClasesMes, ...ocurrenciasEventosMes]

  const proximos = proximosItems(misClases, eventosCalendarioDemo, hoy.getFullYear(), hoy.getMonth())
  const anioReal = hoy.getFullYear()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Horarios</h1>

      <CalendarioMensual
        anio={mesVisto.anio}
        mes={mesVisto.mes}
        ocurrencias={ocurrenciasMes}
        onMesAnterior={() => cambiarMes(-1)}
        onMesSiguiente={() => cambiarMes(1)}
      />

      {/* Próximos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Próximos</h3>
        {proximos.length === 0 ? (
          <p className="text-xs text-gray-400">No hay clases ni eventos próximos.</p>
        ) : (
          <ul className="space-y-1">
            {proximos.map((item, i) => {
              const Icon = item.tipo === 'clase' ? Users : PartyPopper
              const esEsteAnio = new Date(`${item.fecha}T00:00:00`).getFullYear() === anioReal
              const fechaLabel = esEsteAnio ? formatDiaClase(item.fecha) : formatFecha(item.fecha)
              return (
                <li key={`${item.tipo}-${item.fecha}-${item.hora}-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      item.tipo === 'clase' ? 'bg-primary-light text-primary' : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.titulo}</p>
                    <p className="text-xs text-gray-400">{fechaLabel} · {item.hora}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
