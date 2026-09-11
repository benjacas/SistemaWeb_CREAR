import { useContext } from 'react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useEvaluaciones } from '../../hooks/useEvaluaciones'
import { formatFecha, promedioExamen, promedioGeneral } from '../../utils/format'

function agruparPorGrupo(evaluaciones) {
  const porGrupo = {}
  for (const examen of evaluaciones) {
    if (!porGrupo[examen.grupoNombre]) porGrupo[examen.grupoNombre] = []
    porGrupo[examen.grupoNombre].push(examen)
  }
  return porGrupo
}

export default function Evaluaciones() {
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { evaluaciones, cargando } = useEvaluaciones(alumnoActivo?.id)

  if (cargando) return <Spinner className="mt-20" />

  // Solo Profesorado — las recreativas no tienen evaluación formal (ver footer).
  // El filtro va siempre, aunque hoy el mock no tenga ningún examen recreativo.
  const evaluacionesProfesorado = evaluaciones.filter((e) => e.esProfesorado)
  const porGrupo = agruparPorGrupo(evaluacionesProfesorado)
  const grupos = Object.keys(porGrupo)
  const anioActual = new Date().getFullYear()

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Evaluaciones de {alumnoActivo?.nombre}</h1>

      {grupos.map((grupoNombre) => {
        const examenes = [...porGrupo[grupoNombre]].sort((a, b) => b.fecha.localeCompare(a.fecha))

        return (
          <div key={grupoNombre} className="space-y-4">
            <p className="text-sm text-gray-400 -mt-2">Profesorado · {grupoNombre}</p>

            {/* Promedio general del grupo */}
            <div className="bg-primary-light border border-purple-100 rounded-2xl p-6 text-center">
              <p className="text-xs font-semibold text-primary tracking-wide uppercase">
                Promedio general {anioActual}
              </p>
              <p className="text-5xl font-black text-primary mt-2">{promedioGeneral(examenes)}</p>
            </div>

            {/* Lista de exámenes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Exámenes</h3>
              <ul className="space-y-4">
                {examenes.map((examen) => (
                  <li key={examen.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{examen.titulo}</p>
                        <p className="text-xs text-gray-400">{formatFecha(examen.fecha)}</p>
                      </div>
                      <Badge color="blue">{promedioExamen(examen)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-2">
                      {examen.detalle.map((d, i) => (
                        <div key={i} className="flex flex-col max-w-[45%]">
                          <Badge color="gray">{d.criterioNombre}: {d.nota}</Badge>
                          {d.observaciones && (
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{d.observaciones}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <p className="text-xs text-emerald-700">
          Solo se muestran notas de Profesorado. Las clases recreativas no tienen evaluación formal.
        </p>
      </div>
    </div>
  )
}
