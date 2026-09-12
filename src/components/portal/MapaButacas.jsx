import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { generarAsientos, formatMoneda } from '../../utils/format'

export default function MapaButacas({ evento, butacasOcupadas }) {
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState([])

  function toggleAsiento(asiento) {
    setSeleccion((prev) =>
      prev.some((a) => a.clave === asiento.clave)
        ? prev.filter((a) => a.clave !== asiento.clave)
        : [...prev, asiento]
    )
  }

  const total = seleccion.reduce((acc, a) => acc + a.precio, 0)

  function continuar() {
    navigate(`/portal/eventos/${evento.id}/resumen`, { state: { butacasSeleccionadas: seleccion } })
  }

  return (
    <div>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{evento.titulo}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Elegí tus butacas</p>
        </div>

        {evento.mapaAsientos.sectores.map((sector) => {
          const asientos = generarAsientos(sector)
          return (
            <div key={sector.nombre} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">{sector.nombre}</p>
                <p className="text-xs text-gray-400">{formatMoneda(sector.precio)}</p>
              </div>
              <div className="space-y-1.5">
                {sector.filas.map((fila) => (
                  <div key={fila} className="flex items-center gap-1.5 justify-center">
                    <span className="text-[10px] text-gray-300 w-3 text-right mr-0.5">{fila}</span>
                    {asientos
                      .filter((a) => a.fila === fila)
                      .map((asiento) => {
                        const ocupado = butacasOcupadas.includes(asiento.clave)
                        const seleccionado = seleccion.some((a) => a.clave === asiento.clave)
                        return (
                          <button
                            key={asiento.clave}
                            type="button"
                            disabled={ocupado}
                            onClick={() => toggleAsiento(asiento)}
                            aria-label={`Butaca ${asiento.clave}`}
                            className={`w-6 h-6 rounded text-[9px] flex items-center justify-center font-medium transition-colors ${
                              ocupado
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : seleccionado
                                  ? 'bg-primary text-white'
                                  : 'bg-primary-light text-primary hover:bg-primary/20'
                            }`}
                          >
                            {asiento.columna}
                          </button>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="flex items-center gap-4 text-xs text-gray-400 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary-light" /> Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-primary" /> Seleccionada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100" /> Ocupada
          </span>
        </div>
      </div>

      {/* Footer fijo — sticky respecto del <main> scrolleable del shell */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">
            {seleccion.length} {seleccion.length === 1 ? 'butaca' : 'butacas'}
          </p>
          <p className="text-base font-bold text-gray-800 truncate">{formatMoneda(total)}</p>
        </div>
        <Button variant="primary" disabled={seleccion.length === 0} onClick={continuar} className="shrink-0">
          Continuar
        </Button>
      </div>
    </div>
  )
}
