from sqlalchemy import Column, String, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class RegistroAuditoria(Base):
    __tablename__ = "registro_auditoria"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    accion = Column(String, nullable=False)
    entidad_afectada = Column(String, nullable=False)
    entidad_id = Column(UUID(as_uuid=True), nullable=False)
    fecha_hora = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    detalle = Column(Text, nullable=True)
