import { useContext } from 'react'
import { Wallet, Clock, PartyPopper, Shirt, Image } from 'lucide-react'
import RadialProgress from '../../components/ui/RadialProgress'
import { AlumnoActivoContext } from '../../context/AlumnoActivoContext'
import { useAsistencias } from '../../hooks/useAsistencias'
import { useCargos } from '../../hooks/useCargos'
import { familiaDemo, proximoEventoDemo, horariosResumenDemo } from '../../mock/fixtures'
import { calcularPorcentajeAsistencia } from '../../utils/format'

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function InfoCard({ icon: Icon, label, value, disabled = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-col gap-2 ${disabled ? 'opacity-50' : ''}`}>
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
  const { alumnoActivo } = useContext(AlumnoActivoContext)
  const { asistencias } = useAsistencias(alumnoActivo?.id)
  const { cargos } = useCargos(alumnoActivo?.id)

  const porcentajeAsistencia = calcularPorcentajeAsistencia(asistencias)
  const grupoAsistencia = asistencias[0]?.grupo ?? ''
  const mesAsistencia = asistencias[0]
    ? capitalizar(
        new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(
          new Date(`${asistencias[0].fecha}T00:00:00`)
        )
      )
    : ''
  const cuotasPendientes = cargos.filter((c) => c.estado !== 'pagado').length

  return (
    <div className="p-4 space-y-4">
      {/* Saludo */}
      <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-primary to-primary-dark shadow-card-md">
        <p className="text-sm text-white/80">Hola,</p>
        <h1 className="text-xl font-bold">{familiaDemo.nombre}</h1>
      </div>

      {/* Asistencia */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center gap-4">
        <RadialProgress porcentaje={porcentajeAsistencia} tamano={72} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{grupoAsistencia}</p>
          <p className="text-xs text-gray-400">{mesAsistencia}</p>
        </div>
      </div>

      {/* Grid de 4 tarjetas */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={Wallet} label="Cuotas pendientes" value={cuotasPendientes} />
        <InfoCard icon={Clock} label="Clases por semana" value={horariosResumenDemo.cantidadPorSemana} />
        <InfoCard icon={PartyPopper} label={proximoEventoDemo.titulo} value={`${proximoEventoDemo.diasRestantes} días`} />
        <InfoCard icon={Shirt} label="Vestuario" value="Próximamente" disabled />
      </div>

      {/* Fotos recientes — sin backend de galería todavía, ver Claude.md */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 opacity-50">
        <div className="flex items-center gap-2 mb-2">
          <Image size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-500">Fotos recientes</h3>
        </div>
        <button type="button" disabled className="text-xs font-medium text-gray-400 cursor-not-allowed">
          Ver galería · Próximamente
        </button>
      </div>
    </div>
  )
}
