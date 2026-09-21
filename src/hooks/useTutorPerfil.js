import { useState, useEffect, useContext } from 'react'
import { getMiPerfil, actualizarMiPerfil } from '../api/client'
import { AuthContext } from '../context/AuthContext'

export function useTutorPerfil() {
  const { token } = useContext(AuthContext)
  const [tutor, setTutor] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError(null)
      try {
        const data = await getMiPerfil(token)
        setTutor(data)
      } catch (error) {
        setError(error)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [token])

  // Persiste de verdad (PATCH real) — a diferencia del mock viejo, que solo
  // actualizaba estado en memoria y volvía al valor original al recargar.
  async function actualizarPerfil(cambios) {
    const actualizado = await actualizarMiPerfil(cambios, token)
    setTutor(actualizado)
    return actualizado
  }

  return { tutor, cargando, error, actualizarPerfil }
}
