const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getAsistencia(alumnoId, token) {
  const res = await fetch(`${API_URL}/alumnos/${alumnoId}/asistencia`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function getCargos(alumnoId, token) {
  const res = await fetch(`${API_URL}/alumnos/${alumnoId}/cargos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Email o contraseña incorrectos')
  return res.json()
}

// Adapta acá mismo (no hay un hook para este llamado — se usa directo desde
// PortalLogin/RequireRole) la forma de la API (snake_case:
// apto_fisico_presentado/apto_fisico_fecha) a la que ya espera
// estadoAptoFisico() en utils/format.js (camelCase).
export async function getMisAlumnos(token) {
  const res = await fetch(`${API_URL}/tutores/me/alumnos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  const data = await res.json()
  return data.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    apellido: a.apellido,
    aptoFisicoPresentado: a.apto_fisico_presentado,
    aptoFisicoFecha: a.apto_fisico_fecha,
  }))
}

export async function getClases(alumnoId, token) {
  const res = await fetch(`${API_URL}/alumnos/${alumnoId}/clases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function getEvaluaciones(alumnoId, token) {
  const res = await fetch(`${API_URL}/alumnos/${alumnoId}/evaluaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function getConfiguracion(token) {
  const res = await fetch(`${API_URL}/configuracion`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function getMiPerfil(token) {
  const res = await fetch(`${API_URL}/tutores/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function actualizarMiPerfil(datos, token) {
  const res = await fetch(`${API_URL}/tutores/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(datos),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
