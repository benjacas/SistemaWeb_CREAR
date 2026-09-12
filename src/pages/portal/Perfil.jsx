import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Phone, KeyRound, Bell, CreditCard, HelpCircle, ChevronRight, LogOut, Ticket } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EditarContactoModal from '../../components/portal/EditarContactoModal'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useToast } from '../../context/ToastContext'
import { familiaDemo, configInstitucionalDemo } from '../../mock/fixtures'
import { estadoAptoFisico } from '../../utils/format'

// Sin página de destino todavía para "Métodos de pago guardados" y "Ayuda y
// soporte" — quedan con badge "Próximamente" en vez de flecha, sin cursor de
// puntero, mismo criterio que "Horarios"/"Próx. evento" en Home. "Cambiar
// clave de acceso" y "Notificaciones" tampoco tienen destino real todavía,
// pero no forman parte de esta tarea puntual — quedan como estaban.
const ACCESOS = [
  { key: 'clave', icon: KeyRound, label: 'Cambiar clave de acceso' },
  { key: 'notificaciones', icon: Bell, label: 'Notificaciones', valor: 'Activados' },
  { key: 'pago', icon: CreditCard, label: 'Métodos de pago guardados', proximamente: true },
  { key: 'ayuda', icon: HelpCircle, label: 'Ayuda y soporte', proximamente: true },
]

export default function Perfil() {
  const navigate = useNavigate()
  const { alumnoActivo, setAlumnoActivo, alumnosVinculados, actualizarAlumnoActivo } = useContext(AlumnoActivoContext)
  const toast = useToast()
  const [editandoContacto, setEditandoContacto] = useState(false)
  const [confirmandoSalir, setConfirmandoSalir] = useState(false)

  function handleGuardarContacto(cambios) {
    actualizarAlumnoActivo(cambios)
    toast('Datos de contacto actualizados.')
  }

  return (
    <div className="p-4 space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center gap-2 py-2">
        <Avatar nombre={familiaDemo.nombre} size={72} />
        <div>
          <p className="text-lg font-bold text-gray-800">{familiaDemo.nombre}</p>
          <p className="text-xs text-gray-400">DNI {familiaDemo.dni}</p>
        </div>
      </div>

      {/* Mis alumnas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-3">Mis alumnas</h3>
        <ul className="space-y-1">
          {alumnosVinculados.map((alumno) => {
            const activa = alumno.id === alumnoActivo?.id
            const apto = estadoAptoFisico(alumno, configInstitucionalDemo.plazoDiasAptoFisico)
            return (
              <li
                key={alumno.id}
                onClick={() => setAlumnoActivo(alumno)}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer hover:bg-primary-subtle transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {alumno.nombre} {alumno.apellido}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{alumno.grupoPrincipal}</p>
                  <p className={`text-xs leading-snug ${apto.vigente ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {apto.mensaje}
                  </p>
                </div>
                {activa && (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" />
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Accesos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-2">
        <ul className="divide-y divide-gray-100">
          <li
            onClick={() => setEditandoContacto(true)}
            className="flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-primary-subtle rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Phone size={18} className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-700 truncate">Editar datos de contacto</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </li>

          <li
            onClick={() => navigate('/portal/mis-entradas')}
            className="flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-primary-subtle rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Ticket size={18} className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-700 truncate">Mis entradas</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </li>

          {ACCESOS.map(({ key, icon: Icon, label, valor, proximamente }) => (
            <li key={key} className="flex items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 truncate">{label}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {valor && <span className="text-xs text-gray-400">{valor}</span>}
                {proximamente ? (
                  <Badge color="gray">Próximamente</Badge>
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Cerrar sesión — sin login real todavía, redirige nomás (ver Claude.md) */}
      <button
        type="button"
        onClick={() => setConfirmandoSalir(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>

      <EditarContactoModal
        isOpen={editandoContacto}
        onClose={() => setEditandoContacto(false)}
        alumno={alumnoActivo}
        onGuardar={handleGuardarContacto}
      />

      <ConfirmModal
        isOpen={confirmandoSalir}
        onClose={() => setConfirmandoSalir(false)}
        onConfirm={() => navigate('/login')}
        title="Cerrar sesión"
        message="¿Seguro que querés cerrar sesión?"
        confirmLabel="Confirmar"
      />
    </div>
  )
}
