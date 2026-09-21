import { createContext, useState } from 'react'
import { login as apiLogin } from '../api/client'

// localStorage en vez de una cookie httpOnly: decisión consciente, no el
// estándar de oro. Una cookie httpOnly es más segura contra XSS (el JS de
// la página ni siquiera puede leerla), pero necesita configuración extra
// del lado del backend (SameSite, Secure, dominio compartido). Para el
// alcance de este proyecto (una app de facultad, no un sistema bancario)
// localStorage es razonable — ver Claude.md, "Fase 3b", si esto cambia.
export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crear_token'))
  const [rol, setRol] = useState(() => localStorage.getItem('crear_rol'))
  const [nombre, setNombre] = useState(() => localStorage.getItem('crear_nombre'))

  async function login(email, password) {
    const data = await apiLogin(email, password) // POST /login
    localStorage.setItem('crear_token', data.access_token)
    localStorage.setItem('crear_rol', data.rol)
    localStorage.setItem('crear_nombre', data.nombre)
    setToken(data.access_token); setRol(data.rol); setNombre(data.nombre)
    return data
  }

  function logout() {
    localStorage.removeItem('crear_token')
    localStorage.removeItem('crear_rol')
    localStorage.removeItem('crear_nombre')
    // No es de este contexto (vive en AlumnoActivoContext, ver "Rehidratar
    // la sesión" en Claude.md), pero es estado de la misma sesión — limpiar
    // acá evita que quede huérfano después de cerrar sesión.
    localStorage.removeItem('crear_alumno_activo_id')
    setToken(null); setRol(null); setNombre(null)
  }

  return (
    <AuthContext.Provider value={{ token, rol, nombre, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
