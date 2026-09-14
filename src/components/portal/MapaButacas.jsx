import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { generarAsientos, formatMoneda } from '../../utils/format'

// Columna fija de grilla para cada número de butaca en las filas normales (A-J)
const COLUMNAS_POR_NUMERO = {
  20: 2, 18: 3, 16: 4,
  14: 6, 12: 7, 10: 8, 8: 9, 6: 10, 4: 11, 2: 12,
  1: 13, 3: 14, 5: 15, 7: 16, 9: 17, 11: 18, 13: 19,
  15: 21, 17: 22, 19: 23,
}

// La fila K es corrida (sin la letra en el medio), así que sus columnas van pegadas
const CORRIDA_COLUMNAS_POR_NUMERO = {
  18: 3, 16: 4, 14: 5, 12: 6, 10: 7, 8: 8, 6: 9, 4: 10, 2: 11,
}

const FILA_A_INDICE = { A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8, H: 9, I: 10, J: 11, K: 12 }

export default function MapaButacas({ evento, butacasOcupadas }) {
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState([])
  const [cantidadRuedas, setCantidadRuedas] = useState(0)

  function toggleAsiento(asiento) {
    setSeleccion((prev) =>
      prev.some((a) => a.clave === asiento.clave)
        ? prev.filter((a) => a.clave !== asiento.clave)
        : [...prev, asiento]
    )
  }

  const { precio, sillasRuedas } = evento.mapaAsientos

  const ruedasSeleccionadas = Array.from({ length: cantidadRuedas }, (_, i) => ({
    clave: `RUEDAS-${i + 1}`,
    precio,
  }))

  function cambiarRuedas(delta) {
    setCantidadRuedas((prev) => Math.min(sillasRuedas.cupo, Math.max(0, prev + delta)))
  }

  const todaLaSeleccion = [...seleccion, ...ruedasSeleccionadas]
  const total = todaLaSeleccion.reduce((acc, a) => acc + a.precio, 0)

  function continuar() {
    navigate(`/portal/eventos/${evento.id}/resumen`, {
      state: { butacasSeleccionadas: seleccion, sillasRuedasSeleccionadas: cantidadRuedas },
    })
  }

  const filas = generarAsientos(evento.mapaAsientos)

  function Butaca(asiento, gridColumn, gridRow) {
    const ocupado = butacasOcupadas.includes(asiento.clave)
    const seleccionado = seleccion.some((a) => a.clave === asiento.clave)
    return (
      <button
        key={asiento.clave}
        type="button"
        disabled={ocupado}
        onClick={() => toggleAsiento(asiento)}
        aria-label={`Butaca ${asiento.clave}`}
        style={{ gridColumn, gridRow }}
        className={`w-6 h-6 rounded-full text-[9px] flex items-center justify-center font-medium transition-colors ${
          ocupado
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : seleccionado
            ? 'bg-primary text-white'
            : 'bg-primary-light text-primary hover:bg-primary/20'
        }`}
      >
        {asiento.numero}
      </button>
    )
  }

  function Etiqueta(fila, gridColumn, gridRow) {
    return (
      <span
        key={`${fila}-${gridColumn}`}
        style={{ gridColumn, gridRow }}
        className="text-[10px] text-gray-400 flex items-center justify-center"
      >
        {fila}
      </span>
    )
  }

  const celdas = [
    <div
      key="escenario"
      style={{ gridColumn: '1 / 25', gridRow: 1 }}
      className="bg-primary-light/40 text-center text-xs font-medium text-gray-500 rounded-xl py-3 mb-2"
    >
      Escenario
    </div>,
  ]

  filas.forEach((filaData) => {
    const gridRow = FILA_A_INDICE[filaData.fila]

    if (filaData.corrida) {
      // Fila K: corrida, sin pasillo ni letra en el medio
      celdas.push(Etiqueta(filaData.fila, 1, gridRow))
      filaData.corrida.forEach((a) =>
        celdas.push(Butaca(a, CORRIDA_COLUMNAS_POR_NUMERO[a.numero], gridRow))
      )
      celdas.push(Etiqueta(filaData.fila, 12, gridRow))

      celdas.push(
        <div
          key="ruedas"
          style={{ gridColumn: '13 / 19', gridRow }}
          className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1"
        >
          <span className="leading-tight">
            Sillas de ruedas
            <br />
            Cupo: {sillasRuedas.cupo}
          </span>
          <span className="flex items-center gap-1 ml-auto shrink-0">
            <button
              type="button"
              onClick={() => cambiarRuedas(-1)}
              disabled={cantidadRuedas === 0}
              className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-500 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold text-gray-700">{cantidadRuedas}</span>
            <button
              type="button"
              onClick={() => cambiarRuedas(1)}
              disabled={cantidadRuedas >= sillasRuedas.cupo}
              className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-500 disabled:opacity-40"
            >
              +
            </button>
          </span>
        </div>
      )
      return
    }

    const [bloque1, bloque2, bloque3, bloque4] = filaData.bloques
    celdas.push(Etiqueta(filaData.fila, 1, gridRow))
    bloque1.forEach((a) => celdas.push(Butaca(a, COLUMNAS_POR_NUMERO[a.numero], gridRow)))
    celdas.push(Etiqueta(filaData.fila, 5, gridRow))
    bloque2.forEach((a) => celdas.push(Butaca(a, COLUMNAS_POR_NUMERO[a.numero], gridRow)))
    bloque3.forEach((a) => celdas.push(Butaca(a, COLUMNAS_POR_NUMERO[a.numero], gridRow)))
    celdas.push(Etiqueta(filaData.fila, 20, gridRow))
    bloque4.forEach((a) => celdas.push(Butaca(a, COLUMNAS_POR_NUMERO[a.numero], gridRow)))
    celdas.push(Etiqueta(filaData.fila, 24, gridRow))
  })

  return (
    <div>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{evento.titulo}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Elegí tus butacas · {formatMoneda(precio)} cada una
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 overflow-x-auto">
          <div
            className="grid gap-y-1.5 gap-x-1.5 w-fit"
            style={{ gridTemplateColumns: 'repeat(24, 24px)' }}
          >
            {celdas}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary-light" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" />
            Seleccionada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-100" />
            Ocupada
          </span>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">
            {todaLaSeleccion.length} {todaLaSeleccion.length === 1 ? 'butaca' : 'butacas'}
          </p>
          <p className="text-base font-bold text-gray-800 truncate">{formatMoneda(total)}</p>
        </div>
        <Button variant="primary" disabled={todaLaSeleccion.length === 0} onClick={continuar} className="shrink-0">
          Continuar
        </Button>
      </div>
    </div>
  )
}