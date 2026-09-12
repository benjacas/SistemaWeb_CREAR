import { Outlet, useLocation } from 'react-router-dom'
import PortalHeader from './PortalHeader'
import BottomNav from './BottomNav'
import { useNotificaciones } from '../../../hooks/useNotificaciones'
import { useMisEntradas } from '../../../hooks/useMisEntradas'

// Rutas del portal a las que se llega navegando desde otra página (no
// viven en BottomNav) — el header les muestra una flecha "volver" en vez
// del avatar. PortalHeader se renderiza una sola vez acá (layout
// compartido con <Outlet/>), así que ninguna página puede pasarle la prop
// directamente; por eso la decisión se toma acá, mirando la ruta actual.
const RUTAS_CON_VOLVER = ['/portal/perfil', '/portal/notificaciones', '/portal/horarios', '/portal/mis-entradas']

function tieneVolver(pathname) {
  return RUTAS_CON_VOLVER.includes(pathname) || pathname.startsWith('/portal/eventos')
}

export default function PortalShell() {
  const location = useLocation()
  const mostrarVolver = tieneVolver(location.pathname)

  // Se llaman una sola vez acá arriba (no en cada página por separado) para
  // que el estado se comparta entre el header y las páginas, o entre
  // páginas que no están montadas al mismo tiempo (ResumenCompra confirma
  // la compra y navega a MisEntradas: si cada una tuviera su propio
  // useMisEntradas(), la entrada nueva se perdería al desmontarse
  // ResumenCompra). Mismo motivo que ya aplicaba para notificaciones.
  const notificacionesApi = useNotificaciones()
  const misEntradasApi = useMisEntradas()
  const noLeidas = notificacionesApi.notificaciones.filter((n) => !n.leida).length

  return (
    <div className="flex flex-col h-svh max-w-md mx-auto bg-primary-subtle">
      <PortalHeader noLeidas={noLeidas} mostrarVolver={mostrarVolver} />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ notificacionesApi, misEntradasApi }} />
      </main>
      <BottomNav />
    </div>
  )
}
