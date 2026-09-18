from sqlalchemy import Column, String, Text, Boolean, Numeric, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ConceptoCobro(Base):
    __tablename__ = "concepto_cobro"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    es_recurrente = Column(Boolean, nullable=False, server_default=text("false"))
    monto_sugerido = Column(Numeric, nullable=True)
    activo = Column(Boolean, nullable=False, server_default=text("true"))
