import { useContext, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useAsistencias } from '../../hooks/useAsistencias'
import { grupoAsistenciaDemo, umbralAsistenciaDemo } from '../../mock/fixtures'
import {
  agruparAsistenciasPorMes,
  calcularPorcentajeAsistencia,
  evaluarAsistencia,
  formatDiaClase,
  formatMesLabel,
} from '../../utils/format'

export default function Asistencia() {
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { asistencias, cargando } = useAsistencias(alumnoActivo?.id)
  const [mesSeleccionado, setMesSeleccionado] = useState(null)

  if (cargando) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
    )
  }

  const porMes = agruparAsistenciasPorMes(asistencias)
  const meses = Object.keys(porMes).sort() // ascendente: más antiguo primero
  const mesActivo = mesSeleccionado ?? meses[meses.length - 1]
  const asistenciasMes = porMes[mesActivo] ?? []

  const porcentaje = calcularPorcentajeAsistencia(asistenciasMes)
  const presentes = asistenciasMes.filter((a) => a.presente).length
  const total = asistenciasMes.length
  const { alCorriente, mensaje, classes } = evaluarAsistencia(porcentaje, umbralAsistenciaDemo)
  const colorNumero = alCorriente ? 'text-emerald-600' : 'text-amber-600'
  const colorBorde = alCorriente ? 'border-emerald-100' : 'border-amber-100'

  return (
    <div className="p-4 space-y-4">
      {/* Título */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Asistencia de {alumnoActivo?.nombre}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{grupoAsistenciaDemo.nombre}</p>
      </div>

      {/* Selector de mes */}
      <div className="flex gap-2">
        {meses.map((mes) => (
          <button
            key={mes}
            type="button"
            onClick={() => setMesSeleccionado(mes)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              mes === mesActivo
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {formatMesLabel(mes)}
          </button>
        ))}
      </div>

      {/* Resumen del mes */}
      <div className={`${classes} border ${colorBorde} rounded-2xl p-6 text-center transition-colors`}>
        <p className="text-xs font-semibold tracking-wide uppercase">Asistencia del mes</p>
        <p className={`text-5xl font-black mt-2 ${colorNumero}`}>{porcentaje}%</p>
        <p className="text-sm mt-1">{presentes} de {total} clases</p>
      </div>

      {/* Detalle por clase */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Detalle por clase</h3>
        <ul className="space-y-1">
          {asistenciasMes.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl">
              <p className="text-sm font-medium text-gray-700">{formatDiaClase(a.fecha)}</p>
              <Badge color={a.presente ? 'green' : 'red'}>{a.presente ? '✓ Presente' : 'Ausente'}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className={`${classes} border ${colorBorde} rounded-2xl p-4 transition-colors`}>
        <p className="text-xs">
          La academia te avisa si la asistencia baja del {umbralAsistenciaDemo}%. {mensaje}
        </p>
      </div>
    </div>
  )
}
