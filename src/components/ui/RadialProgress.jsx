// Indicador circular de porcentaje genérico (ej. % de asistencia en el portal).
// Umbral de color alineado a `umbral_asistencia_alerta`, hoy fijo en 75.
const UMBRAL_ALERTA_DEFAULT = 75

export default function RadialProgress({ porcentaje, tamano = 96, umbral = UMBRAL_ALERTA_DEFAULT, className = '' }) {
  const clamped = Math.min(100, Math.max(0, porcentaje))
  const stroke = Math.round(tamano * 0.09)
  const radio = (tamano - stroke) / 2
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia * (1 - clamped / 100)
  const color = clamped >= umbral ? '#10b981' : '#f59e0b'

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox={`0 0 ${tamano} ${tamano}`}
      className={className}
      role="img"
      aria-label={`${clamped}%`}
    >
      <circle
        cx={tamano / 2}
        cy={tamano / 2}
        r={radio}
        fill="none"
        stroke="#EEE9FF"
        strokeWidth={stroke}
      />
      <circle
        cx={tamano / 2}
        cy={tamano / 2}
        r={radio}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circunferencia}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-800 font-semibold"
        style={{ fontSize: tamano * 0.22 }}
      >
        {clamped}%
      </text>
    </svg>
  )
}
