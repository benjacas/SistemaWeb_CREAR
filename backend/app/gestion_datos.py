"""Funciones reutilizables para dar de alta datos reales — no un script de
una sola corrida. Cada función hace una cosa y devuelve el objeto ya
guardado con su id real, así se puede encadenar sin copiar UUIDs a mano:

    grupo = crear_grupo_clase(db, disciplina.id, ...)

Ver app/cargar_datos_reales.py para el archivo donde se usan.
"""
from app.db.session import SessionLocal
from app.models.usuario import Usuario
from app.models.disciplina import Disciplina
from app.models.grupo_clase import GrupoClase
from app.models.alumno import Alumno
from app.models.inscripcion import Inscripcion
from app.models.padre_tutor import PadreTutor
from app.models.alumno_tutor import AlumnoTutor
from app.models.concepto_cobro import ConceptoCobro
from app.models.cargo import Cargo
from app.models.pago import Pago
from app.models.comprobante import Comprobante
from app.models.asistencia import Asistencia
from app.models.grupo_clase_horario import GrupoClaseHorario
from app.models.criterio_evaluacion import CriterioEvaluacion
from app.models.examen import Examen
from app.models.examen_criterio import ExamenCriterio
from app.models.calificacion import Calificacion
from app.models.configuracion_sistema import ConfiguracionSistema
from app.core.security import hash_password


def crear_usuario(db, nombre, apellido, email, rol):
    u = Usuario(nombre=nombre, apellido=apellido, email=email, rol=rol)
    db.add(u); db.commit(); db.refresh(u)
    return u


def crear_disciplina(db, nombre, arancel_base=None, tiene_profesorado=False):
    d = Disciplina(nombre=nombre, arancel_base=arancel_base, tiene_profesorado=tiene_profesorado)
    db.add(d); db.commit(); db.refresh(d)
    return d


def crear_grupo_clase(db, disciplina_id, nivel, profesora_id, nombre_display=None, arancel_mensual=None, es_profesorado=False):
    g = GrupoClase(disciplina_id=disciplina_id, nivel=nivel, profesora_id=profesora_id,
                    nombre_display=nombre_display, arancel_mensual=arancel_mensual, es_profesorado=es_profesorado)
    db.add(g); db.commit(); db.refresh(g)
    return g


def crear_alumno(db, nombre, apellido, dni, fecha_nacimiento, apto_fisico_presentado=False, apto_fisico_fecha=None):
    a = Alumno(nombre=nombre, apellido=apellido, dni=dni, fecha_nacimiento=fecha_nacimiento,
               apto_fisico_presentado=apto_fisico_presentado, apto_fisico_fecha=apto_fisico_fecha)
    db.add(a); db.commit(); db.refresh(a)
    return a


def inscribir(db, alumno_id, grupo_clase_id):
    i = Inscripcion(alumno_id=alumno_id, grupo_clase_id=grupo_clase_id)
    db.add(i); db.commit(); db.refresh(i)
    return i


def crear_padre_tutor(db, nombre, apellido, email, telefono=None, parentesco=None):
    t = PadreTutor(nombre=nombre, apellido=apellido, email=email, telefono=telefono, parentesco=parentesco)
    db.add(t); db.commit(); db.refresh(t)
    return t


def vincular_tutor_alumno(db, padre_tutor_id, alumno_id):
    v = AlumnoTutor(padre_tutor_id=padre_tutor_id, alumno_id=alumno_id)
    db.add(v); db.commit(); db.refresh(v)
    return v


# ── A partir de acá, funciones para dar historial a un alumno (asistencia,
# cargos, pagos) — necesarias para que Asistencia/Pagos muestren algo
# distinto de "vacío" al cargar a alguien nuevo. Mismo criterio: una función
# por entidad, devuelve el objeto guardado con su id real.

def crear_concepto_cobro(db, nombre, es_recurrente=False, monto_sugerido=None):
    c = ConceptoCobro(nombre=nombre, es_recurrente=es_recurrente, monto_sugerido=monto_sugerido)
    db.add(c); db.commit(); db.refresh(c)
    return c


def registrar_asistencia(db, inscripcion_id, fecha, presente, registrado_por):
    a = Asistencia(inscripcion_id=inscripcion_id, fecha=fecha, presente=presente, registrado_por=registrado_por)
    db.add(a); db.commit(); db.refresh(a)
    return a


def crear_cargo(db, alumno_id, concepto_cobro_id, monto_final, estado="pendiente",
                 periodo=None, fecha_vencimiento=None, generado_por=None):
    c = Cargo(alumno_id=alumno_id, concepto_cobro_id=concepto_cobro_id, periodo=periodo,
              monto_original=monto_final, monto_final=monto_final, estado=estado,
              fecha_vencimiento=fecha_vencimiento, generado_por=generado_por)
    db.add(c); db.commit(); db.refresh(c)
    return c


def crear_comprobante(db, numero, anio, emitido_por):
    c = Comprobante(numero=numero, anio=anio, emitido_por=emitido_por)
    db.add(c); db.commit(); db.refresh(c)
    return c


def registrar_pago(db, cargo_id, fecha_pago, monto, metodo, registrado_por, comprobante_id=None):
    p = Pago(cargo_id=cargo_id, fecha_pago=fecha_pago, monto=monto, metodo=metodo,
             registrado_por=registrado_por, comprobante_id=comprobante_id)
    db.add(p); db.commit(); db.refresh(p)
    return p


def crear_horario_clase(db, grupo_clase_id, dia_semana, hora_inicio, hora_fin):
    h = GrupoClaseHorario(grupo_clase_id=grupo_clase_id, dia_semana=dia_semana, hora_inicio=hora_inicio, hora_fin=hora_fin)
    db.add(h); db.commit(); db.refresh(h)
    return h


def crear_criterio(db, nombre, descripcion=None):
    c = CriterioEvaluacion(nombre=nombre, descripcion=descripcion)
    db.add(c); db.commit(); db.refresh(c)
    return c


def crear_examen(db, grupo_clase_id, fecha, descripcion=None):
    e = Examen(grupo_clase_id=grupo_clase_id, fecha=fecha, descripcion=descripcion)
    db.add(e); db.commit(); db.refresh(e)
    return e


def agregar_criterio_a_examen(db, examen_id, criterio_id, orden=None):
    ec = ExamenCriterio(examen_id=examen_id, criterio_id=criterio_id, orden=orden)
    db.add(ec); db.commit(); db.refresh(ec)
    return ec


def calificar(db, examen_criterio_id, alumno_id, profesora_id, nota, observaciones=None):
    c = Calificacion(examen_criterio_id=examen_criterio_id, alumno_id=alumno_id,
                      profesora_id=profesora_id, nota=nota, observaciones=observaciones)
    db.add(c); db.commit(); db.refresh(c)
    return c


def crear_configuracion_inicial(db):
    """`configuracion_sistema` es una fila única de sistema, no un alta
    puntual — a diferencia del resto de este archivo, esta función SÍ es
    idempotente a propósito (no tiene sentido una segunda fila). Nada en
    el proyecto crea esta fila todavía (ni una migración, ni este script
    hasta ahora) — sin ella, GET /configuracion no tiene qué devolver.
    Todos los campos quedan en su server_default (ver el modelo)."""
    existente = db.query(ConfiguracionSistema).first()
    if existente:
        return existente
    c = ConfiguracionSistema()
    db.add(c); db.commit(); db.refresh(c)
    return c


def establecer_password(db, modelo, id, password_plano):
    obj = db.query(modelo).filter(modelo.id == id).first()
    obj.password_hash = hash_password(password_plano)
    db.commit()
    return obj
