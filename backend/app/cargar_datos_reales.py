"""Acá se cargan los datos reales — editable, no idempotente.

Cada corrida representa altas reales, no un reset: agregar líneas para
gente nueva y correr de nuevo, no hace falta borrar lo que ya está.

Uso: docker compose exec api python -m app.cargar_datos_reales

Ver "Datos de prueba disponibles" en Claude.md para la lista de quién
quedó cargado y con qué DNI/tutor, así no hay que ir a buscarlo a la base.
"""
from datetime import time

from app.db.session import SessionLocal
from app.gestion_datos import (
    crear_usuario, crear_disciplina, crear_grupo_clase, crear_alumno, inscribir,
    crear_padre_tutor, vincular_tutor_alumno,
    crear_concepto_cobro, registrar_asistencia, crear_cargo, crear_comprobante, registrar_pago,
    crear_horario_clase,
    crear_criterio, crear_examen, agregar_criterio_a_examen, calificar,
    crear_configuracion_inicial,
)

db = SessionLocal()

crear_configuracion_inicial(db)

profesora = crear_usuario(db, "Lorena", "Cosanelli", "lorena@crear.com", rol="profesor")
disciplina = crear_disciplina(db, "Danza Clásica", arancel_base=32000)
# es_profesorado=True — Evaluaciones.jsx solo muestra exámenes de grupos de
# profesorado ("las clases recreativas no tienen evaluación formal"), hace
# falta para que las calificaciones cargadas más abajo lleguen a mostrarse.
grupo = crear_grupo_clase(db, disciplina.id, nivel="Intermedio", profesora_id=profesora.id,
                           arancel_mensual=32000, es_profesorado=True)
cuota_mensual = crear_concepto_cobro(db, "Cuota mensual", es_recurrente=True, monto_sugerido=32000)

# Horarios de Danza Clásica — lunes y miércoles, mismo horario que usaba el
# mock (misClasesDemo) para poder comparar visualmente.
crear_horario_clase(db, grupo.id, dia_semana="lunes", hora_inicio=time(18, 0), hora_fin=time(19, 30))
crear_horario_clase(db, grupo.id, dia_semana="miercoles", hora_inicio=time(18, 0), hora_fin=time(19, 30))

# Segundo grupo, disciplina distinta — para que el calendario de al menos
# una alumna muestre más de una clase (se inscribe a Valentina más abajo),
# no una sola clase en un solo día como quedaba con un único grupo.
disciplina_jazz = crear_disciplina(db, "Jazz", arancel_base=30000)
grupo_jazz = crear_grupo_clase(db, disciplina_jazz.id, nivel="Inicial", profesora_id=profesora.id, arancel_mensual=30000)
crear_horario_clase(db, grupo_jazz.id, dia_semana="viernes", hora_inicio=time(17, 0), hora_fin=time(18, 0))

# ── Tutor A — caso simple: una sola alumna vinculada, login va directo a
# su perfil sin necesidad de selector.
tutor_a = crear_padre_tutor(db, "Marcela", "Gómez", "marcela.gomez@example.com",
                             telefono="351-555-1001", parentesco="madre")

# Apto físico vigente (presentado hace poco, dentro del plazo real de
# configuracion_sistema.plazo_dias_apto_fisico) — el caso "al día".
sofia = crear_alumno(db, "Sofía", "Ramírez", dni="45123456", fecha_nacimiento="2014-03-10",
                      apto_fisico_presentado=True, apto_fisico_fecha="2026-09-05")
inscripcion_sofia = inscribir(db, sofia.id, grupo.id)
vincular_tutor_alumno(db, tutor_a.id, sofia.id)

# Sofía: buena asistencia (6/6) y al día con la cuota — el caso "todo bien".
for fecha in ["2026-09-01", "2026-09-03", "2026-09-08", "2026-09-10", "2026-09-15", "2026-09-17"]:
    registrar_asistencia(db, inscripcion_sofia.id, fecha, presente=True, registrado_por=profesora.id)

cargo_sofia = crear_cargo(db, sofia.id, cuota_mensual.id, monto_final=32000, estado="pagado",
                           periodo="2026-09", generado_por=profesora.id)
comprobante_sofia = crear_comprobante(db, numero=101, anio=2026, emitido_por=profesora.id)
registrar_pago(db, cargo_sofia.id, fecha_pago="2026-09-05", monto=32000, metodo="mercadopago",
               registrado_por=profesora.id, comprobante_id=comprobante_sofia.id)

# ── Tutor B — caso con selector: dos alumnas vinculadas (hermanas), cada
# una con un perfil bien distinto para que cambiar de alumna se note.
tutor_b = crear_padre_tutor(db, "Diego", "Torres", "diego.torres@example.com",
                             telefono="351-555-1002", parentesco="padre")

# Valentina: asistencia por debajo del umbral (3/6 = 50%) y un cargo
# pendiente con vencimiento pasado — el caso "hay que prestarle atención".
# También va a Jazz además de Danza Clásica, para que su calendario tenga
# más de una clase (a diferencia de Sofía y Martina, que solo tienen una).
# Apto físico: nunca lo presentó (default) — tercer caso, distinto de sus
# hermanas, para probar las 3 ramas de estadoAptoFisico() en Perfil.jsx.
valentina = crear_alumno(db, "Valentina", "Torres", dni="45789012", fecha_nacimiento="2015-07-22")
inscripcion_valentina = inscribir(db, valentina.id, grupo.id)
inscribir(db, valentina.id, grupo_jazz.id)
vincular_tutor_alumno(db, tutor_b.id, valentina.id)

asistencia_valentina = [
    ("2026-09-01", False), ("2026-09-03", True), ("2026-09-08", False),
    ("2026-09-10", True), ("2026-09-15", False), ("2026-09-17", True),
]
for fecha, presente in asistencia_valentina:
    registrar_asistencia(db, inscripcion_valentina.id, fecha, presente=presente, registrado_por=profesora.id)

crear_cargo(db, valentina.id, cuota_mensual.id, monto_final=32000, estado="pendiente",
            periodo="2026-08", fecha_vencimiento="2026-08-10", generado_por=profesora.id)

# Martina (hermana de Valentina): asistencia buena (5/6) pero cuota pagada
# solo a medias — el caso "parcial", distinto de los otros dos. Apto físico
# presentado pero ya vencido (fecha vieja) — segundo de los 3 casos.
martina = crear_alumno(db, "Martina", "Torres", dni="45789013", fecha_nacimiento="2017-11-05",
                        apto_fisico_presentado=True, apto_fisico_fecha="2026-06-01")
inscripcion_martina = inscribir(db, martina.id, grupo.id)
vincular_tutor_alumno(db, tutor_b.id, martina.id)

asistencia_martina = [
    ("2026-09-01", True), ("2026-09-03", True), ("2026-09-08", False),
    ("2026-09-10", True), ("2026-09-15", True), ("2026-09-17", True),
]
for fecha, presente in asistencia_martina:
    registrar_asistencia(db, inscripcion_martina.id, fecha, presente=presente, registrado_por=profesora.id)

cargo_martina = crear_cargo(db, martina.id, cuota_mensual.id, monto_final=32000, estado="parcial",
                             periodo="2026-09", generado_por=profesora.id)
registrar_pago(db, cargo_martina.id, fecha_pago="2026-09-12", monto=15000, metodo="transferencia",
               registrado_por=profesora.id)

# ── Evaluaciones — 1 examen sobre Danza Clásica (donde están Sofía y
# Martina, no Valentina), mismos nombres de criterio que ya usaba el mock
# para poder comparar visualmente. Notas distintas entre las dos alumnas
# a propósito — si vieran lo mismo, la prueba no confirma nada.
criterio_expresion = crear_criterio(db, "Expresión")
criterio_ritmo = crear_criterio(db, "Ritmo")
criterio_tecnica = crear_criterio(db, "Técnica")

examen_final = crear_examen(db, grupo.id, fecha="2026-09-01", descripcion="Examen Final 2026")
ec_expresion = agregar_criterio_a_examen(db, examen_final.id, criterio_expresion.id, orden=1)
ec_ritmo = agregar_criterio_a_examen(db, examen_final.id, criterio_ritmo.id, orden=2)
ec_tecnica = agregar_criterio_a_examen(db, examen_final.id, criterio_tecnica.id, orden=3)

calificar(db, ec_expresion.id, sofia.id, profesora.id, nota=9, observaciones=None)
calificar(db, ec_ritmo.id, sofia.id, profesora.id, nota=8, observaciones="Mejoró mucho el timing")
calificar(db, ec_tecnica.id, sofia.id, profesora.id, nota=9, observaciones=None)

calificar(db, ec_expresion.id, martina.id, profesora.id, nota=7, observaciones=None)
calificar(db, ec_ritmo.id, martina.id, profesora.id, nota=6.5, observaciones="Todavía le cuesta seguir el compás")
calificar(db, ec_tecnica.id, martina.id, profesora.id, nota=7.5, observaciones=None)

print("Listo")
print(f"sofia.id     = {sofia.id}     (Tutor A: Marcela Gómez — 1 alumna)")
print(f"valentina.id = {valentina.id} (Tutor B: Diego Torres — asistencia baja, cargo vencido)")
print(f"martina.id   = {martina.id}   (Tutor B: Diego Torres — cargo parcial)")
db.close()
