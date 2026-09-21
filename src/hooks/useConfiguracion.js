import { useState, useEffect, useContext } from 'react'
import { getConfiguracion } from '../api/client'
import { AuthContext } from '../context/AuthContext'

export function useConfiguracion() {
  const { token } = useContext(AuthContext)
  const [configuracion, setConfiguracion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getConfiguracion(token)
        setConfiguracion(data)
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [token])

  return { configuracion, cargando, error }
}
