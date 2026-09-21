import { useState, useEffect, useContext } from 'react'
import { getCargos } from '../api/client'
import { AuthContext } from '../context/AuthContext'

export function useCargos(alumnoId) {
  const { token } = useContext(AuthContext)
  const [cargos, setCargos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getCargos(alumnoId, token)
        setCargos(data)
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [alumnoId, token])

  return { cargos, cargando, error }
}
