from sqlalchemy import Column, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class NotificacionesLeidas(Base):
    """TABLA NUEVA, propuesta — no existía en el modelo original."""

    __tablename__ = "notificaciones_leidas"

    # PK compuesta, no hay id propio — un alumno lee una notificación una
    # sola vez.
    notificacion_id = Column(UUID(as_uuid=True), ForeignKey("notificaciones.id"), primary_key=True)
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), primary_key=True)
    fecha_lectura = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
