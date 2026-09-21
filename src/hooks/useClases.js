import { useState, useEffect, useContext } from 'react'
import { getClases } from '../api/client'
import { AuthContext } from '../context/AuthContext'

const DIAS_LABEL = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
}

// "Lunes y Miércoles 18:00–19:30" — agrupa por rango horario en vez de
// asumir que todos los horarios de una clase comparten el mismo (no es
// el caso en los datos de prueba, pero tampoco hay garantía general).
function formatHorarioDisplay(horarios) {
  if (!horarios.length) return ''
  const grupos = new Map()
  for (const h of horarios) {
    const clave = `${h.horaInicio}-${h.horaFin}`
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(h.diaSemana)
  }
  return [...grupos.entries()]
    .map(([rango, dias]) => {
      const [inicio, fin] = rango.split('-')
      const diasLabel = dias.map((d) => DIAS_LABEL[d] ?? d).join(' y ')
      return `${diasLabel} ${inicio}–${fin}`
    })
    .join(', ')
}

// Adapta la forma de la API (snake_case: dia_semana/hora_inicio/hora_fin)
// a la que ya esperan CalendarioMensual y las funciones de utils/format.js
// (camelCase: diaSemana/horaInicio/horaFin) — mismo shape que tenía
// misClasesDemo, así Clases.jsx/Horarios.jsx no necesitan tocar esa parte.
function adaptarClase(c) {
  const horarios = c.horarios.map((h) => ({
    diaSemana: h.dia_semana, horaInicio: h.hora_inicio, horaFin: h.hora_fin,
  }))
  return {
    id: c.id,
    nombre: c.nombre,
    nivel: c.nivel,
    profesora: c.profesora_nombre,
    horario: formatHorarioDisplay(horarios),
    horarios,
  }
}

export function useClases(alumnoId) {
  const { token } = useContext(AuthContext)
  const [clases, setClases] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getClases(alumnoId, token)
        setClases(data.map(adaptarClase))
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId, token])

  return { clases, cargando, error }
}
