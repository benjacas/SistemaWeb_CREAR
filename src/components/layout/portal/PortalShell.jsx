import { Outlet } from 'react-router-dom'
import PortalHeader from './PortalHeader'
import BottomNav from './BottomNav'
import { useNotificaciones } from '../../../hooks/useNotificaciones'

export default function PortalShell() {
  // Se llama una sola vez acá arriba (no en PortalHeader ni en Notificaciones.jsx
  // por separado) para que el contador de la campanita y "marcar leída" en la
  // página compartan el mismo estado — dos llamadas a useNotificaciones()
  // tendrían cada una su propio useState y nunca se sincronizarían entre sí.
  const notificacionesApi = useNotificaciones()
  const noLeidas = notificacionesApi.notificaciones.filter((n) => !n.leida).length

  return (
    <div className="flex flex-col h-svh max-w-md mx-auto bg-primary-subtle">
      <PortalHeader noLeidas={noLeidas} />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={notificacionesApi} />
      </main>
      <BottomNav />
    </div>
  )
}
