from sqlalchemy import Column, String, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Notificaciones(Base):
    """TABLA NUEVA, propuesta — no existía en el modelo original.

    `tipo` queda como `String` libre (no enum de Postgres) a propósito: el
    portal ya usa más valores de los que el proyecto viejo tenía
    (vencimiento/horario/evaluacion/evento/pago, ver
    utils/format.js → infoTipoNotificacion) y es más fácil sumar uno nuevo
    a un string que migrar un enum de Postgres cada vez.
    """

    __tablename__ = "notificaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), nullable=True)
    titulo = Column(String, nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String, nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    referencia_id = Column(UUID(as_uuid=True), nullable=True)
