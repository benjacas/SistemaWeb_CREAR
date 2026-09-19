from sqlalchemy import Column, Text, Date, Numeric, ForeignKey, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Calificacion(Base):
    __tablename__ = "calificacion"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    examen_criterio_id = Column(UUID(as_uuid=True), ForeignKey("examen_criterio.id"), nullable=False)
    alumno_id = Column(UUID(as_uuid=True), ForeignKey("alumno.id"), nullable=False)
    profesora_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    nota = Column(Numeric, nullable=False)  # 1 a 10 — ver CheckConstraint abajo
    observaciones = Column(Text, nullable=True)
    fecha_carga = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    corregida_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=True)
    fecha_correccion = Column(Date, nullable=True)

    __table_args__ = (
        CheckConstraint("nota >= 1.00 AND nota <= 10.00", name="calificacion_nota_rango"),
    )
