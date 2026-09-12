import { ChevronLeft, ChevronRight } from 'lucide-react'

const DIAS_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function CalendarioMensual({
  anio, mes, ocurrencias, diaSeleccionado, onSeleccionarDia, onMesAnterior, onMesSiguiente,
}) {
  const hoy = new Date()
  const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7 // 0 = lunes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const porDia = {}
  for (const o of ocurrencias) {
    if (!porDia[o.fecha]) porDia[o.fecha] = []
    porDia[o.fecha].push(o)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onMesAnterior}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-light hover:text-primary transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-gray-800">{MESES[mes]} {anio}</p>
        <button
          type="button"
          onClick={onMesSiguiente}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-light hover:text-primary transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1">
        {DIAS_HEADER.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: primerDiaSemana }).map((_, i) => (
          <div key={`vacio-${i}`} />
        ))}
        {Array.from({ length: diasEnMes }).map((_, i) => {
          const dia = i + 1
          const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const items = porDia[fechaStr] ?? []
          const tieneClase = items.some((it) => it.tipo === 'clase')
          const tieneEvento = items.some((it) => it.tipo === 'evento')
          const esHoy = hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === dia
          const seleccionado = fechaStr === diaSeleccionado

          return (
            <button
              type="button"
              key={dia}
              onClick={() => onSeleccionarDia(fechaStr)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              {/* El anillo de "hoy" y el fondo de "seleccionado" son
                  independientes entre sí — si tocás el día de hoy, tienen
                  que poder verse los dos estados a la vez. */}
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  seleccionado ? 'bg-primary text-white' : esHoy ? 'text-primary' : 'text-gray-700 hover:bg-gray-100'
                } ${esHoy ? 'ring-2 ring-primary ring-offset-1' : ''}`}
              >
                {dia}
              </span>
              <span className="flex gap-0.5 h-1.5">
                {tieneClase && <span className={`w-1.5 h-1.5 rounded-full ${seleccionado ? 'bg-white' : 'bg-primary'}`} />}
                {tieneEvento && <span className={`w-1.5 h-1.5 rounded-full ${seleccionado ? 'bg-white' : 'bg-pink-500'}`} />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Clase
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Evento
        </span>
      </div>
    </div>
  )
}
