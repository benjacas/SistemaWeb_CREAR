import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { AlumnoActivoContext } from '../context/AlumnoActivoContext'
import { getMisAlumnos } from '../api/client'
import Button from '../components/ui/Button'

export default function PortalLogin() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const { setAlumnosVinculados, setAlumnoActivo } = useContext(AlumnoActivoContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Completá todos los campos'); return }
    setLoading(true); setError('')
    try {
      const data = await login(email, password)
      // Este login es solo para tutores — si alguien de staff toca esta
      // pantalla por error, no lo mandamos a ningún lado del portal.
      if (data.rol !== 'tutor') {
        setError('Este acceso es solo para tutores, no para personal de la academia.')
        setLoading(false)
        return
      }
      const alumnos = await getMisAlumnos(data.access_token)
      setAlumnosVinculados(alumnos)
      if (alumnos.length === 1) {
        setAlumnoActivo(alumnos[0])
        navigate('/portal', { replace: true })
      } else {
        navigate('/seleccionar-alumno', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-primary-subtle p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <span className="text-white font-black text-xl font-display">C</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 font-display">CREAR</h1>
          <p className="text-gray-400 text-xs">Portal Alumno / Tutor</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Iniciar sesión</h2>
          <p className="text-gray-400 text-sm mb-5">Ingresá con el email y la contraseña de tu cuenta de tutor</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" autoComplete="email"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <Button type="submit" variant="primary" disabled={loading} className="w-full justify-center">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
