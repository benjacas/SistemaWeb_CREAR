import { Link } from 'react-router-dom'

export default function AlertaHome({ alerta }) {
  const esAlta = alerta.urgencia === 'alta'
  const fondo = esAlta ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
  const texto = esAlta ? 'text-red-700' : 'text-amber-700'

  return (
    <div className={`rounded-2xl border p-3 flex items-center justify-between gap-3 ${fondo}`}>
      <p className={`text-xs flex-1 ${texto}`}>{alerta.mensaje}</p>
      <Link to={alerta.ctaRuta} className={`text-xs font-semibold underline shrink-0 ${texto}`}>
        {alerta.ctaLabel}
      </Link>
    </div>
  )
}
