import { iniciales } from '../../utils/format'

export default function Avatar({ nombre, size = 36, className = '' }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 bg-primary-light text-primary font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {iniciales(nombre)}
    </div>
  )
}
