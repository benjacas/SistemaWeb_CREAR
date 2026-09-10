import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Clock, PartyPopper } from 'lucide-react'
import RadialProgress from '../../components/ui/RadialProgress'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useAsistencias } from '../../hooks/useAsistencias'
import { useCargos } from '../../hooks/useCargos'
import {
  familiaDemo,
  proximoEventoDemo,
  horariosResumenDemo,
  grupoAsistenciaDemo,
  umbralAsistenciaDemo,
} from '../../mock/fixtures'
import { agruparAsistenciasPorMes, calcularPorcentajeAsistencia, formatMesLabel } from '../../utils/format'

function InfoCard({ icon: Icon, label, value, onClick, className = '' }) {
  const clickable = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-col gap-2 transition-shadow ${
        clickable ? 'cursor-pointer hover:shadow-card-md' : ''
      } ${className}`}
    >
      <div className="p-2 rounded-xl bg-primary-light w-fit">
        <Icon size={18} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-800 leading-tight truncate">{value}</p>
        <p className="text-xs text-gray-400 truncate">{label}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { asistencias } = useAsistencias(alumnoActivo?.id)
  const { cargos } = useCargos(alumnoActivo?.id)

  // Home muestra el mes más reciente — mismo criterio que la selección por
  // defecto de la página de Asistencia, para que el % nunca se desincronice.
  const porMes = agruparAsistenciasPorMes(asistencias)
  const mesesOrdenados = Object.keys(porMes).sort()
  const mesActual = mesesOrdenados[mesesOrdenados.length - 1]
  const asistenciasMesActual = porMes[mesActual] ?? []

  const porcentajeAsistencia = calcularPorcentajeAsistencia(asistenciasMesActual)
  const cuotasPendientes = cargos.filter((c) => c.estado !== 'pagado').length

  return (
    <div className="p-4 space-y-4">
      {/* Saludo */}
      <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-primary to-primary-dark shadow-card-md">
        <p className="text-sm text-white/80">Hola,</p>
        <h1 className="text-xl font-bold">{familiaDemo.nombre}</h1>
      </div>

      {/* Asistencia */}
      <div
        onClick={() => navigate('/portal/asistencia')}
        className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-card-md transition-shadow"
      >
        <RadialProgress porcentaje={porcentajeAsistencia} tamano={72} umbral={umbralAsistenciaDemo} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{grupoAsistenciaDemo.nombre}</p>
          <p className="text-xs text-gray-400">{mesActual ? formatMesLabel(mesActual) : ''}</p>
        </div>
      </div>

      {/* Grid de 3 tarjetas */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          icon={Wallet}
          label="Cuotas pendientes"
          value={cuotasPendientes}
          onClick={() => navigate('/portal/pagos')}
        />
        <InfoCard icon={Clock} label="Clases por semana" value={horariosResumenDemo.cantidadPorSemana} />
        <InfoCard
          icon={PartyPopper}
          label={proximoEventoDemo.titulo}
          value={`${proximoEventoDemo.diasRestantes} días`}
          className="col-span-2"
        />
      </div>
    </div>
  )
}
