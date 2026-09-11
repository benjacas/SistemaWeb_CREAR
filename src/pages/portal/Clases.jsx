import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import ClaseDetalleModal from '../../components/portal/ClaseDetalleModal'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useToast } from '../../context/ToastContext'
import { useClases } from '../../hooks/useClases'
import { estadoCupo } from '../../utils/format'

const MENSAJE_SOLICITUD = {
  inscripcion: 'Solicitud enviada. La academia va a confirmar tu lugar.',
  lista_espera: 'Te anotamos en la lista de espera. Te avisamos si se libera un lugar.',
}

const ESTADO_SOLICITUD_LABEL = {
  inscripcion: 'Pendiente de confirmación',
  lista_espera: 'En lista de espera',
}

function BadgeCupo({ clase }) {
  const { lleno, label } = estadoCupo(clase)
  const color = lleno ? 'red' : clase.cupoDisponible <= 2 ? 'yellow' : 'green'
  return <Badge color={color}>{label}</Badge>
}

export default function Clases() {
  const navigate = useNavigate()
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { misClases, clasesDisponibles, cargando, solicitudes, solicitarInscripcion } = useClases(alumnoActivo?.id)
  const toast = useToast()
  const [claseDetalle, setClaseDetalle] = useState(null)

  if (cargando) return <Spinner className="mt-20" />

  function handleSolicitar(claseId, tipo) {
    solicitarInscripcion(claseId, tipo)
    toast(MENSAJE_SOLICITUD[tipo])
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Clases</h1>

      <button
        type="button"
        onClick={() => navigate('/portal/horarios')}
        className="w-full flex items-center justify-between gap-2 bg-white rounded-2xl border border-gray-100 shadow-card p-4 cursor-pointer hover:shadow-card-md transition-shadow"
      >
        <span className="text-sm font-medium text-gray-700">Ver calendario de horarios</span>
        <ArrowRight size={16} className="text-primary shrink-0" />
      </button>

      {/* Mis clases */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Mis clases</h3>
        <ul className="space-y-1">
          {misClases.map((clase) => (
            <li
              key={clase.id}
              onClick={() => setClaseDetalle(clase)}
              className="p-2.5 rounded-xl cursor-pointer hover:bg-primary-subtle transition-colors"
            >
              <p className="text-sm font-medium text-gray-800 truncate">{clase.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{clase.nivel} · {clase.horario}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Clases disponibles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Clases disponibles</h3>
        <ul className="space-y-3">
          {clasesDisponibles.map((clase) => {
            const { lleno } = estadoCupo(clase)
            const solicitud = solicitudes[clase.id]
            const deshabilitada = lleno && !solicitud

            return (
              <li
                key={clase.id}
                className={`rounded-xl border border-gray-100 p-3 transition-opacity ${deshabilitada ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{clase.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{clase.nivel} · {clase.horario}</p>
                    <p className="text-xs text-gray-400 truncate">{clase.profesora}</p>
                  </div>
                  <BadgeCupo clase={clase} />
                </div>

                {solicitud ? (
                  <p className="text-xs font-medium text-primary mt-2.5">{ESTADO_SOLICITUD_LABEL[solicitud]}</p>
                ) : lleno ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center mt-2.5"
                    onClick={() => handleSolicitar(clase.id, 'lista_espera')}
                  >
                    Anotarme en lista de espera
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center mt-2.5"
                    onClick={() => handleSolicitar(clase.id, 'inscripcion')}
                  >
                    Inscribirme
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <ClaseDetalleModal isOpen={claseDetalle !== null} onClose={() => setClaseDetalle(null)} clase={claseDetalle} />
    </div>
  )
}
