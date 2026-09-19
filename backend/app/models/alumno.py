import enum

from sqlalchemy import Column, String, Date, Boolean, ForeignKey, Enum, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class EstadoAlumno(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"
    baja = "baja"  # ⚠️ valores no confirmados contra la base real más allá de 'activo' (el default) — verificar


class Alumno(Base):
    __tablename__ = "alumno"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    dni = Column(String, nullable=False, unique=True)
    datos_medicos = Column(String, nullable=True)  # dato sensible — nunca loguear, nunca exponer sin necesidad explícita
    telefono_contacto = Column(String, nullable=True)
    autorizacion_imagen = Column(Boolean, nullable=False, server_default=text("false"))
    apto_fisico_presentado = Column(Boolean, nullable=False, server_default=text("false"))
    apto_fisico_fecha = Column(Date, nullable=True)
    grupo_familiar_id = Column(UUID(as_uuid=True), ForeignKey("grupo_familiar.id"), nullable=True)
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    estado = Column(Enum(EstadoAlumno, name="estado_alumno"), nullable=False, server_default=text("'activo'"))
    # password_hash: NO agregar todavía — pendiente de confirmar con la compañera (ver CLAUDE.md)

    __table_args__ = (
        CheckConstraint("fecha_nacimiento < CURRENT_DATE", name="alumno_fecha_nacimiento_check"),
    )
