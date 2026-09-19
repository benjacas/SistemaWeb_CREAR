from sqlalchemy import Column, Date, Boolean, ForeignKey, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Asistencia(Base):
    __tablename__ = "asistencia"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    inscripcion_id = Column(UUID(as_uuid=True), ForeignKey("inscripcion.id"), nullable=False)
    fecha = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    presente = Column(Boolean, nullable=False)
    registrado_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)

    __table_args__ = (
        CheckConstraint("fecha <= CURRENT_DATE", name="asistencia_fecha_check"),
    )
