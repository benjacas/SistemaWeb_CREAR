import { createContext, useState } from 'react'
import { alumnosVinculadosDemo } from '../mock/fixtures'

export const AlumnoActivoContext = createContext(null)

export function AlumnoActivoProvider({ children }) {
  const [alumnosVinculados, setAlumnosVinculados] = useState(alumnosVinculadosDemo)
  const [alumnoActivo, setAlumnoActivo] = useState(
    () => alumnosVinculadosDemo.find((a) => a.activo) ?? alumnosVinculadosDemo[0]
  )

  // Por ahora solo actualiza el mock en memoria (no hay backend todavía).
  function actualizarAlumnoActivo(cambios) {
    setAlumnoActivo((prev) => ({ ...prev, ...cambios }))
    setAlumnosVinculados((prev) => prev.map((a) => (a.id === alumnoActivo.id ? { ...a, ...cambios } : a)))
  }

  return (
    <AlumnoActivoContext.Provider
      value={{ alumnoActivo, setAlumnoActivo, alumnosVinculados, actualizarAlumnoActivo }}
    >
      {children}
    </AlumnoActivoContext.Provider>
  )
}
