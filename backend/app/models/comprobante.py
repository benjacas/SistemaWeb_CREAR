from sqlalchemy import Column, Integer, Date, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Comprobante(Base):
    __tablename__ = "comprobante"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    numero = Column(Integer, nullable=False)
    anio = Column(Integer, nullable=False)
    fecha_emision = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))
    fecha_anulacion = Column(Date, nullable=True)
    motivo_anulacion = Column(Text, nullable=True)
    emitido_por = Column(UUID(as_uuid=True), ForeignKey("usuario.id"), nullable=False)
