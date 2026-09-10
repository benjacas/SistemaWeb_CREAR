import { createContext, useState } from 'react'
import { alumnoActivoDemo } from '../mock/fixtures'

export const AlumnoActivoContext = createContext(null)

export function AlumnoActivoProvider({ children }) {
  const [alumnoActivo, setAlumnoActivo] = useState(alumnoActivoDemo)
  const [alumnosVinculados] = useState([alumnoActivoDemo])

  return (
    <AlumnoActivoContext.Provider value={{ alumnoActivo, setAlumnoActivo, alumnosVinculados }}>
      {children}
    </AlumnoActivoContext.Provider>
  )
}
