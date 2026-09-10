// Datos de ejemplo para el caso "Tutor con un solo alumno vinculado".
// Misma forma que va a tener el futuro backend (FastAPI) — ver Claude.md.

export const alumnoActivoDemo = {
  id: 'a1', nombre: 'Sofía', apellido: 'Ramírez',
}

export const familiaDemo = {
  nombre: 'Familia Ramírez',
}

export const cargosDemo = [
  { id: 'c1', concepto: 'Cuota Septiembre 2026', periodo: '2026-09', monto_final: 32000, estado: 'pendiente', fecha_vencimiento: '2026-09-10' },
  { id: 'c2', concepto: 'Cuota Agosto 2026', periodo: '2026-08', monto_final: 32000, estado: 'pagado', fecha_pago: '2026-08-08' },
  { id: 'c3', concepto: 'Cuota Julio 2026', periodo: '2026-07', monto_final: 28000, estado: 'pagado', fecha_pago: '2026-07-09' },
  { id: 'c4', concepto: 'Matrícula Anual 2026', periodo: '2026-03', monto_final: 15000, estado: 'pagado', fecha_pago: '2026-03-01' },
  // casos para probar badges que el mockup no muestra — no pertenecen al relato de "Sofía", son solo de prueba visual
  { id: 'c5', concepto: 'Cuota Junio 2026 (demo vencida)', periodo: '2026-06', monto_final: 28000, estado: 'pendiente', fecha_vencimiento: '2026-06-10' },
  { id: 'c6', concepto: 'Cuota Mayo 2026 (demo parcial)', periodo: '2026-05', monto_final: 28000, estado: 'parcial', fecha_vencimiento: '2026-05-10' },
]

export const asistenciasDemo = [
  { id: 'as1', grupo: 'Danza Clásica', fecha: '2026-09-03', presente: true },
  { id: 'as2', grupo: 'Danza Clásica', fecha: '2026-09-08', presente: true },
  { id: 'as3', grupo: 'Danza Clásica', fecha: '2026-09-10', presente: true },
  { id: 'as4', grupo: 'Danza Clásica', fecha: '2026-09-15', presente: false },
  { id: 'as5', grupo: 'Danza Clásica', fecha: '2026-09-17', presente: true },
  { id: 'as6', grupo: 'Danza Clásica', fecha: '2026-09-22', presente: true },
]

export const proximoEventoDemo = {
  titulo: 'Gala Anual CREAR', fecha: '2026-09-30', diasRestantes: 13,
}

export const horariosResumenDemo = { cantidadPorSemana: 3 }
