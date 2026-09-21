import { useState, useEffect, useContext } from 'react'
import { getAsistencia } from '../api/client'
import { AuthContext } from '../context/AuthContext'

export function useAsistencias(alumnoId) {
  const { token } = useContext(AuthContext)
  const [asistencias, setAsistencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getAsistencia(alumnoId, token)
        setAsistencias(data)
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId, token])

  return { asistencias, cargando, error }
}
