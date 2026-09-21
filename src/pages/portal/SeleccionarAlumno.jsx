import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Users } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'

export default function SeleccionarAlumno() {
  const navigate = useNavigate()
  const { alumnosVinculados, setAlumnoActivo } = useContext(AlumnoActivoContext)

  function elegir(alumno) {
    setAlumnoActivo(alumno)
    navigate('/portal', { replace: true })
  }

  // Mismo criterio que en el login: si solo hay 1 alumno vinculado no hace
  // falta elegir. Hace falta también acá (no solo en PortalLogin) porque a
  // esta pantalla también se llega por una recarga de página (RequireRole
  // repobló alumnosVinculados pero alumnoActivo sigue en null), no solo
  // recién saliendo del login.
  useEffect(() => {
    if (alumnosVinculados.length === 1) {
      setAlumnoActivo(alumnosVinculados[0])
      navigate('/portal', { replace: true })
    }
  }, [alumnosVinculados])

  if (alumnosVinculados.length === 1) return <Spinner className="min-h-svh" />

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-primary-subtle p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-gray-800">¿A quién querés ver?</h1>
          <p className="text-sm text-gray-400 mt-1">Elegí una alumna para continuar</p>
        </div>

        {alumnosVinculados.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No tenés alumnas vinculadas"
            description="Hablá con la academia si creés que esto es un error."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-100">
            {alumnosVinculados.map((alumno) => (
              <button
                key={alumno.id}
                type="button"
                onClick={() => elegir(alumno)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-primary-subtle transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar nombre={`${alumno.nombre} ${alumno.apellido}`} />
                  <p className="text-sm font-medium text-gray-800 truncate">{alumno.nombre} {alumno.apellido}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
