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
    # clock_timestamp(), no now() — corregido en la Fase B6 contra
    # schema_original_supabase.sql (la Fase B5 solo había corregido este
    # mismo error en configuracion_sistema.actualizado_en, asumiendo sin
    # confirmar que acá sí correspondía now() — el archivo original
    # muestra que también es clock_timestamp() acá).
    fecha_hora = Column(DateTime(timezone=True), nullable=False, server_default=text("clock_timestamp()"))
    detalle = Column(Text, nullable=True)
