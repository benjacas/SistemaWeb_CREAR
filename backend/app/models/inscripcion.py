import enum

from sqlalchemy import Column, Date, ForeignKey, Enum, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class EstadoInscripcion(str, enum.Enum):
    activa = "activa"
    baja = "baja"
    suspendida = "suspendida"
    # ⚠️ solo 'activa' está confirmada como default real — el resto de
    # los valores posibles del enum de Postgres no se verificó todavía.


class Inscripcion(Base):
    __tablename__ = "inscripcion"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), nullable=False)
    grupo_clase_id = Column(UUID(as_uuid=True), ForeignKey("grupo_clase.id"), nullable=False)
    fecha_inscripcion = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    # server_default (no default= de Python) — ver Claude.md / SCHEMA.md,
    # "default vs server_default en enums".
    estado = Column(Enum(EstadoInscripcion, name="estado_inscripcion"), nullable=False, server_default=text("'activa'"))
    fecha_baja = Column(Date, nullable=True)
