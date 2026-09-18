from sqlalchemy import Column, Date, Numeric, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SueldoUsuario(Base):
    __tablename__ = "sueldo_usuario"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
    monto = Column(Numeric, nullable=False)
    vigente_desde = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    vigente_hasta = Column(Date, nullable=True)
