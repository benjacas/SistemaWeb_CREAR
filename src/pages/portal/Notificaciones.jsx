import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { CreditCard, CalendarClock, Star, PartyPopper, CheckCircle2, Bell } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { formatFechaRelativa, infoTipoNotificacion } from '../../utils/format'

const ICONOS_TIPO = {
  'credit-card': CreditCard,
  'calendar-clock': CalendarClock,
  star: Star,
  'party-popper': PartyPopper,
  'check-circle': CheckCircle2,
  bell: Bell,
}

// 'evento' se queda sin CTA a propósito — el módulo de Eventos sigue
// pausado (ver Claude.md), no hay página a la que mandar todavía.
const CTA_POR_TIPO = {
  vencimiento: { label: 'Ver mis pagos', ruta: '/portal/pagos' },
  pago: { label: 'Ver mis pagos', ruta: '/portal/pagos' },
  horario: { label: 'Ver mis clases', ruta: '/portal/clases' },
  evaluacion: { label: 'Ver evaluaciones', ruta: '/portal/evaluaciones' },
}

export default function Notificaciones() {
  const navigate = useNavigate()
  const { notificaciones, cargando, marcarLeida, marcarTodasLeidas } = useOutletContext()
  const [seleccionada, setSeleccionada] = useState(null)

  if (cargando) return <Spinner className="mt-20" />

  const hayNoLeidas = notificaciones.some((n) => !n.leida)
  const ordenadas = [...notificaciones].sort((a, b) => {
    if (a.leida !== b.leida) return a.leida ? 1 : -1
    return b.fecha.localeCompare(a.fecha)
  })
  const cta = seleccionada ? CTA_POR_TIPO[seleccionada.tipo] : null

  function abrir(notificacion) {
    marcarLeida(notificacion.id)
    setSeleccionada(notificacion)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Notificaciones</h1>
        {hayNoLeidas && (
          <button type="button" onClick={marcarTodasLeidas} className="text-xs font-medium text-primary">
            Marcar todas
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-2">
        <ul className="divide-y divide-gray-100">
          {ordenadas.map((n) => {
            const info = infoTipoNotificacion(n.tipo)
            const Icon = ICONOS_TIPO[info.icono] ?? Bell
            return (
              <li
                key={n.id}
                onClick={() => abrir(n)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  n.leida ? 'hover:bg-gray-50' : 'bg-primary-light'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${info.classes}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!n.leida && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <p className="text-sm font-medium text-gray-800 truncate">{n.titulo}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{n.mensaje}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{formatFechaRelativa(n.fecha)}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <Modal
        isOpen={seleccionada !== null}
        onClose={() => setSeleccionada(null)}
        title={infoTipoNotificacion(seleccionada?.tipo).label}
        size="sm"
      >
        {seleccionada && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{seleccionada.titulo}</p>
              <p className="text-sm text-gray-600 mt-1">{seleccionada.mensaje}</p>
              <p className="text-xs text-gray-400 mt-2">{formatFechaRelativa(seleccionada.fecha)}</p>
            </div>
            {cta && (
              <Button variant="primary" className="w-full justify-center" onClick={() => navigate(cta.ruta)}>
                {cta.label}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
