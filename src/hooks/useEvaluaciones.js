import { useState, useEffect, useContext } from 'react'
import { getEvaluaciones } from '../api/client'
import { AuthContext } from '../context/AuthContext'

// Adapta la forma de la API (snake_case: grupo_nombre/es_profesorado/
// criterio_nombre) a la que ya espera Evaluaciones.jsx y
// utils/format.js (camelCase: grupoNombre/esProfesorado/criterioNombre)
// — mismo shape que tenía evaluacionesDemo.
function adaptarEvaluacion(e) {
  return {
    id: e.id,
    titulo: e.titulo,
    grupoNombre: e.grupo_nombre,
    esProfesorado: e.es_profesorado,
    fecha: e.fecha,
    detalle: e.detalle.map((d) => ({
      criterioNombre: d.criterio_nombre, nota: d.nota, observaciones: d.observaciones,
    })),
  }
}

export function useEvaluaciones(alumnoId) {
  const { token } = useContext(AuthContext)
  const [evaluaciones, setEvaluaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getEvaluaciones(alumnoId, token)
        setEvaluaciones(data.map(adaptarEvaluacion))
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId, token])

  return { evaluaciones, cargando, error }
}
